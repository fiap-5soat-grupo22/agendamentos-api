import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

@Controller()
@ApiExcludeController()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'online';
  }

  @Post()
  publish(@Body() body: unknown, @Req() request: FastifyRequest): unknown {
    return this.appService.publish(body, request);
  }
}
