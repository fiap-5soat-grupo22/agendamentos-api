import { Module } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { HorariosController } from './horarios.controller';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { HorarioRepository } from '../../infrastructure/repositories/horario/horario.repository';
import { HorarioFactory } from '../../infrastructure/factories/horario.factory';
import { CommonsService } from '../../infrastructure/services/commons/commons.service';
import { DateService } from '../../infrastructure/services/date/date.service';
import { EventRepository } from '../../infrastructure/repositories/event/event.repository';
import { HorariosEvents } from './horarios.events';
import { PubSub } from '@google-cloud/pubsub';

@Module({
  controllers: [HorariosController],
  providers: [
    IdentityRepository,
    HorariosService,
    HorarioRepository,
    HorarioFactory,
    EventRepository,
    CommonsService,
    DateService,
    HorariosEvents,
    { provide: PubSub, useClass: PubSub },
  ],
})
export class HorariosModule {}
