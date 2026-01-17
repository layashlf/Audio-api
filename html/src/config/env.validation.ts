import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from './environment.dto';

export function envValidation(config: Record<string, unknown>) {
  // 1. Transform the plain JS object to an instance of our class
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  // 2. Validate the instance
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  // 3. If there are errors, throw an exception
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  // 4. Return the validated and transformed config
  return validatedConfig;
}