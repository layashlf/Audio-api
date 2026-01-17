import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsEmail } from "class-validator";

export class ForgotPasswordRequestDto {
    @ApiProperty()
    @IsEmail()
    @IsDefined()
    email: string
}

export class VerifyForgetPasswordLinkDto {
    @ApiProperty()
    @IsDefined()
    otp: string

    @ApiProperty()
    @IsDefined()
    userId: string
}

export class changePasswordRequestDto {
    @ApiProperty()
    @IsDefined()
    password: string

    @ApiProperty()
    @IsDefined()
    confirmPassword: string
}