import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PartialAccessTokenGuard extends AuthGuard('jwt-partial') {}