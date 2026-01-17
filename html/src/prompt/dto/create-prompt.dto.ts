import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePromptDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
