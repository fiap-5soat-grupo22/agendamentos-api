import { BadRequestException, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { EventRepository } from './infrastructure/repositories/event/event.repository';
@Injectable()
export class AppService {
  constructor(private readonly eventRepository: EventRepository) {}

  publish(
    body: unknown,
    request: FastifyRequest,
  ): object | BadRequestException {
    console.info(
      'BODY',
      JSON.stringify(body),
      'HEADERS',
      JSON.stringify(request.headers),
    );

    if (this.eventRepository.subscription(body)) {
      return { statusCode: 200, message: 'OK' };
    } else {
      new BadRequestException('Falha na subscrição');
    }
  }
}
