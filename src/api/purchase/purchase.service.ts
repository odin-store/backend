import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PurchaseDto } from 'src/common/dto/purchase/purchase.dto';

@Injectable()
export class PurchaseService {
  private logger = new Logger(PurchaseService.name);
  private PORTONE_HOST = 'https://api.portone.io';
  constructor(private configService: ConfigService) {}

  //get portone access token
  async verify(): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const res = await axios.post(`${this.PORTONE_HOST}/login/api-secret`, {
      apiSecret: this.configService.get<string>('PORTONE_API_SECRET'),
    });

    if (res.status !== 200) {
      throw new ConflictException(res.data.message);
    }

    const accessToken = res.data.accessToken;
    const refreshToken = res.data.refreshToken;

    this.logger.log('New portone access token was created.');
    this.configService.set('PORTONE_ACCESS_TOKEN', accessToken);
    this.configService.set('PORTONE_REFRESH_TOKEN', refreshToken);

    return { accessToken, refreshToken };
  }
  6;

  //get portone refresh token
  async refresh(): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const oldRefreshToken = this.configService.get<string>(
      'PORTONE_REFRESH_TOKEN',
    );
    const res = await axios.post(`${this.PORTONE_HOST}/token/refresh`, {
      oldRefreshToken,
    });

    if (res.status !== 200) {
      return this.verify();
    }

    const accessToken = res.data.accessToken;
    const refreshToken = res.data.refreshToken;

    this.logger.log('Portone access token was refreshed.');
    this.configService.set('PORTONE_ACCESS_TOKEN', accessToken);
    this.configService.set('PORTONE_REFRESH_TOKEN', refreshToken);

    return { accessToken, refreshToken };
  }

  //check
}
