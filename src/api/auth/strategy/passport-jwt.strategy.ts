import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Payload } from '../../../common/dto/auth/jwt-payload.dto';
import { payload } from 'src/common/interface/auth/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      // secret key는 외부에 노출되면 안 되는 값이므로 환경변수나 config로 빼서 사용하는 것을 권장한다.
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: payload, done: VerifiedCallback): Promise<any> {
    let user = await this.authService.validateUserToken(payload);

    if (!user) {
      return done(
        new UnauthorizedException({ message: 'user does not exist' }),
        false,
      );
    }

    return done(null, {
      id: user.id,
      username: user.username,
      email: user.email,
      profile: user.profile,
    });
  }
}
