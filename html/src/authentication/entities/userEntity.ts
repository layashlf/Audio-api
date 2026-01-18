import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ required: false, enum: UserStatus })
  status?: UserStatus;

  @ApiProperty()
  createdAt: Date = new Date();

  @ApiProperty()
  updatedAt: Date = new Date();
}
