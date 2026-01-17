import { IsEnum, IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  @IsNotEmpty()
  NODE_ENV: NodeEnvironment;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_PARTIAL_SECRET: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  JWT_TOKEN_EXPIRE_AT: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_EXPIRE_AT: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  JWT_PARTIAL_TOKEN_EXPIRE_AT: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  SALT_OR_ROUNDS: number;

  @IsString()
  @IsNotEmpty()
  MAIL_HOST: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  MAIL_PORT: number = 1025;

  @IsString()
  @IsNotEmpty()
  MAIL_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  MAIL_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM_NAME: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  EMAIL_EXPIRE_PERIOD: number;

  @IsString()
  MEILI_HOST?: string;

  @IsString()
  MEILI_MASTER_KEY?: string;
}
