import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * 세션의 유효성을 감지합니다.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const request = context.switchToHttp().getRequest();
      const access_token = request.headers['authorization']
        .split(' ')[1]
        .split(',')[0];
      const user = await this.jwtService.verify(access_token);
      request.user = user;
      return user;
    } catch (err) {
      this.logger.error('Error verifying access token', err);
      return false;
    }
  }
}
