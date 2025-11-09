import { Injectable, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Article } from "./entities/article.entity"
import type { CreateArticleDto } from "./dto/create-article.dto"

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
  private articlesRepository: Repository<Article>

  constructor(articlesRepository: Repository<Article>) {
    this.articlesRepository = articlesRepository
  }

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
}
