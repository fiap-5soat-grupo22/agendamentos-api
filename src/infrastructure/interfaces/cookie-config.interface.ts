export interface CookieConfig {
  domain: string;
  expires: Date;
  httpOnly: boolean;
  maxAge: number;
  secure: boolean;
}
