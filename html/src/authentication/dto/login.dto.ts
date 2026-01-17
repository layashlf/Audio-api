import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsDefined, IsEmail, IsString } from 'class-validator';
import { UserInfoDto } from './user-info.dto';

export class LoginDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  @IsDefined()
  email: string;

  @ApiProperty({ example: 'Test@123' })
  @IsDefined()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  @IsString()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @IsString()
  @Expose()
  refreshToken: string;

  @IsString()
  @Expose()
  user: UserInfoDto;
}
