import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import RegisterDto from 'src/common/dto/auth/register.dto';
import LoginDto from 'src/common/dto/auth/login.dto';
import { Request, Response } from 'express';
import { JwtRefreshGuard } from './guards/refresh.guards';
import { AuthGuard } from './guards/auth.guards';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  //register new user
  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.registerUser(registerDto);
  }

  //login
  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(loginDto);
    const access_token = await this.authService.generateAccessToken(user);
    const refresh_token = await this.authService.generateRefreshToken(user);

    //set refresh token
    await this.authService.setCurrentRefreshToken(refresh_token, user.id);

    //get user data
    const userData = await this.authService.getUserWithId(user.id);

    //set token on cookie
    res.setHeader('Authorization', 'Bearer ' + [access_token, refresh_token]);
    res.cookie('access_token', access_token, {
      httpOnly: true,
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
    });
    res.send({
      message: 'logged in successfully.',
      access_token,
      refresh_token,
      user: {
        username: user.username,
        profile: user.profile,
      },
    });
  }

  //refresh access token
  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const newAccessToken = (
      await this.authService.refresh({
        refreshToken: req.headers.authorization.split(' ')[1].split(',')[1],
      })
    ).accessToken;

    //set new access tokens to cookie
    res.setHeader('Authorization', 'Bearer' + newAccessToken);
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
    });

    res.send({
      message: 'refreshed successfully',
      access_token: newAccessToken,
    });
  }

  //check login
  @Get('/authenticate')
  @UseGuards(AuthGuard)
  isAuthenticated(@Req() req: Request): any {
    this.logger.log('Checking if a user is authenticated');
    const user: any = req.user;

    return user;
  }
}
