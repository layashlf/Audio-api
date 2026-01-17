import { EmailMessageRequest } from "../../utils/types/email.types";

export async function request_otp(dataInput: EmailMessageRequest) {
    let otp
    if (typeof dataInput.body === 'object' && dataInput.body !== null) {
        otp = `${dataInput.body.text}`
    }
    return `
    <style>
    p {
        font-family: Arial, sans-serif;
        font-size: 16px;
    }
    a {
        color: #337ab7;
        text-decoration: none;
    }
    .otp{
        color: #337ab7;
        text-decoration: none;
        font-size: 28px;
    }
    .warning{
        color: red;
        font-size: 20px;
        text-transform: uppercase;
    }
    </style>
    <p>Hi ${dataInput.to},</p>
    
    <p class="otp warning">DO not share this otp</p>
    <p class="otp">${otp}</p>
    <p>If you didn't request this, please report this email.</p>
    <p>Thanks,</p>
    <p>The Team</p>
    `;
}
