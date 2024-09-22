import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { HorarioRepository } from '../../infrastructure/repositories/horario/horario.repository';
import { Horario } from '../../domain/models/horario.model';
import { differenceInMinutes, isBefore } from 'date-fns';
import { SituacaoHorario } from '../../domain/enums/situacao-horario.enum';
import { Cliente } from '../../domain/models/cliente.model';
import { Medico } from '../../domain/models/medico.model';
import { DateService } from '../../infrastructure/services/date/date.service';
import { HorarioFactory } from '../../infrastructure/factories/horario.factory';

@Injectable()
export class HorariosService {
  @Inject()
  private readonly horarioRepository: HorarioRepository;

  @Inject()
  private readonly dateService: DateService;

  @Inject()
  private readonly horarioFactory: HorarioFactory;

  async create(
    createHorarioDto: CreateHorarioDto,
    cliente: Cliente,
  ): Promise<object> {
    const domain: Horario = this.createDomainFromDto(createHorarioDto, cliente);

    this.checkDateRules(domain);

    const resultado = await this.horarioRepository.findHorariosReservados(
      cliente.uid,
      domain.inicio,
      domain.fim,
    );

    if (resultado.length > 0) {
      throw new BadRequestException('Horário não disponível para reserva');
    }

    const uid = await this.horarioRepository.create(domain);
    return { uid };
  }

  findAll(skip: string, take: string, fields: string, filters: string) {
    return this.horarioRepository.findAll(skip, take, fields, filters);
  }

  async findOne(uid: string, fields: string) {
    return this.horarioRepository.findOne(uid, fields);
  }

  async update(uid: string, dto: UpdateHorarioDto, medico: Medico) {
    const persisted = await this.findToUpdate(uid, medico);

    const domain: Horario = this.updateDomainFromDto(dto, persisted);

    this.checkDateRules(domain);

    /**
     * Garantir que não há horários sobrepostos
     */
    const horarios = await this.horarioRepository.findHorariosReservados(
      persisted.medico.uid,
      domain.inicio,
      domain.fim,
    );

    horarios.forEach((horario) => {
      if (horario.uid !== uid) {
        throw new BadRequestException('Horário não disponível para reserva');
      }
    });

    await this.horarioRepository.update(uid, domain);

    if (domain.situacao === SituacaoHorario.Reservado) {
      /**
       * Devemos lançar um evento para que a reserva se atualize.
       */
    }

    return {
      message: 'ok',
      statusCode: 200,
    };
  }

  async remove(uid: string, medico: Medico) {
    const persisted = await this.findToUpdate(uid, medico);

    if (persisted.situacao === SituacaoHorario.Reservado) {
      //* Enmviar evento de cancelamento da consulta
    }

    return this.horarioRepository.remove(uid);
  }

  private createDomainFromDto(
    dto: CreateHorarioDto,
    cliente: Cliente,
  ): Horario {
    const domain = new Horario();

    domain.inicio = this.dateService.dtoToDate(dto.inicio);
    domain.fim = this.dateService.dtoToDate(dto.fim);
    domain.tempo = differenceInMinutes(domain.fim, domain.inicio);
    domain.medico = cliente as Medico;
    domain.situacao = SituacaoHorario.Livre;

    return domain;
  }

  private updateDomainFromDto(dto: UpdateHorarioDto, domain: Horario): Horario {
    domain.inicio = this.dateService.dtoToDate(dto.inicio);
    domain.fim = this.dateService.dtoToDate(dto.fim);
    domain.tempo = differenceInMinutes(domain.fim, domain.inicio);
    return domain;
  }

  private checkDateRules(domain: Horario): void {
    if (isBefore(domain.inicio, this.dateService.now())) {
      throw new BadRequestException(
        'A data inicio e a data fim devem estar no futuro',
      );
    }

    if (domain.tempo < 10 || isNaN(domain.tempo)) {
      throw new BadRequestException(
        'A data de inicio deve ser anterior a data fim com um intervalo de no mínimo 10 minutos.'
      );
    }
  }

  private async findToUpdate(uid: string, medico: Medico): Promise<Horario> {
    const fields = 'inicio,fim,situacao,tempo,medico';

    const domain = await this.horarioRepository.findOne(uid, fields);

    if (!domain) throw new NotFoundException('horário não encontrado');

    console.info(medico.uid.toString(), domain.medico.uid.toString());

    if (medico.uid.toString() !== domain.medico.uid.toString()) {
      throw new ForbiddenException('Este usuário não pode realizar essa ação');
    }

    return domain;
  }
}
