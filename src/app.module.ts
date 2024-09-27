import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacaoService } from './infrastructure/services/autenticacao/autenticacao.service';
import { HorariosModule } from './usecases/horarios/horarios.module';
import { HorarioEntity } from './infrastructure/entities/horario.entity';
import { DateService } from './infrastructure/services/date/date.service';
import { ConsultasModule } from './usecases/consultas/consultas.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConsultaEntity } from './infrastructure/entities/consulta.entity';
import { EventRepository } from './infrastructure/repositories/event/event.repository';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PubSub } from '@google-cloud/pubsub';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      renderPath: '/coverage',
      rootPath: join(__dirname.replaceAll('\\src', ''), '..', 'coverage', 'lcov-report'),
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      name: 'agendamentos',
      database: 'agendamentos',
      url: process.env.MONGODB_URL,
      authSource: 'admin',
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([HorarioEntity, ConsultaEntity], 'agendamentos'),
    RouterModule.register([
      {
        path: '/',
        children: [
          {
            path: '/',
            module: HorariosModule,
          },
          {
            path: '/',
            module: ConsultasModule,
          },
        ],
      },
    ]),
    EventEmitterModule.forRoot(),
    HorariosModule,
    ConsultasModule
  ],
  controllers: [AppController],
  providers: [AppService, AutenticacaoService, DateService, EventRepository,
    PubSub],
})
export class AppModule {}
