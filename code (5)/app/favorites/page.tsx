"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import Header from "@/components/header"
import type { Article } from "@/types/article"
import type { StoredUser } from "@/types/user"
import { getFavorites, toggleFavorite } from "@/lib/local-prefs"

export default function FavoritesPage() {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const storedUser = window.localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        setUser(null)
      }
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      return
    }
    setFavoriteSlugs(getFavorites(user.id))
  }, [user])

  useEffect(() => {
    if (!user) {
      setArticles([])
      setError("")
      setLoading(false)
      return
    }

    if (favoriteSlugs.length === 0) {
      setArticles([])
      setError("")
      setLoading(false)
      return
    }

    const controller = new AbortController()

    const loadFavorites = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetch("http://localhost:3001/api/articles", {
          signal: controller.signal,
        })
        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load favorites")
        }

        const allArticles: Article[] = payload?.data ?? []
        const filtered = allArticles.filter((article) => favoriteSlugs.includes(article.slug))
        setArticles(filtered)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError((err as Error).message || "Unable to load favorites")
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadFavorites()

    return () => controller.abort()
  }, [favoriteSlugs, user])

  const handleRemoveFavorite = (slug: string) => {
    if (!user) {
      return
    }

    const next = toggleFavorite(user.id, slug)
    setFavoriteSlugs(next)
    setArticles((prev) => prev.filter((article) => article.slug !== slug))
  }

  const formattedArticles = useMemo(() => {
    return articles.map((article) => ({
      ...article,
      formattedDate: new Date(article.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }))
  }, [articles])

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Favorites</h1>
          <Link href="/" className="text-sm text-accent hover:underline">
            Browse articles
          </Link>
        </div>

        {!user ? (
          <div className="text-center py-14 border border-dashed border-border rounded-lg">
            <p className="text-lg font-medium">Sign in to save favorite articles.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Favorites are synced to your browser.{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign In
              </Link>{" "}
              or{" "}
              <Link href="/signup" className="text-accent hover:underline">
                create an account
              </Link>{" "}
              to get started.
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-14">
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : favoriteSlugs.length === 0 ? (
          <div className="text-center py-14 border border-border rounded-lg">
            <p className="text-lg font-medium">No favorites yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Save articles you love to revisit them anytime.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {formattedArticles.map((article) => (
              <div key={article.slug} className="border border-border rounded-xl p-6 bg-card space-y-3">
                <div>
                  <Link href={`/article/${article.slug}`} className="text-2xl font-semibold text-foreground hover:underline">
                    {article.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{`${article.author.username} · ${article.formattedDate}`}</p>
                </div>
                <p className="text-muted-foreground">{article.description}</p>
                <div className="flex items-center justify-between">
                  <Link href={`/article/${article.slug}`} className="text-sm text-accent hover:underline">
                    Read article
                  </Link>
                  <button
                    onClick={() => handleRemoveFavorite(article.slug)}
                    className="text-sm text-red-600 border border-red-200 rounded-md px-3 py-1 hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
