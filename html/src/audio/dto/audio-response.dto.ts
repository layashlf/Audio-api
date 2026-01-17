export class AudioResponseDto {
  id: string;
  title: string;
  url: string;
  fileSize?: number;
  duration?: number;
  promptId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
