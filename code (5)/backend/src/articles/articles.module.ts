import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ArticlesService } from "./articles.service"
import { ArticlesController } from "./articles.controller"
import { Article } from "./entities/article.entity"
import { Comment } from "./entities/comment.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Article, Comment])],
  providers: [ArticlesService],
  controllers: [ArticlesController],
})
export class ArticlesModule {}
