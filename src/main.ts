import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';

import fastifyCookie from '@fastify/cookie';

import helmet from '@fastify/helmet';

import fastifyCsrf from '@fastify/csrf-protection';

import { ValidationPipe, VersioningType } from '@nestjs/common';

import { initializeApp as firebaseAdmin } from 'firebase-admin/app';

import { initializeApp as firebaseApp } from 'firebase/app';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

console.info(process.env);

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      rawBody: true,
    },
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.register(helmet);

  await app.register(fastifyCsrf);

  firebaseAdmin({
    projectId: process.env.PROJECT_ID,
  });

  firebaseApp({
    apiKey: process.env.FIREBASE_API_KEY,
  });

  await app.register(fastifyCookie, {
    secret: 'fiap',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Health&Med - Clientes API')
    .setDescription(
      `
      🎯Conjunto de recursos e operações para gestão dos agendamentos da operadora de plano de saúde Health&Med
      
      📕 Algumas dicas:
        👉 As operações POST /v1/medicos e POST /v1/pacientes não necessitam de autenticação
        👉 As operações POST /v1/medicos/oauth2/access-token e POST /v1/pacientes/oauth2/access-token utilizam o tipo de autenticação Basic (email e senha)
        👉 As demais operações necessitam de um Access Token que pode ser obtido nas operações mencionadas acima
      `,
    )
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'basic',
      },
      'basic',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    explorer: false,
    swaggerUrl: 'docs',
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

bootstrap();
