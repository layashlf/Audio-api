import * as bcrypt from 'bcrypt';

export class RefreshToken {
  private constructor(
    public readonly id: string,
    private token: string, // hashed
    private userId: string,
    private isRevoked: boolean = false,
    private expiresAt: Date,
    private readonly createdAt: Date = new Date(),
  ) {}

  static async create(
    id: string,
    plainToken: string,
    userId: string,
    expiresAt: Date,
    saltRounds: number = 10,
  ): Promise<RefreshToken> {
    // Hash the plain token before saving to database
    // If database gets hacked, attackers can't use the tokens directly
    // bcrypt makes it slow to try guessing the original token
    const hashedToken = await bcrypt.hash(plainToken, saltRounds);
    return new RefreshToken(id, hashedToken, userId, false, expiresAt);
  }

  static fromPersistence(data: {
    id: string;
    token: string;
    userId: string;
    isRevoked: boolean;
    expiresAt: Date;
    createdAt: Date;
  }): RefreshToken {
    return new RefreshToken(
      data.id,
      data.token,
      data.userId,
      data.isRevoked,
      data.expiresAt,
      data.createdAt,
    );
  }

  getUserId(): string {
    return this.userId;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }

  async matchesToken(plainToken: string): Promise<boolean> {
    return await bcrypt.compare(plainToken, this.token);
  }

  revoke(): void {
    this.isRevoked = true;
  }

  toPersistence(): {
    id: string;
    token: string;
    userId: string;
    isRevoked: boolean;
    expiresAt: Date;
    createdAt: Date;
  } {
    return {
      id: this.id,
      token: this.token,
      userId: this.userId,
      isRevoked: this.isRevoked,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
    };
  }
}
