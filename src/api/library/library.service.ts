import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LibraryService {
  constructor(private configService: ConfigService) {}
}