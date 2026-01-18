import { Module } from '@nestjs/common';
import { HelperFunctions } from './helperFunctions';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [HelperFunctions],
  exports: [HelperFunctions],
})
export class HelperModule {}
