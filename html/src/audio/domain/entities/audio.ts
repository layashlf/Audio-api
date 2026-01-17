export class Audio {
  constructor(
    public readonly id: string,
    public title: string,
    public url: string,
    public readonly promptId: string,
    public readonly userId: string,
    public fileSize?: number,
    public duration?: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static fromPersistence(data: {
    id: string;
    title: string;
    url: string;
    fileSize?: number;
    duration?: number;
    promptId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Audio {
    return new Audio(
      data.id,
      data.title,
      data.url,
      data.promptId,
      data.userId,
      data.fileSize,
      data.duration,
      data.createdAt,
      data.updatedAt,
    );
  }

  updateTitle(title: string): void {
    this.title = title;
    this.updatedAt = new Date();
  }

  toPersistence(): {
    id: string;
    title: string;
    url: string;
    fileSize?: number;
    duration?: number;
    promptId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      title: this.title,
      url: this.url,
      fileSize: this.fileSize,
      duration: this.duration,
      promptId: this.promptId,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
