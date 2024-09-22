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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      name: 'agendamentos',
      database: 'agendamentos',
      url: process.env.MONGODB_URL,
      authSource: 'admin',
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([HorarioEntity], 'agendamentos'),
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
    HorariosModule,
    ConsultasModule,
  ],
  controllers: [AppController],
  providers: [AppService, AutenticacaoService, DateService],
})
export class AppModule {}
