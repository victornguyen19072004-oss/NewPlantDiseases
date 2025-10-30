"use client"

import { Moon, Sun, Github } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  isDark: boolean
  toggleTheme: () => void
}

export default function Header({ isDark, toggleTheme }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">🌿</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Plant Disease Detector</h1>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link
            href="/eda"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            EDA
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Github size={20} />
            <span className="hidden sm:inline text-sm font-medium">GitHub</span>
          </a>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
