import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Article } from "../../articles/entities/article.entity"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  username: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ nullable: true })
  bio: string

  @Column({ nullable: true })
  image: string

  @OneToMany(
    () => Article,
    (article) => article.author,
  )
  articles: Article[]

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date
}
