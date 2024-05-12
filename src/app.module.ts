import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './api/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './providers/database/database.service';
import { MailModule } from './api/mail/mail.module';
import { GameModule } from './api/game/game.module';
import { DevelopersModule } from './api/developers/developers.module';
import { LibraryModule } from './api/library/library.module';
import { PurchaseModule } from './api/purchase/purchase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfigService,
    }),
    AuthModule,
    MailModule,
    GameModule,
    DevelopersModule,
    LibraryModule,
    PurchaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
