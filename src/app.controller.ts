import { Body, Controller, GatewayTimeoutException, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
@ApiExcludeController()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  publish(@Body() body: any, @Req() request: FastifyRequest): unknown {
    console.info('BODY', JSON.stringify(body));
    console.info('HEADERS', JSON.stringify(request.headers));

    /** Exemplo: projects/fiap-tech-challenge-5soat/subscriptions/solicitacao_consulta */
    const subscription = body.subscription.split('/')[3];

    const resultado: boolean = this.eventEmitter.emit(
      subscription,
      Buffer.from(body['message'].data, 'base64').toString('utf-8'),
    );

    return resultado ? 'ok' : GatewayTimeoutException;
  }
}
