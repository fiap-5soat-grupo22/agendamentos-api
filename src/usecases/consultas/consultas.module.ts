import { Module } from '@nestjs/common';
import { ConsultasService } from './consultas.service';
import { ConsultasController } from './consultas.controller';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { ConsultaRepository } from '../../infrastructure/repositories/consulta/consulta.repository';
import { ConsultaFactory } from '../../infrastructure/factories/consulta.factory';
import { CommonsService } from '../../infrastructure/services/commons/commons.service';
import { DateService } from '../../infrastructure/services/date/date.service';
import { HorariosModule } from '../horarios/horarios.module';
import { HorariosService } from '../horarios/horarios.service';
import { HorarioRepository } from '../../infrastructure/repositories/horario/horario.repository';
import { HorarioFactory } from '../../infrastructure/factories/horario.factory';

@Module({
  imports: [HorariosModule],
  controllers: [ConsultasController],
  providers: [
    IdentityRepository,
    ConsultasService,
    ConsultaRepository,
    ConsultaFactory,
    CommonsService,
    DateService,
    HorariosService,
    HorarioRepository,
    HorarioFactory,
  ],
})
export class ConsultasModule {}
