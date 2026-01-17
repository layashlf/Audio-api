import { IsString, MaxLength } from 'class-validator';

export class UpdateAudioDto {
  @IsString()
  @MaxLength(255)
  title: string;
}
