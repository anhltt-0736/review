import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm"
import { User } from "../../auth/entities/user.entity"

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column()
  slug: string

  @Column()
  description: string

  @Column("text")
  body: string

  @ManyToOne(
    () => User,
    (user) => user.articles,
    { eager: true },
  )
  author: User

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: "timestamp", onUpdate: "CURRENT_TIMESTAMP", nullable: true })
  updatedAt: Date
}
