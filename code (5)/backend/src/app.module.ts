import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "./auth/auth.module"
import { ArticlesModule } from "./articles/articles.module"
import { User } from "./auth/entities/user.entity"
import { Article } from "./articles/entities/article.entity"

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "nexus.db",
      entities: [User, Article],
      synchronize: true,
    }),
    AuthModule,
    ArticlesModule,
  ],
})
export class AppModule {}
