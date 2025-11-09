"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import ArticleCard from "@/components/article-card"

interface Article {
  id: string
  title: string
  description: string
  author: {
    username: string
    image?: string
  }
  createdAt: string
  slug: string
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/articles")
      if (response.ok) {
        const data = await response.json()
        setArticles(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3 text-balance">Welcome to Nexus</h1>
          <p className="text-xl text-muted-foreground">
            Discover compelling stories, ideas, and perspectives from writers around the world.
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Recent Articles</h2>
          {typeof window !== "undefined" && localStorage.getItem("token") && (
            <Link
              href="/editor"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
            >
              Write Article
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No articles yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to{" "}
              <Link href="/login" className="text-accent hover:underline">
                sign in and write
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-12 border-t border-border pt-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
