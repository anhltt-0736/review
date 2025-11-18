export interface ArticleAuthor {
  id: string
  username: string
  image?: string
}

export interface Article {
  id: string
  title: string
  description: string
  body: string
  slug: string
  createdAt: string
  author: ArticleAuthor
}
