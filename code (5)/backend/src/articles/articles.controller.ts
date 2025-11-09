import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from "@nestjs/common"
import type { ArticlesService } from "./articles.service"
import type { CreateArticleDto } from "./dto/create-article.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(createArticleDto: CreateArticleDto, @Request() req) {
    return this.articlesService.create(createArticleDto, req.user.sub)
  }

  @Get()
  findAll() {
    return this.articlesService.findAll()
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.articlesService.findOne(slug);
  }

  @Put(":slug")
  @UseGuards(JwtAuthGuard)
  update(@Param('slug') slug: string, @Body() updateArticleDto: CreateArticleDto, @Request() req) {
    return this.articlesService.update(slug, updateArticleDto, req.user.sub)
  }
}
