import { ConflictException, Injectable, Logger, flatten } from '@nestjs/common';
import { GameGenerateDto } from 'src/common/dto/games/generate.dto';
import { Game } from 'src/common/entities/game/game.entity';
import { Genre } from 'src/common/entities/game/genre.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  constructor(private readonly dataSource: DataSource) {}

  //generate new game
  async generate(generateDto: GameGenerateDto) {
    const gameRepository = this.dataSource.getRepository(Game);

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
