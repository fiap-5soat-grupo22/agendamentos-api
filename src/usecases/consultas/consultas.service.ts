import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { ConsultaRepository } from '../../infrastructure/repositories/consulta/consulta.repository';
import { Consulta } from '../../domain/models/consulta.model';
import { isBefore } from 'date-fns';
import { SituacaoConsulta } from '../../domain/enums/situacao-consulta.enum';
import { Cliente } from '../../domain/models/cliente.model';
import { DateService } from '../../infrastructure/services/date/date.service';
import { HorariosService } from '../horarios/horarios.service';
import { Horario } from '../../domain/models/horario.model';
import { Paciente } from '../../domain/models/paciente.model';
import { SituacaoHorario } from '../../domain/enums/situacao-horario.enum';
import { EventRepository } from '../../infrastructure/repositories/event/event.repository';
import { EventosConsulta } from '../../infrastructure/enums/eventos-consulta.enum';

@Injectable()
export class ConsultasService {
  @Inject()
  private readonly consultaRepository: ConsultaRepository;

  @Inject()
  private readonly dateService: DateService;

  @Inject()
  private readonly horariosService: HorariosService;

  @Inject()
  private readonly eventRepository: EventRepository;

  async scheduling(
    createConsultaDto: CreateConsultaDto,
    cliente: Cliente,
  ): Promise<object> {
    const horario: Horario = await this.horariosService.findOne(
      createConsultaDto.uidHorario,
      null,
    );

    if (horario.situacao !== SituacaoHorario.Livre) {
      throw new BadRequestException(
        'Horário não disponível para agendamento de consulta',
      );
    }

    if (isBefore(horario.inicio, this.dateService.now())) {
      throw new BadRequestException(
        'A data inicio e a data fim devem estar no futuro',
      );
    }

    const consulta: Consulta = horario as unknown as Consulta;
    consulta.paciente = cliente as Paciente;
    consulta.situacao = SituacaoConsulta.Agendada;

    await this.eventRepository.publish(
      EventosConsulta.Topic,
      EventosConsulta.Solicitada,
      consulta,
      true,
    );

    return {
      message: 'ok',
      statusCode: 200,
    };
  }

  findAll(skip: string, take: string, fields: string, filters: string) {
    return this.consultaRepository.findAll(skip, take, fields, filters);
  }

  async findOne(uid: string, fields: string) {
    return this.consultaRepository.findOne(uid, fields);
  }

  async update(uid: string, dto: UpdateConsultaDto, cliente: Cliente) {
    const domain: Consulta = await this.findToUpdate(uid, cliente);

    /** Pode ser que tenha que validar a situação que permite alteração */
    domain.situacao = dto.situacao;

    this.consultaRepository.update(uid, domain);

    return {
      message: 'ok',
      statusCode: 200,
    };
  }

  async remove(uid: string, cliente: Cliente) {
    const domain: Consulta = await this.findToUpdate(uid, cliente);

    if (domain.situacao === SituacaoConsulta.Agendada) {
      //* Enmviar evento de cancelamento da consulta
    }

    await this.consultaRepository.remove(uid);

    await this.eventRepository.publish(
      EventosConsulta.Topic,
      EventosConsulta.Cancelada,
      domain,
      true,
    );

    return {
      message: 'ok',
      statusCode: 200,
    };
  }

  async create(domain: Consulta): Promise<boolean> {
    await this.consultaRepository.create(domain);

    await this.eventRepository.publish(
      EventosConsulta.Topic,
      EventosConsulta.Criada,
      domain,
      true,
    );

    return true;
  }

  private async findToUpdate(uid: string, cliente: Cliente): Promise<Consulta> {
    const domain: Consulta = await this.consultaRepository.findOne(uid, null);

    /** Garante que quem está fazendo a operação está envolvido na consulta */
    if (
      domain.paciente.uid.toString() !== cliente.uid.toString() &&
      domain.medico.uid.toString() !== cliente.uid.toString()
    ) {
      throw new ForbiddenException('Usuário sem acesso para essa operação');
    }

    return domain;
  }
}
