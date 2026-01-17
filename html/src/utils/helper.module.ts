import { Module } from '@nestjs/common';
import { HelperFunctions } from './helperFunctions';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from './EmailService';


@Module({
    imports: [JwtModule],
    providers: [HelperFunctions, EmailService],
    exports: [HelperFunctions, EmailService],
})
export class HelperModule { }
