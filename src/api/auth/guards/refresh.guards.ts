import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Refresh Token의 유효성을 검사합니다.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {}
