"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import Header from "@/components/header"
import type { Article } from "@/types/article"
import type { StoredUser } from "@/types/user"
import { getFavorites, getFollowing, toggleFavorite, toggleFollowing } from "@/lib/local-prefs"

interface ArticleRouteProps {
  params: {
    slug: string
  }
}

export default function ArticleDetailPage({ params }: ArticleRouteProps) {
  const { slug } = params
  const router = useRouter()

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<StoredUser | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

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
    const fetchArticle = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetch(`http://localhost:3001/api/articles/${slug}`)
        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(payload?.message || "Article not found")
        }

        setArticle(payload?.data ?? null)
      } catch (err) {
        setError((err as Error).message || "Unable to load article")
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  useEffect(() => {
    if (!article || !user) {
      setIsFavorite(false)
      setIsFollowing(false)
      return
    }

    setIsFavorite(getFavorites(user.id).includes(article.slug))
    setIsFollowing(getFollowing(user.id).includes(article.author.username))
  }, [article, user])

  const handleFavoriteToggle = () => {
    if (!user || !article) {
      router.push("/login")
      return
    }

    const nextFavorites = toggleFavorite(user.id, article.slug)
    setIsFavorite(nextFavorites.includes(article.slug))
  }

  const handleFollowToggle = () => {
    if (!user || !article) {
      router.push("/login")
      return
    }

    const nextFollowing = toggleFollowing(user.id, article.author.username)
    setIsFollowing(nextFollowing.includes(article.author.username))
  }

  const formattedDate = useMemo(() => {
    if (!article) {
      return ""
    }
    return new Date(article.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [article])

  const bodyParagraphs = useMemo(() => {
    if (!article) {
      return []
    }

    return article.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
  }, [article])

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
            <Link href="/" className="text-sm text-accent hover:underline">
              Return to home
            </Link>
          </div>
        ) : article ? (
          <article className="space-y-8">
            <div>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
              <h1 className="text-4xl font-bold mt-2 text-balance">{article.title}</h1>
              <p className="text-lg text-muted-foreground mt-2">{article.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                {article.author.image && (
                  <img
                    src={article.author.image}
                    alt={article.author.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">{article.author.username}</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleFavoriteToggle}
                  aria-pressed={isFavorite}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted transition text-sm font-medium"
                >
                  {isFavorite ? "Saved to Favorites" : "Save to Favorites"}
                </button>
                <button
                  onClick={handleFollowToggle}
                  aria-pressed={isFollowing}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition text-sm font-medium"
                >
                  {isFollowing ? "Following" : `Follow ${article.author.username}`}
                </button>
              </div>
            </div>

            {!user && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Sign in</span> to keep track of favorites and following lists.
              </p>
            )}

            <div className="space-y-4 text-base leading-7 text-foreground">
              {bodyParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/favorites" className="text-accent hover:underline">
                View your favorites
              </Link>
              <span>·</span>
              <Link href="/following" className="text-accent hover:underline">
                See who you are following
              </Link>
            </div>
          </article>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Article not found</p>
          </div>
        )}
      </main>
    </>
  )
}
