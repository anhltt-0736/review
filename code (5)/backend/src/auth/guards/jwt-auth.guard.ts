import { Injectable, UnauthorizedException } from "@nestjs/common"
import type { CanActivate, ExecutionContext } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const token = request.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      throw new UnauthorizedException("No token provided")
    }

    try {
      const payload = this.jwtService.verify(token)
      request.user = payload
      return true
    } catch (error) {
      throw new UnauthorizedException("Invalid token")
    }
  }
}
