import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email';

export interface CheckEmailExistsInput {
  email: string;
}

export interface CheckEmailExistsOutput {
  exists: boolean;
}

@Injectable()
export class CheckEmailExistsUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: CheckEmailExistsInput): Promise<CheckEmailExistsOutput> {
    const email = new Email(input.email);
    const exists = await this.userRepository.exists(email);
    return { exists };
  }
}
