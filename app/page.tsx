"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Rocket, Star, CheckCircle, BarChart3, Calendar } from "lucide-react"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.2,
              animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <Rocket className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-5xl md:text-6xl font-bold">Career Orbit</h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Navigate your job search journey through the cosmos with our powerful application tracking system
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="glass-card cosmic-glow p-8 rounded-2xl mb-16 max-w-4xl w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Track Applications</h3>
                  <p className="text-muted-foreground">
                    Keep all your job applications organized in one place with our intuitive interface
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Calendar className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Manage Interviews</h3>
                  <p className="text-muted-foreground">
                    Never miss an interview with our calendar integration and reminders
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <BarChart3 className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Visualize Progress</h3>
                  <p className="text-muted-foreground">
                    Get insights into your job search with beautiful charts and analytics
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Document Management</h3>
                  <p className="text-muted-foreground">
                    Store and organize your resumes, cover letters, and other documents
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Contact Tracking</h3>
                  <p className="text-muted-foreground">Keep track of recruiters, hiring managers, and other contacts</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Status Updates</h3>
                  <p className="text-muted-foreground">Track the status of each application from applied to offer</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center"
        >
          <Button asChild size="lg" className="text-lg px-8 py-6 h-auto cosmic-glow">
            <Link href="/login">
              Get Started
              <Rocket className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-4 text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
