import { Injectable } from '@nestjs/common';
import { addHours } from 'date-fns';
import { Medico } from '../../../domain/models/medico.model';
import { Paciente } from '../../../domain/models/paciente.model';
import { CookieConfig } from '../../../infrastructure/interfaces/cookie-config.interface';
import { Reply } from '../../../infrastructure/interfaces/reply.interface';
import { FastifyRequest } from 'fastify';

@Injectable()
export class AutenticacaoService {
  extractCredentials(base64Credentials: string): Array<string> {
    try {
      const decoded = Buffer.from(
        base64Credentials?.split(' ')[1],
        'base64',
      ).toString('utf-8');

      return decoded.split(':');
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  cookiesConfig(token: string, domain: Medico | Paciente): object {
    return {
      expires: addHours(new Date(), 1),
      httpOnly: true,
      maxAge: 3600,
      secure: false,
      access_token: token,
      domain,
    };
  }

  setCookiesResponse(
    request: FastifyRequest,
    response: Reply,
    configuracao: object,
  ): void {
    const config: CookieConfig = configuracao as CookieConfig;

    config.domain = request.hostname.split(':')[0];

    response.setCookie('Authorization', config['access_token'], config);
    response.setCookie(
      'Authorized-User',
      JSON.stringify(config['usuario']),
      config,
    );

    response.send({ access_token: config['access_token'] });
  }
}
