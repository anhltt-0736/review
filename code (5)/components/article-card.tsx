import Link from "next/link"

interface ArticleCardProps {
  article: {
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
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const date = new Date(article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Link href={`/article/${article.slug}`}>
      <article className="py-8 border-b border-border last:border-b-0 hover:opacity-75 transition cursor-pointer">
        <div className="flex items-start gap-4 mb-3">
          {article.author.image && (
            <img
              src={article.author.image || "/placeholder.svg"}
              alt={article.author.username}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{article.author.username}</p>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-balance">{article.title}</h2>
        <p className="text-muted-foreground line-clamp-2">{article.description}</p>
      </article>
    </Link>
  )
}
