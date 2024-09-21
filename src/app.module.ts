import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacaoService } from './infrastructure/services/autenticacao/autenticacao.service';
import { HorariosModule } from './usecases/horarios/horarios.module';
import { HorarioEntity } from './infrastructure/entities/horario.entity';
import { DateService } from './infrastructure/services/date/date.service';

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
        ],
      },
    ]),
    HorariosModule,
  ],
  controllers: [AppController],
  providers: [AppService, AutenticacaoService, DateService],
})
export class AppModule {}
