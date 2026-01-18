import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { SearchRepository } from '../../../search/domain/repositories/search.repository';

export interface RegisterUserInput {
  email: string;
  password: string;
  displayName?: string;
  status: UserStatus;
}

export interface RegisterUserOutput {
  id: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('SearchRepository')
    private readonly searchRepository: SearchRepository,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = new Email(input.email);

    // Check if user already exists
    const existingUser = await this.userRepository.exists(email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Create password
    const password = await Password.create(input.password);

    // Create user
    const userId = uuidv4();
    const user = User.create(
      userId,
      email,
      password,
      input.displayName,
      input.status,
    );
    // Save user
    await this.userRepository.save(user);

    // Index user for search
    await this.searchRepository.indexUser({
      id: user.id,
      email: user.getEmail().getValue(),
      displayName: user.getDisplayName(),
    });

    const userData = user.toPersistence();
    return {
      id: userData.id,
      email: userData.email,
      displayName: userData.displayName,
      emailVerified: userData.emailVerified,
      status: userData.status,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
  }
}
