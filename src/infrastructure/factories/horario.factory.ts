import { Injectable } from '@nestjs/common';
import { IFactory } from '../interfaces/factory.interface';
import { Horario } from '../../domain/models/horario.model';
import { HorarioEntity } from '../entities/horario.entity';

@Injectable()
export class HorarioFactory implements IFactory<Horario, HorarioEntity> {
  toEntity(domain: Horario): HorarioEntity {
    if (!domain) return null;

    const entity = new HorarioEntity();

    entity.uid = domain.uid;
    entity.fim = domain?.fim;
    entity.inicio = domain?.inicio;
    entity.medico = domain?.medico;
    entity.situacao = domain?.situacao;
    entity.tempo = domain?.tempo;

    return entity;
  }

  toDomain(entity: HorarioEntity): Horario {
    if (!entity) return null;

    const domain: Horario = new Horario();

    domain.fim = entity.fim;
    domain.inicio = entity.inicio;
    domain.medico = entity.medico;
    domain.uid = entity.uid.toString();
    domain.situacao = entity.situacao;
    domain.tempo = entity.tempo;

    return domain;
  }
}
