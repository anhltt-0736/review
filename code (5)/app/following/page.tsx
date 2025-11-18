"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import Header from "@/components/header"
import type { StoredUser } from "@/types/user"
import { getFollowing, toggleFollowing } from "@/lib/local-prefs"

export default function FollowingPage() {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [following, setFollowing] = useState<string[]>([])

  useEffect(() => {
    const storedUser = window.localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        setUser(null)
      }
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setFollowing([])
      return
    }

    setFollowing(getFollowing(user.id))
  }, [user])

  const handleUnfollow = (username: string) => {
    if (!user) {
      return
    }

    const next = toggleFollowing(user.id, username)
    setFollowing(next)
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Following</h1>
          <Link href="/" className="text-sm text-accent hover:underline">
            Browse articles
          </Link>
        </div>

        {!user ? (
          <div className="text-center py-14 border border-dashed border-border rounded-lg">
            <p className="text-lg font-medium">Sign in to follow writers you love.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Follow authors from the article page and manage your list here.
            </p>
          </div>
        ) : following.length === 0 ? (
          <div className="text-center py-14 border border-border rounded-lg">
            <p className="text-lg font-medium">You are not following anyone yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Head back to an article and tap “Follow” to keep their work in reach.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {following.map((username) => (
              <div key={username} className="border border-border rounded-xl p-6 bg-card flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{username}</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
                <button
                  onClick={() => handleUnfollow(username)}
                  className="px-3 py-1 text-sm text-foreground border border-border rounded-md hover:bg-muted transition"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
