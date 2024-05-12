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

  /**
   * 회원가입을 진행합니다.
   * @param registerDto 회원가입에 필요한 정보들이 요구됩니다.
   * @returns 회원가입의 결과를 리턴합니다.
   */
  async registerUser(registerDto: RegisterDto) {
    const userRepository = this.dataSource.getRepository(User);
    const verifyRepository = this.dataSource.getRepository(EmailCert);

    //이메일이 검증되었는지 확인합니다.
    const findEmail = await verifyRepository.findOneBy({
      email: registerDto.email,
    });

    if (!findEmail || !findEmail.verified) {
      throw new UnauthorizedException('Email not verified');
    }

    //이미 해당 이메일로 가입된 유저가 있는지 확인합니다.
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

  /**
   * 이메일 사용 여부를 확인합니다.
   * @param email 확인할 이메일 주소입니다.
   * @returns 이메일 사용 여부를 리턴합니다.
   */
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

  /**
   * ID를 사용하여 사용자를 가져옵니다.
   * @param userId 사용자의 ID입니다.
   * @returns 사용자 정보를 리턴합니다.
   */
  async getUserWithId(userId: number) {
    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOneBy({
      id: userId,
    });

    return user;
  }

  /**
   * 사용자를 검증합니다.
   * @param loginDto 로그인 정보입니다.
   * @returns 검증된 사용자 정보를 리턴합니다.
   */
  async validateUser(loginDto: LoginDto) {
    const userRepository = this.dataSource.getRepository(User);

    //이메일로 사용자를 찾습니다.
    let foundUser = await userRepository.findOneBy({
      email: loginDto.email,
    });

    //이메일로 사용자를 찾지 못한 경우 에러를 반환합니다.
    if (!foundUser) {
      throw new UnauthorizedException("Couldn't find user with email");
    }

    //비밀번호를 비교합니다.
    const validatepassword = await bcrypt.compare(
      loginDto.password,
      foundUser.password,
    );

    if (!validatepassword) {
      throw new UnauthorizedException('Password not matched');
    }

    return foundUser;
  }

  /**
   * 사용자 정보를 기반으로 새로운 액세스 토큰을 생성합니다.
   * @param user 사용자 엔티티입니다.
   * @returns 생성된 액세스 토큰을 문자열로 반환합니다.
   */
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

  /**
   * 사용자 정보를 기반으로 새로운 리프레시 토큰을 생성합니다.
   * @param user 사용자 엔티티입니다.
   * @returns 생성된 리프레시 토큰을 문자열로 반환합니다.
   */
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

  /**
   * 리프레시 토큰을 해시 처리합니다.
   * @param refreshToken 해시 처리할 리프레시 토큰입니다.
   * @returns 해시 처리된 리프레시 토큰을 반환합니다.
   */
  async getHashedRefreshToken(refreshToken: string) {
    const slatOrRounds = 10;
    const currentRefreshToken = await bcrypt.hash(refreshToken, slatOrRounds);
    this.logger.log('successfully hashed refresh token');

    return currentRefreshToken;
  }

  /**
   * 현재 리프레시 토큰의 만료 날짜를 가져옵니다.
   * @returns 리프레시 토큰의 만료 날짜를 반환합니다.
   */
  async getCurrentRefreshTokenExp(): Promise<Date> {
    const currentDate = new Date();
    const currentRefreshTokenExp = new Date(
      currentDate.getTime() +
        parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME')),
    );

    return currentRefreshTokenExp;
  }

  /**
   * 사용자 ID에 현재 리프레시 토큰을 설정합니다.
   * @param refreshToken 설정할 리프레시 토큰입니다.
   * @param userId 사용자의 ID입니다.
   */
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

  /**
   * 페이로드를 기반으로 사용자 토큰을 검증합니다.
   * @param payload 검증할 사용자의 페이로드입니다.
   * @returns 검증된 사용자 엔티티를 반환하거나, undefined를 반환합니다.
   */
  async validateUserToken(payload: payload): Promise<User | undefined> {
    const userRepository = this.dataSource.getRepository(User);

    const user = await userRepository.findOneBy({
      id: payload.id,
    });

    return user;
  }

  /**
   * 현재 리프레시 토큰을 가진 사용자를 가져옵니다.
   * @param refreshToken 검증할 리프레시 토큰입니다.
   * @param userId 사용자의 ID입니다.
   * @returns 리프레시 토큰이 일치하는 사용자 엔티티를 반환합니다.
   */
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

  /**
   * 리프레시 토큰을 사용하여 사용자 토큰을 새로고침합니다.
   * @param refreshDto 리프레시 토큰 정보가 담긴 DTO입니다.
   * @returns 새로운 액세스 토큰을 반환합니다.
   */
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

  /**
   * 사용자의 리프레시 토큰을 제거합니다.
   * @param userId 리프레시 토큰을 제거할 사용자의 ID입니다.
   */
  async removeRefreshToken(userId: number): Promise<any> {
    const userRepository = this.dataSource.getRepository(User);

    await userRepository.update(userId, {
      currentRefreshToken: null,
      currentRefreshTokenExp: null,
    });

    this.logger.log(`Refresh token removed for user ID ${userId}`);
  }
}
