"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, Loader2, User, Sparkles, RefreshCw } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

type AppStats = {
  total: number
  applied: number
  interviewing: number
  offer: number
  rejected: number
  methods: Record<string, number>
  avgResponseDays: number | null
  topCompanies: string[]
  followUpsPending: number
}

async function fetchApplicationStats(): Promise<AppStats | null> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) return null

  const { data: apps } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)

  if (!apps || apps.length === 0) return null

  const stats: AppStats = {
    total: apps.length,
    applied: apps.filter((a) => a.status === "Applied").length,
    interviewing: apps.filter((a) => a.status === "Interviewing").length,
    offer: apps.filter((a) => a.status === "Offer").length,
    rejected: apps.filter((a) => a.status === "Rejected").length,
    methods: {},
    avgResponseDays: null,
    topCompanies: apps.slice(0, 5).map((a) => a.company_name),
    followUpsPending: apps.filter((a) => a.follow_up_required).length,
  }

  for (const app of apps) {
    const method = app.application_method || "Other"
    stats.methods[method] = (stats.methods[method] || 0) + 1
  }

  // Estimate avg response days from follow_up_date vs application_date
  const withDates = apps.filter((a) => a.application_date && a.follow_up_date)
  if (withDates.length > 0) {
    const totalDays = withDates.reduce((sum, a) => {
      const applied = new Date(a.application_date).getTime()
      const followUp = new Date(a.follow_up_date).getTime()
      return sum + Math.abs((followUp - applied) / (1000 * 60 * 60 * 24))
    }, 0)
    stats.avgResponseDays = Math.round(totalDays / withDates.length)
  }

  return stats
}

function buildSystemPrompt(stats: AppStats | null): string {
  if (!stats) {
    return `You are an expert career coach and job search strategist. The user hasn't connected their data yet, so give general job search advice. Be concise, actionable, and encouraging. Use bullet points where helpful.`
  }

  const methodsSummary = Object.entries(stats.methods)
    .map(([m, c]) => `${m}: ${c}`)
    .join(", ")

  return `You are an expert career coach analyzing a user's real job search data. Here is their current status:

- Total Applications: ${stats.total}
- Applied (awaiting): ${stats.applied}
- Interviewing: ${stats.interviewing}
- Offers received: ${stats.offer}
- Rejected: ${stats.rejected}
- Application methods used: ${methodsSummary}
- Follow-ups pending: ${stats.followUpsPending}
- Recent companies: ${stats.topCompanies.join(", ")}
${stats.avgResponseDays ? `- Avg days to follow-up: ${stats.avgResponseDays}` : ""}

Using this data, give specific, actionable, data-driven career advice. Point out patterns, suggest improvements, and be encouraging. Keep responses concise and use bullet points where helpful. Reference their actual numbers when relevant.`
}

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <div key={i} className="h-1" />

    if (line.match(/^#{1,3}\s/)) {
      return <p key={i} className="font-semibold text-green-300 mt-2 mb-0.5">{renderInline(line.replace(/^#{1,3}\s/, ""))}</p>
    }
    if (line.match(/^\s*[-*]\s/)) {
      const indented = (line.match(/^(\s+)/)?.[1].length || 0) > 0
      return (
        <div key={i} className={`flex items-start gap-2 ${indented ? "ml-4" : ""}`}>
          <span className="text-green-400 mt-0.5 shrink-0 text-xs">•</span>
          <span>{renderInline(line.replace(/^\s*[-*]\s/, ""))}</span>
        </div>
      )
    }
    if (line.match(/^\s*\d+\.\s/)) {
      const num = line.match(/^\s*(\d+)\./)?.[1]
      return (
        <div key={i} className="flex items-start gap-2">
          <span className="text-green-400 shrink-0 font-medium text-xs">{num}.</span>
          <span>{renderInline(line.replace(/^\s*\d+\.\s/, ""))}</span>
        </div>
      )
    }
    return <p key={i}>{renderInline(line)}</p>
  })
}

const SUGGESTED_PROMPTS = [
  "How is my job search going overall?",
  "Which application method is working best for me?",
  "How many follow-ups do I need to do?",
  "What should I focus on this week?",
  "Am I applying to enough jobs?",
]

export function AiCareerInsights() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AppStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchApplicationStats().then((s) => {
      setStats(s)
      setStatsLoading(false)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: "user", content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_CHATANYWHERE_API_URL ||
          "https://api.chatanywhere.tech/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CHATANYWHERE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: buildSystemPrompt(stats) },
              ...newMessages,
            ],
            temperature: 0.7,
            max_tokens: 600,
          }),
        }
      )

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response."
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Failed to connect to AI. Check your API key in `.env.local`.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => setMessages([])

  return (
    <div className="flex flex-col h-[600px] border border-green-300/30 rounded-lg bg-green-900/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-green-300/20 bg-green-900/20">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-green-400" />
          <span className="text-sm font-semibold text-white">AI Career Coach</span>
          {!statsLoading && (
            <span className="text-xs text-green-400/60 ml-1">
              {stats ? `• ${stats.total} apps loaded` : "• No data connected"}
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-green-400/60 hover:text-green-400 hover:bg-green-500/10 text-xs gap-1"
            onClick={clearChat}
          >
            <RefreshCw className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-green-500/20">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-green-400" />
              </div>
              <div className="bg-green-900/30 border border-green-300/20 rounded-lg rounded-tl-none px-4 py-3 text-sm text-green-100/80 max-w-[85%]">
                {statsLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading your data...
                  </span>
                ) : stats ? (
                  <>
                    👋 Hi! I've loaded your job search data — <strong>{stats.total} applications</strong>,{" "}
                    <strong>{stats.interviewing} interviews</strong>, and{" "}
                    <strong>{stats.offer} offers</strong>. Ask me anything about your search!
                  </>
                ) : (
                  <>
                    👋 Hi! I'm your AI career coach. I couldn't load your application data, but I can still give you general job search advice. What would you like to know?
                  </>
                )}
              </div>
            </div>

            {/* Suggested prompts */}
            <div className="ml-10 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-xs px-3 py-1.5 rounded-full border border-green-500/30 text-green-400/80 hover:bg-green-500/10 hover:text-green-300 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === "user"
                    ? "bg-green-600/30"
                    : "bg-green-500/20"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4 text-green-300" />
                ) : (
                  <Bot className="h-4 w-4 text-green-400" />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-lg text-sm max-w-[85%] leading-relaxed space-y-0.5 ${
                  msg.role === "user"
                    ? "bg-green-600/20 border border-green-500/30 text-white rounded-tr-none"
                    : "bg-green-900/30 border border-green-300/20 text-green-100/80 rounded-tl-none"
                }`}
              >
                {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="h-7 w-7 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-green-400" />
            </div>
            <div className="bg-green-900/30 border border-green-300/20 rounded-lg rounded-tl-none px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-green-300/20 bg-green-900/20">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your job search... (Enter to send)"
            className="min-h-[44px] max-h-[120px] resize-none bg-green-900/30 border-green-300/30 text-white placeholder:text-green-300/30 focus:border-green-400 focus:ring-green-400/20 text-sm"
            rows={1}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-500 text-white h-[44px] w-[44px] p-0 shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
