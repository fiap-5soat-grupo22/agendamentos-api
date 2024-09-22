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
    return this.appService.getHello();
  }

  @Post()
  publish(@Body() body: any, @Req() request: FastifyRequest): string {
    console.info(body);
    console.info(request.headers);
    return 'ok';
  }
}
