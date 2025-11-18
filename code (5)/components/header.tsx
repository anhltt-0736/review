"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (token && user) {
      setIsAuthenticated(true)
      setUsername(JSON.parse(user).username)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    router.push("/")
  }

  return (
    <header className="border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Nexus
        </Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
            <span className="text-sm text-muted-foreground">Welcome, {username}</span>
              <Link href="/favorites" className="text-sm text-foreground hover:text-primary transition">
                Favorites
              </Link>
              <Link href="/following" className="text-sm text-foreground hover:text-primary transition">
                Following
              </Link>
              <Link href="/settings" className="text-sm text-foreground hover:text-primary transition">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1 border border-border rounded hover:bg-muted transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-foreground hover:text-primary transition">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
