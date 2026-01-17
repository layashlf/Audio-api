import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { EmailMessageRequest } from './types/email.types';
import { mailConstants } from '../config/constant';
import { forgot_password } from '../templates/email/forgot_password';
import { verify_identity } from '../templates/email/verify_identity';
import { request_otp } from '../templates/email/request_otp';

@Injectable()
export class EmailService {
    private emailProvider;

    constructor(private readonly configService: ConfigService) {
        this.emailProvider = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: false, // use SSL
            auth: {
                user: this.configService.get<string>('MAIL_USERNAME'),
                pass: this.configService.get<string>('MAIL_PASSWORD'),
            },
        });
    }

    public async sendEmail(message: EmailMessageRequest, action: string) {
        let result;
        try {
            const formattedMessage = await this.createEmailTemplate(message, action);
            result = await this.emailProvider.sendMail(formattedMessage);
        } catch (e: unknown) {
            console.log('error', e);
        }
        return result;
    }

    async createEmailTemplate(emailData: EmailMessageRequest, action: string) {
        let html: string = '';
        let subject: string = '';
        switch (action) {
            case mailConstants.action_type.FORGOT_PASSWORD.action:
                html = await forgot_password(emailData);
                subject = mailConstants.action_type.FORGOT_PASSWORD.subject
                break;
            case mailConstants.action_type.VERIFY_IDENTITY.action:
                html = await  verify_identity(emailData);
                subject = mailConstants.action_type.VERIFY_IDENTITY.subject
                break;
            case mailConstants.action_type.REQUEST_OTP.action:
                html = await  request_otp(emailData);
                subject = mailConstants.action_type.REQUEST_OTP.subject
                break;
            default:
                html=''
                break;
        }

        const emailTemplate = {
            to: emailData.to.trim(),
            from: `${this.configService.get<string>('MAIL_FROM_NAME')} <${this.configService.get<string>('MAIL_FROM')}>`,
            subject: subject,
            text: typeof emailData.body === 'string' ? emailData.body : emailData.body.text,
            html,
        };
        return emailTemplate
    }

}
