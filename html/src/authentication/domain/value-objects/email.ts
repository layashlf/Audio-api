export class Email {
  private readonly value: string;

  constructor(value: string) {
    const trimmedValue = value.toLowerCase().trim();
    if (!this.isValidEmail(trimmedValue)) {
      throw new Error('Invalid email format');
    }
    this.value = trimmedValue;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
