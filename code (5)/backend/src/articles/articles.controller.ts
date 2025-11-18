import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from "@nestjs/common"
import type { ArticlesService } from "./articles.service"
import type { CreateArticleDto } from "./dto/create-article.dto"
import type { CreateCommentDto } from "./dto/create-comment.dto"
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

  @Delete(":slug")
  @UseGuards(JwtAuthGuard)
  delete(@Param("slug") slug: string, @Request() req) {
    return this.articlesService.remove(slug, req.user.sub)
  }

  @Get(":slug/comments")
  findComments(@Param("slug") slug: string) {
    return this.articlesService.findComments(slug)
  }

  @Post(":slug/comments")
  @UseGuards(JwtAuthGuard)
  addComment(@Param("slug") slug: string, @Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.articlesService.createComment(slug, createCommentDto, req.user.sub)
  }

  @Delete(":slug/comments/:id")
  @UseGuards(JwtAuthGuard)
  deleteComment(@Param("slug") slug: string, @Param("id") commentId: string, @Request() req) {
    return this.articlesService.deleteComment(slug, commentId, req.user.sub)
  }
}
