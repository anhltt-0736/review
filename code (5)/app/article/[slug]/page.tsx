"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"

interface Article {
  id: string
  title: string
  description: string
  body: string
  author: {
    username: string
    image?: string
  }
  createdAt: string
  slug: string
}

export default function ArticlePage() {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.slug) {
      fetchArticle()
    }
  }, [params.slug])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/articles/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setArticle(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch article:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </>
    )
  }

  if (!article) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Article not found</p>
            <Link href="/" className="text-accent hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </>
    )
  }

  const date = new Date(article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-4xl font-bold mb-4 text-balance">{article.title}</h1>

          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
            {article.author.image && (
              <img
                src={article.author.image || "/placeholder.svg"}
                alt={article.author.username}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold">{article.author.username}</p>
              <p className="text-sm text-muted-foreground">{date}</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-foreground leading-relaxed">
            <p className="text-lg text-muted-foreground mb-6">{article.description}</p>
            <div className="whitespace-pre-wrap">{article.body}</div>
          </div>
        </article>
      </main>
    </>
  )
}
