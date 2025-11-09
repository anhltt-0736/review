import { Injectable, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import type { Article } from "./entities/article.entity"
import { Comment } from "./entities/comment.entity"
import type { CreateArticleDto } from "./dto/create-article.dto"
import type { CreateCommentDto } from "./dto/create-comment.dto"

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") +
    "-" +
    Date.now()
  )
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async create(createArticleDto: CreateArticleDto, userId: string) {
    const slug = generateSlug(createArticleDto.title)
    const article = this.articlesRepository.create({
      ...createArticleDto,
      slug,
      author: { id: userId },
    })
    await this.articlesRepository.save(article)
    return { data: article }
  }

  async findAll() {
    const articles = await this.articlesRepository.find({
      order: { createdAt: "DESC" },
    })
    return { data: articles }
  }

  async findOne(slug: string) {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ["comments", "comments.author"],
    })
    if (!article) {
      throw new BadRequestException("Article not found")
    }
    return { data: article }
  }

  async update(slug: string, createArticleDto: CreateArticleDto, userId: string) {
    const article = await this.articlesRepository.findOne({
      where: { slug },
    })

    if (!article) {
      throw new BadRequestException("Article not found")
    }

    if (article.author.id !== userId) {
      throw new BadRequestException("Not authorized to update this article")
    }

    Object.assign(article, createArticleDto)
    await this.articlesRepository.save(article)
    return { data: article }
  }

  async remove(slug: string, userId: string) {
    const article = await this.articlesRepository.findOne({
      where: { slug },
    })

    if (!article) {
      throw new BadRequestException("Article not found")
    }

    if (article.author.id !== userId) {
      throw new BadRequestException("Not authorized to delete this article")
    }

    await this.articlesRepository.remove(article)
    return { data: { slug } }
  }

  async createComment(slug: string, createCommentDto: CreateCommentDto, userId: string) {
    const article = await this.articlesRepository.findOne({
      where: { slug },
    })

    if (!article) {
      throw new BadRequestException("Article not found")
    }

    const comment = this.commentsRepository.create({
      body: createCommentDto.body,
      author: { id: userId },
      article: { id: article.id },
    })

    await this.commentsRepository.save(comment)
    const savedComment = await this.commentsRepository.findOne({
      where: { id: comment.id },
      relations: ["author"],
    })

    if (!savedComment) {
      throw new BadRequestException("Failed to load comment")
    }

    return { data: savedComment }
  }

  async findComments(slug: string) {
    const article = await this.articlesRepository.findOne({
      where: { slug },
    })

    if (!article) {
      throw new BadRequestException("Article not found")
    }

    const comments = await this.commentsRepository.find({
      where: { article: { id: article.id } },
      order: { createdAt: "DESC" },
      relations: ["author"],
    })

    return { data: comments }
  }

  async deleteComment(slug: string, commentId: string, userId: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ["article", "author"],
    })

    if (!comment || comment.article.slug !== slug) {
      throw new BadRequestException("Comment not found")
    }

    if (comment.author.id !== userId) {
      throw new BadRequestException("Not authorized to delete this comment")
    }

    await this.commentsRepository.remove(comment)
    return { data: { id: commentId } }
  }
}
