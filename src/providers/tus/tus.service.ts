import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Store } from '@tus/s3-store';
import tus from '@tus/server';

@Injectable()
export class TusConfigService implements OnModuleInit {
  private readonly logger = new Logger(TusConfigService.name);
  private tusServer: tus.Server;

  constructor(private configService: ConfigService) {
    const s3Store = new S3Store({
      s3ClientConfig: {
        bucket: this.configService.get<string>('AWS_CLOUD_BUCKET'),
        region: this.configService.get<string>('AWS_REGION'),
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get<string>(
            'AWS_SECRET_ACCESS_KEY',
          ),
        },
      },
    });

    this.tusServer = new tus.Server({
      path: '/',
      datastore: s3Store,
    });
  }

  onModuleInit() {
    this.initializeTusServer();
  }

  private initializeTusServer() {
    this.logger.verbose('Initializing tus server..');
  }
}
