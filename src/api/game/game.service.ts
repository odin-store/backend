import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Game } from 'src/common/entities/game/game.entity';
import { Genre } from 'src/common/entities/game/genre.entity';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async getDownloadURL(id: string) {
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    const bucket = this.configService.get('AWS_CLOUD_BUCKET');

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `${id}.zip`,
    });

    const client = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region: 'ap-northeast-2',
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: 24 * 60 * 60,
    });

    return url;
  }

  async streamFileFromS3(id: string) {
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    const bucket = this.configService.get('AWS_CLOUD_BUCKET');

    const client = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region: 'ap-northeast-2',
    });

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `${id}.zip`,
    });

    const { Body } = await client.send(command);

    if (Body instanceof Readable) {
      return Body;
    } else {
      throw new Error('Failed to get a readable stream');
    }
  }

  //generate new genres
  async newGenre(title: string) {
    const genreRepository = this.dataSource.getRepository(Genre);

    const found = genreRepository.findOneBy({
      title: title,
    });

    if (found) {
      throw new ConflictException(`Genre ${title} already exist.`);
    }

    const res = genreRepository.create({
      title: title,
    });

    return res;
  }

  //get recommend games
  async getRecommend() {
    const gameRepository = this.dataSource.getRepository(Game);
    const games = gameRepository.find({
      take: 3,
      order: {
        star_rates: 'DESC',
        star_rates_count: 'DESC',
      },
    });

    return games;
  }

  //get games with genre
  async getWithGenre(genre: string) {
    const gameRepository = this.dataSource.getRepository(Game);
    const games = gameRepository.find({
      take: 3,
      where: {
        genres: {
          title: genre,
        },
      },
    });

    return games;
  }
}
