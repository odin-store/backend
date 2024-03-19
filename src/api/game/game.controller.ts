import { Controller } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('games')
export class GameController {
  constructor(private gamesService: GameService) {}
}
