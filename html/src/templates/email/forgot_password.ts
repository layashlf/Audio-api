import { EmailMessageRequest } from "../../utils/types/email.types";

export const forgot_password = (dataInput: EmailMessageRequest) => {

    let feLink
    if (typeof dataInput.body === 'object' && dataInput.body !== null) {
        feLink = `${process.env.FRONTEND_URL}/auth/forgot-password?userId=${dataInput.body?.userId}&otp=${dataInput.body?.otp}`
    }
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Reset Password Email</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
            /* add your custom css styles here */
            * {
                font-family: Arial, sans-serif;
                -webkit-font-smoothing: antialiased;
                -webkit-text-size-adjust: none;
                box-sizing: border-box;
            }
            body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                background-color: #f1f1f1;
            }
            .container {
                display: block !important;
                clear: both !important;
                margin: 0 auto;
                max-width: 580px;
                padding: 10px;
            }
            h1 {
                margin: 0;
                font-size: 32px;
                font-weight: bold;
                line-height: 1.2;
                color: #333333;
            }
            p {
                margin: 0;
                font-size: 14px;
                line-height: 1.5;
                color: #666666;
            }
            .button {
                background-color: #4CAF50;
                /* Green */
                border: none;
                color: white;
                padding: 15px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                cursor: pointer;
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.6; width: 100%; background-color: #f1f1f1;">
            <tr>
                <td style="vertical-align: middle; text-align: center; padding: 20px;" class="container">
                    <div style="font-size: 24px; text-align: center; color: #333333; padding: 10px;">Reset Password</div>
                    <div style="font-size: 16px; text-align: center; color: #666666; padding: 10px;">
                        Hello ${dataInput.to},
                        <br/>
                        <br/>
                        We received a request to reset your password.
                        <br/>
                        <br/>
                        <a target="_blank" href="${feLink}" class="button">Reset Password</a>
                        <br/>
                        <p> ${feLink}</p>
                        <br/>
                        If you did not request a password reset, please ignore this email.
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}