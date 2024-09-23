import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HorariosService } from './horarios.service';
import { EventosConsulta } from '../../infrastructure/enums/eventos-consulta.enum';
import { Consulta } from '../../domain/models/consulta.model';

@Injectable()
export class HorariosEvents {
  @Inject()
  private readonly horariosService: HorariosService;

  @OnEvent(EventosConsulta.Criada, { async: false })
  handleConsultaCriadaEvent(domain: Consulta) {
    return this.horariosService.updateStatusConsultaCriada(domain);
  }

  @OnEvent(EventosConsulta.Cancelada, { async: false })
  handleConsultaCanceladaEvent(domain: Consulta) {
    return this.horariosService.updateStatusConsultaLivre(domain);
  }
}
