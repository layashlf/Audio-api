import { JwtService } from "@nestjs/jwt";
import { ITokenPayload } from "../authentication/interfaces";
import { ConfigService } from "@nestjs/config";
import { BadRequestException, Injectable } from "@nestjs/common";
import { randomBytes } from 'crypto';


@Injectable()
export class HelperFunctions {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    async generateJwtToken(type: string, payload: ITokenPayload, expiresIn?: number) {
        let secretKey
        let finalExpiresIn

        switch (type) {
            case 'accessToken':
                secretKey = this.configService.get<string>('JWT_SECRET');
                finalExpiresIn = expiresIn ?? this.configService.get<number>('JWT_TOKEN_EXPIRE_AT')
                break;
            case 'refreshToken':
                secretKey = this.configService.get<string>('JWT_REFRESH_SECRET');
                finalExpiresIn = expiresIn ?? this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRE_AT')
                break;
            case 'partialToken':
                secretKey = this.configService.get<string>('JWT_PARTIAL_SECRET');
                finalExpiresIn = expiresIn ?? this.configService.get<number>('JWT_PARTIAL_TOKEN_EXPIRE_AT')
                break;
            case 'privilegeToken': // todo : privilage token iumplemantations
                secretKey = this.configService.get<string>('JWT_PARTIAL_SECRET');
                finalExpiresIn = expiresIn ?? this.configService.get<number>('JWT_PARTIAL_TOKEN_EXPIRE_AT')
                break;
            default:
                throw new BadRequestException('Invalid token type');

        }
        const finalPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + finalExpiresIn }

        return await this.jwtService.signAsync(
            finalPayload,
            {
                secret: secretKey,
            });
    }

    async generateOtp(length: number) {
        const digits = '0123456789';
        let result = '';

        while (result.length < length) {
            const bytes = randomBytes(length);
            for (let i = 0; i < bytes.length && result.length < length; i++) {
                const index = bytes[i] % digits.length;
                result += digits[index];
            }
        }
        return result

    }

    async maskEmail(email: string): Promise<string> {
        const [local, domain] = email.split('@');

        if (local.length <= 2) {
            return `${local[0]}*****@${domain}`;
        }

        const visible = local.slice(0, 3);
        return `${visible}*****@${domain}`;
    }

    async maskPhone(phone: string, visibleDigits = 4): Promise<string> {
        const masked = '*'.repeat(phone.length - visibleDigits);
        const visible = phone.slice(-visibleDigits);
        return `${masked}${visible}`;
    }

}