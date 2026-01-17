export const mailConstants = {
  action_type: {
    FORGOT_PASSWORD: {
      action: 'FORGOT_PASSWORD',
      subject: 'Password Reset Link',
    },
    VERIFY_IDENTITY: {
      action: 'VERIFY_IDENTITY',
      subject: 'Please verify your email',
    },
    REQUEST_OTP: { action: 'REQUEST_OTP', subject: 'Do not  share this OTP' },
  },
};

export const privilegedActions = {
  MANAGE_MFA: 'MANAGE_MFA',
  DISABLE_MFA: 'DISABLE_MFA',
};
