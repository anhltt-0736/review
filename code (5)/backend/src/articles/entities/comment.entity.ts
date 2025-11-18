import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm"
import { User } from "../../auth/entities/user.entity"
import { Article } from "./article.entity"

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("text")
  body: string

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  author: User

  @ManyToOne(() => Article, (article) => article.comments, { onDelete: "CASCADE" })
  article: Article

  @CreateDateColumn()
  createdAt: Date
}
