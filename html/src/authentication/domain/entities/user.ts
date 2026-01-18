import { UserStatus } from '@prisma/client';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';

export class User {
  // User class with private constructor to control how objects are created
  // Only create() and fromPersistence() can make User instances
  // This ensures all users have required fields and valid data
  private constructor(
    public readonly id: string,
    private email: Email,
    private password: Password,
    private displayName?: string,
    private status: UserStatus = UserStatus.PENDING_APPROVAL,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {}

  static create(
    id: string,
    email: Email,
    password: Password,
    displayName?: string,
    status: UserStatus = UserStatus.PENDING_APPROVAL,
  ): User {
    return new User(id, email, password, displayName, status);
  }

  static fromPersistence(data: {
    id: string;
    email: string;
    password: string;
    displayName?: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      data.id,
      new Email(data.email),
      Password.fromHash(data.password),
      data.displayName,
      data.status,
      data.createdAt,
      data.updatedAt,
    );
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
  }

  getDisplayName(): string | undefined {
    return this.displayName;
  }

  getStatus(): UserStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  canLogin(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  activate(): void {
    this.status = UserStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  suspend(): void {
    this.status = UserStatus.SUSPENDED;
    this.updatedAt = new Date();
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    return await this.password.compare(plainPassword);
  }

  toPersistence(): {
    id: string;
    email: string;
    password: string;
    displayName?: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      email: this.email.getValue(),
      password: this.password.getHashedValue(),
      displayName: this.displayName,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
