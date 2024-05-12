import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/common/entities/user/user.entity';
import { DataSource } from 'typeorm';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { GenerateDeveloperDto } from 'src/common/dto/developers/generate.dto';
import { Developer } from 'src/common/entities/developer/developer.entity';
import { Game } from 'src/common/entities/game/game.entity';
import { GameUploadDto } from 'src/common/dto/developers/upload.dto';
import { GameVersion } from 'src/common/entities/game/version.entity';
import { GameGenerateDto } from 'src/common/dto/games/generate.dto';

@Injectable()
export class DevelopersService {
  private logger = new Logger(DevelopersService.name);

  constructor(
    private readonly datasource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  //generate new game
  async generate(generateDto: GameGenerateDto) {
    const gameRepository = this.datasource.getRepository(Game);

    this.logger.log(`Generating new game : ${generateDto.title}`);

    const newGame = gameRepository.create({
      title: generateDto.title,
      description: generateDto.description,
      price: generateDto.price,
      star_rates: 0,
      star_rates_count: 0,
      is_judging: true,
      is_public: false,
    });

    gameRepository.save(newGame);

    return newGame;
  }

  //generate new developer
  async joinDeveloper(generateDto: GenerateDeveloperDto) {
    const developerRepository = this.datasource.getRepository(Developer);

    const found = await developerRepository.findOneBy({
      name: generateDto.name,
    });

    if (found) {
      throw new ConflictException(
        `Developer named ${generateDto.name} already exist.`,
      );
    }

    const newDeveloper = developerRepository.create({
      name: generateDto.name,
      description: generateDto.desc,
    });

    await developerRepository.save(newDeveloper);

    return newDeveloper;
  }

  //join user to developer groups
  async join(userId: number, developerId: number) {
    try {
      const developerRepository = this.datasource.getRepository(Developer);
      const userRepository = this.datasource.getRepository(User);

      const user = await userRepository.findOneBy({
        id: userId,
      });
      const developer = await developerRepository.findOneBy({
        id: developerId,
      });

      if (!developer.users) {
        developer.users = [user];
      } else {
        developer.users.push(user);
      }

      developerRepository.save(developer);

      return true;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  //check if user is developer
  async checkDev(userId: number) {
    const userRepository = this.datasource.getRepository(User);

    const user = await userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (user.developer.length === 0) {
      throw new UnauthorizedException('You must be a developer first');
    }

    return true;
  }

  //generate s3 presigned url
  async getUploadURL(uploadDto: GameUploadDto) {
    const gameRepository = this.datasource.getRepository(Game);
    const versionRepository = this.datasource.getRepository(GameVersion);

    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    const bucket = this.configService.get('AWS_CLOUD_BUCKET');

    const objectKey = `odin-${Date.now()}.zip`;

    const game = await gameRepository.findOneBy({
      id: uploadDto.game_id,
    });

    let version = versionRepository.create();

    version.game = game;
    version.version_name = uploadDto.version_name;
    version.file = objectKey;

    versionRepository.save(version);

    const client = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region: this.configService.get('AWS_REGION'),
    });

    const url = await createPresignedPost(client, {
      Bucket: bucket,
      Key: objectKey,
      Expires: 600,
    });

    return {
      url: url.url,
      fields: url.fields,
      fileName: objectKey,
    };
  }
}
