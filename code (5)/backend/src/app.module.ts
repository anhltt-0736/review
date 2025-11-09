import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "./auth/auth.module"
import { ArticlesModule } from "./articles/articles.module"
import { User } from "./auth/entities/user.entity"
import { Article } from "./articles/entities/article.entity"
import { Comment } from "./articles/entities/comment.entity"

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "nexus.db",
      entities: [User, Article, Comment],
      synchronize: true,
    }),
    AuthModule,
    ArticlesModule,
  ],
})
export class AppModule {}
