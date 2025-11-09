"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import Header from "@/components/header"

interface ArticleAuthor {
  id: string
  username: string
  image?: string
}

interface Comment {
  id: string
  body: string
  createdAt: string
  author: {
    id: string
    username: string
  }
}

interface Article {
  id: string
  title: string
  description: string
  body: string
  slug: string
  createdAt: string
  author: ArticleAuthor
  comments: Comment[]
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug
  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [articleLoading, setArticleLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [error, setError] = useState("")
  const [commentError, setCommentError] = useState("")
  const [commentBody, setCommentBody] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [deletingArticle, setDeletingArticle] = useState(false)

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
  const currentUser = useMemo(() => {
    if (!storedUser) {
      return null
    }
    try {
      return JSON.parse(storedUser)
    } catch {
      return null
    }
  }, [storedUser])

  useEffect(() => {
    fetchArticle()
  }, [slug])

  useEffect(() => {
    fetchComments()
  }, [slug])

  const fetchArticle = async () => {
    if (!slug) return
    setArticleLoading(true)
    setError("")

    try {
      const response = await fetch(`http://localhost:3001/api/articles/${slug}`)
      if (!response.ok) {
        throw new Error("Failed to load article")
      }

      const data = await response.json()
      setArticle(data.data)
    } catch (err) {
      setError((err as Error).message || "Unable to load article")
    } finally {
      setArticleLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!slug) return
    setCommentsLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/api/articles/${slug}/comments`)
      if (!response.ok) {
        throw new Error("Failed to load comments")
      }

      const data = await response.json()
      setComments(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleDeleteArticle = async () => {
    if (!slug) return
    if (!confirm("Are you sure you want to delete this article?")) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    setDeletingArticle(true)
    try {
      const response = await fetch(`http://localhost:3001/api/articles/${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete article")
      }

      router.push("/")
    } catch (err) {
      setError((err as Error).message || "Failed to delete article")
    } finally {
      setDeletingArticle(false)
    }
  }

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!commentBody.trim()) {
      setCommentError("Comment cannot be empty")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    setSubmittingComment(true)
    setCommentError("")

    try {
      const response = await fetch(`http://localhost:3001/api/articles/${slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: commentBody }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to post comment")
      }

      setCommentBody("")
      fetchComments()
    } catch (err) {
      setCommentError((err as Error).message || "Failed to post comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!slug) return
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/articles/${slug}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete comment")
      }

      fetchComments()
    } catch (err) {
      setCommentError((err as Error).message || "Failed to delete comment")
    }
  }

  const isAuthor = article && currentUser && article.author.id === currentUser.id

  const formattedDate = article
    ? new Date(article.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {articleLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : article ? (
          <>
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{article.author.username}</p>
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                </div>
                {isAuthor && (
                  <div className="flex gap-3">
                    <Link
                      href={`/editor?slug=${article.slug}`}
                      className="px-4 py-2 border border-border rounded-md text-sm hover:bg-muted transition"
                    >
                      Edit Article
                    </Link>
                    <button
                      onClick={handleDeleteArticle}
                      disabled={deletingArticle}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {deletingArticle ? "Deleting..." : "Delete Article"}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-4xl font-bold mb-3 text-balance">{article.title}</h1>
                <p className="text-lg text-muted-foreground">{article.description}</p>
              </div>

              <div className="prose max-w-none">
                {article.body.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Comments</h2>
                <p className="text-sm text-muted-foreground">{comments.length} comment(s)</p>
              </div>

              {currentUser ? (
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <textarea
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={4}
                    placeholder="Share your thoughts on this article..."
                    required
                  />
                  {commentError && <p className="text-sm text-red-600">{commentError}</p>}
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition disabled:opacity-50 text-sm"
                  >
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </form>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <Link href="/login" className="text-accent hover:underline">
                    Sign in
                  </Link>{" "}
                  to join the discussion.
                </div>
              )}

              {commentsLoading ? (
                <p className="text-muted-foreground">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-muted-foreground">No comments yet.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border border-border rounded-md p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{comment.author.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.body}</p>
                      {currentUser && currentUser.id === comment.author.id && (
                        <button
                          type="button"
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Article not found.</p>
          </div>
        )}
      </main>
    </>
  )
}
