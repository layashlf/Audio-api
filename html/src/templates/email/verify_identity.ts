import { EmailMessageRequest } from "../../utils/types/email.types";

export async function verify_identity(dataInput: EmailMessageRequest) {

    let feLink
    if (typeof dataInput.body === 'object' && dataInput.body !== null) {
        feLink = `${process.env.FRONTEND_URL}/user/verify-email/${dataInput.body?.userId}`
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
    </style>
    <p>Hi ${dataInput.to},</p>
    <p>Thanks for signing up for our app.</p>
    <p>We just need to verify your email address to get started. Please click the link below to verify your email.</p>
    <a href="${feLink}" target="_blank">Verify Email</a>
    <p>Or copy and paste the following link in your browser:</p>
    <p>${feLink}</p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Thanks,</p>
    <p>The Team</p>
    `;
}
