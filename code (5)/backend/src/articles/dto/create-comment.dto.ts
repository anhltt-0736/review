import { IsString, MinLength } from "class-validator"

export class CreateCommentDto {
  @IsString()
  @MinLength(3)
  body: string
}
