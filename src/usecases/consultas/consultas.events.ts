import { Inject } from '@nestjs/common';
import { ConsultasService } from './consultas.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Consulta } from '../../domain/models/consulta.model';
import { EventosConsulta } from '../../infrastructure/enums/eventos-consulta.enum';

export class ConsultasController {
  @Inject()
  private readonly consultasService: ConsultasService;

  @OnEvent(EventosConsulta.Solicitada, { async: false })
  handleConsultaSolicitadaEvent(domain: Consulta) {
    return this.consultasService.create(domain);
  }
}
