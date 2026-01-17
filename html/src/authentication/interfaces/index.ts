export interface ITokenPayload {
  sub: string;
  data?: Record<string, string> | string[] | string | null;
  isTwoFactorAuthenticated?: boolean;
}
