import {
  BadRequestException,
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

@Injectable()
export class HorariosService {
  @Inject()
  private readonly horarioRepository: HorarioRepository;

  async create(
    createHorarioDto: CreateHorarioDto,
    cliente: Cliente,
  ): Promise<object> {
    const domain: Horario = this.createDomainFromDto(createHorarioDto, cliente);

    this.validate(domain);

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

  async update(uid: string, dto: UpdateHorarioDto) {
    const domain: Horario = this.updateDomainFromDto(dto);

    this.validate(domain);

    // const resultado = await this.horarioRepository.findHorariosReservados(
    //   cliente.uid,
    //   domain.inicio,
    //   domain.fim,
    // );

    // if (resultado.length > 0) {
    //   throw new BadRequestException('Horário não disponível para reserva');
    // }

    const resultUpdate = await this.horarioRepository.update(uid, domain);

    if (!resultUpdate) {
      throw new NotFoundException('horário não encontrado');
    }

    return {
      message: 'ok',
      statusCode: 200,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} horario`;
  }

  createDomainFromDto(dto: CreateHorarioDto, cliente: Cliente): Horario {
    const domain = new Horario();

    domain.inicio = new Date(dto.inicio);
    domain.fim = new Date(dto.fim);
    domain.tempo = differenceInMinutes(domain.fim, domain.inicio);
    domain.medico = cliente as Medico;
    domain.situacao = SituacaoHorario.Livre;

    return domain;
  }

  updateDomainFromDto(dto: UpdateHorarioDto): Horario {
    const domain = new Horario();

    domain.inicio = new Date(dto.inicio);
    domain.fim = new Date(dto.fim);
    domain.tempo = differenceInMinutes(domain.fim, domain.inicio);
    domain.situacao = SituacaoHorario.Livre;

    return domain;
  }

  validate(domain: Horario): void {
    if (isBefore(domain.inicio, new Date())) {
      throw new BadRequestException(
        'A data inicio e a data fim devem estar no futuro',
      );
    }

    if (domain.tempo < 10 || isNaN(domain.tempo)) {
      throw new BadRequestException(
        'A diferença entre a data inicio e a data fim deve ser de no mínimo 10 minutos',
      );
    }
  }
}
