import { Controller, Get, Param, Res } from '@nestjs/common';
import { GameService } from './game.service';
import { Response } from 'express';

@Controller('games')
export class GameController {
  constructor(private gamesService: GameService) {}

  @Get('/download/:key')
  async download(@Param('key') fileKey: string, @Res() res: Response) {
    const stream = await this.gamesService.streamFileFromS3(fileKey);
    stream.pipe(res);
  }
}
