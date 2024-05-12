import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { AuthGuard } from '../auth/guards/auth.guards';
import { Request } from 'express';
import { GenerateDeveloperDto } from 'src/common/dto/developers/generate.dto';
import { GameUploadDto } from 'src/common/dto/developers/upload.dto';

@Controller('developers')
export class DevelopersController {
  constructor(private developersService: DevelopersService) {}

  @Post('/new')
  async generateDeveloper(
    @Req() request: Request,
    @Body() body: GenerateDeveloperDto,
  ) {
    const developer = await this.developersService.joinDeveloper(body);
    await this.developersService.join(body.userId, developer.id);
    return developer;
  }

  @Post('/upload-url')
  async getUploadUrl(@Body() body: GameUploadDto) {
    return this.developersService.getUploadURL(body);
  }
}
