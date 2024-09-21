import { FastifyReply } from 'fastify';
import { CookieConfig } from './cookie-config.interface';

export interface Reply extends FastifyReply {
  setCookie(name: string, value: string, options: CookieConfig): this;
  cookie(name: string, value: string, options: CookieConfig): this;
}
