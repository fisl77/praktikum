import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const API_KEY = '37392788-5fa3-4aa3-aea9-608d7d1835e1';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];

    console.log('API-KEY im Header:', apiKey);

    if (!apiKey || apiKey !== API_KEY) {
      console.log('API-KEY fehlend oder falsch');
      throw new UnauthorizedException('Ungültiger API-Key');
    }

    console.log('API-KEY korrekt!');
    next();
  }
}
