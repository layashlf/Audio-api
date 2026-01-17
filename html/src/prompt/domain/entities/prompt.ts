export enum PromptStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Prompt {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public status: PromptStatus,
    public priority: number,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public audioId?: string,
  ) {}
}
