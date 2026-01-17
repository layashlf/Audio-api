import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsDefined,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class SendRegistrationOtpDto {
  @IsEmail()
  @IsDefined()
  @ApiProperty({ example: 'test@example.com' })
  email: string;
}

export class VerifyRegistrationOtpDto {
  @IsEmail()
  @IsDefined()
  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @IsString()
  @IsDefined()
  @ApiProperty({ example: '123456' })
  otp: string;
}
export class RegisterDto {
  @IsEmail()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ example: 'Test@123' })
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'John Doe' })
  displayName?: string;
}
export class RegisterResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  displayName?: string;

  @Expose()
  @ApiProperty()
  status?: string;

  @Expose()
  @ApiProperty()
  subscriptionStatus: string;
}
