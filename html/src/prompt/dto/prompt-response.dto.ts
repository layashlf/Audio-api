import { Expose } from 'class-transformer';

export class PromptResponseDto {
  @Expose()
  id: string;

  @Expose()
  text: string;

  @Expose()
  status: string;

  @Expose()
  priority: number;

  @Expose()
  userId: string;

  @Expose()
  audioId?: string;
}
