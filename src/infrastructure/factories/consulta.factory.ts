import { Injectable } from '@nestjs/common';
import { IFactory } from '../interfaces/factory.interface';
import { Consulta } from '../../domain/models/consulta.model';
import { ConsultaEntity } from '../entities/consulta.entity';

@Injectable()
export class ConsultaFactory implements IFactory<Consulta, ConsultaEntity> {
  toEntity(domain: Consulta): ConsultaEntity {
    if (!domain) return null;

    const entity = new ConsultaEntity();

    entity.uid = domain.uid;
    entity.fim = domain?.fim;
    entity.inicio = domain?.inicio;
    entity.medico = domain?.medico;
    entity.situacao = domain?.situacao;
    entity.tempo = domain?.tempo;
    entity.paciente = domain?.paciente;

    return entity;
  }

  toDomain(entity: ConsultaEntity): Consulta {
    if (!entity) return null;

    const domain: Consulta = new Consulta();

    domain.fim = entity.fim;
    domain.inicio = entity.inicio;
    domain.medico = entity.medico;
    domain.uid = entity.uid.toString();
    domain.situacao = entity.situacao;
    domain.tempo = entity.tempo;
    domain.paciente = entity.paciente;

    return domain;
  }
}
