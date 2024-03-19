import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import RegisterDto from '../../common/dto/auth/register.dto';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/common/entities/user/user.entity';
import { EmailCert } from 'src/common/entities/user/email.entity';
import * as bcrypt from 'bcrypt';
import LoginDto from 'src/common/dto/auth/login.dto';
import { payload } from 'src/common/interface/auth/payload.interface';
import { RefreshTokenDto } from 'src/common/dto/auth/refresh.dto';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  //Register new user
  async registerUser(registerDto: RegisterDto) {
    const userRepository = this.dataSource.getRepository(User);
    const verifyRepository = this.dataSource.getRepository(EmailCert);

    //throw error if email is not verified
    const findEmail = await verifyRepository.findOneBy({
      email: registerDto.email,
    });

    if (!findEmail || !findEmail.verified) {
      throw new UnauthorizedException('Email not verified');
    }

    //throw unauthorizedException if there is an user that use requested email
    let foundUser = await userRepository.findOneBy({
      email: registerDto.email,
    });

    if (foundUser) {
      throw new ConflictException('Email already used');
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHashed = await bcrypt.hash(registerDto.password, salt);
    this.logger.log(
      `${registerDto.email}'s password was being hashed successfully.`,
    );

    const newUser = userRepository.create({
      email: registerDto.email,
      password: passwordHashed,
      username: registerDto.username,
    });
    userRepository.save(newUser);
    this.logger.log(`New account created with username : ${newUser.username}.`);

    return {
      message: `New account created with username : ${newUser.username}.`,
    };
  }

  //check email usage
  async checkEmail(email: string) {
    const userRepository = this.dataSource.getRepository(User);

    const foundUser = userRepository.findOneBy({
      email: email,
    });

    if (foundUser) {
      return {
        found: true,
      };
    } else {
      return {
        found: false,
      };
    }
  }

  async getUserWithId(userId: number) {
    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOneBy({
      id: userId,
    });

    return user;
  }

  //validate user
  async validateUser(loginDto: LoginDto) {
    const userRepository = this.dataSource.getRepository(User);

    //find user with email
    let foundUser = await userRepository.findOneBy({
      email: loginDto.email,
    });

    //return error if no user with email
    if (!foundUser) {
      throw new UnauthorizedException("Couldn't find user with email");
    }

    //compare password
    const validatepassword = await bcrypt.compare(
      loginDto.password,
      foundUser.password,
    );

    if (!validatepassword) {
      throw new UnauthorizedException('Password not matched');
    }

    return foundUser;
  }

  //generate new access token
  async generateAccessToken(user: User): Promise<string> {
    const payload: payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      profile: user.profile,
    };
    this.logger.log(`Generating new access token for ${user.email}`);
    return this.jwtService.signAsync(payload);
  }

  //generate new refresh token
  async generateRefreshToken(user: User): Promise<string> {
    const payload: payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      profile: user.profile,
    };
    this.logger.log(`Access token generated for ${user.email}`);

    return this.jwtService.signAsync(
      { id: payload.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION_TIME',
        ),
      },
    );
  }

  //hash refresh token
  async getHashedRefreshToken(refreshToken: string) {
    const slatOrRounds = 10;
    const currentRefreshToken = await bcrypt.hash(refreshToken, slatOrRounds);
    this.logger.log('successfully hashed refresh token');

    return currentRefreshToken;
  }

  //get expire date of refresh token
  async getCurrentRefreshTokenExp(): Promise<Date> {
    const currentDate = new Date();
    const currentRefreshTokenExp = new Date(
      currentDate.getTime() +
        parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME')),
    );

    return currentRefreshTokenExp;
  }

  //set current refresh token
  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const userRepository = this.dataSource.getRepository(User);

    const currentRefreshToken = await this.getHashedRefreshToken(refreshToken);
    const currentRefreshTokenExp = await this.getCurrentRefreshTokenExp();

    await userRepository.update(userId, {
      currentRefreshToken: currentRefreshToken,
      currentRefreshTokenExp: currentRefreshTokenExp,
    });
    this.logger.log(`Refresh token saved for user ${userId}`);
  }

  //validate token for user
  async validateUserToken(payload: payload): Promise<User | undefined> {
    const userRepository = this.dataSource.getRepository(User);

    const user = await userRepository.findOneBy({
      id: payload.id,
    });

    return user;
  }

  //get user that have current refresh token
  async getUserWithCurentRefreshToken(
    refreshToken: string,
    userId: number,
  ): Promise<User> {
    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOneBy({
      id: userId,
    });

    if (!user.currentRefreshToken) {
      return null;
    }

    const isRefreshMatch = await bcrypt.compare(
      refreshToken,
      user.currentRefreshToken,
    );

    if (!isRefreshMatch) {
      throw new UnauthorizedException('Refresh token not match');
    }

    return user;
  }

  //refresh user token
  async refresh(refreshDto: RefreshTokenDto) {
    const { refreshToken } = refreshDto;

    let decoded;

    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      this.logger.warn(error.message);
      throw new UnauthorizedException(error.message);
    }

    const userId = decoded.id;
    const user = await this.getUserWithCurentRefreshToken(refreshToken, userId);

    if (!user) {
      throw new UnauthorizedException('User is invalid');
    }

    const accessToken = await this.generateAccessToken(user);
    this.logger.log(`refreshed user token with id : ${userId}`);

    return { accessToken };
  }

  //remove user's refresh token
  async removeRefreshToken(userId: number): Promise<any> {
    const userRepository = this.dataSource.getRepository(User);

    await userRepository.update(userId, {
      currentRefreshToken: null,
      currentRefreshTokenExp: null,
    });

    this.logger.log(`Refresh token removed for user ID ${userId}`);
  }
}
