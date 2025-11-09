import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import type { User } from "./entities/user.entity"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"

@Injectable()
export class AuthService {
  private usersRepository: Repository<User>
  private jwtService: JwtService

  constructor(usersRepository: Repository<User>, jwtService: JwtService) {
    this.usersRepository = usersRepository
    this.jwtService = jwtService
  }

  async register(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto

    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    })

    if (existingUser) {
      throw new BadRequestException("User already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
    })

    await this.usersRepository.save(user)

    const token = this.jwtService.sign({ sub: user.id, username: user.username })
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    }
  }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    })

    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const token = this.jwtService.sign({ sub: user.id, username: user.username })
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    }
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new BadRequestException("User not found")
    }

    Object.assign(user, updateUserDto)
    await this.usersRepository.save(user)

    return {
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: user.image,
      },
    }
  }
}
