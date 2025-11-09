import { IsString, MinLength } from "class-validator"

export class CreateArticleDto {
  @IsString()
  @MinLength(5)
  title: string

  @IsString()
  @MinLength(10)
  description: string

  @IsString()
  @MinLength(20)
  body: string
}
