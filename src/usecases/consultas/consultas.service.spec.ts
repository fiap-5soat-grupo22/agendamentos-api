import { Test, TestingModule } from '@nestjs/testing';
import { ConsultasService } from './consultas.service';
import { ConsultaRepository } from '../../infrastructure/repositories/consulta/consulta.repository';
import { DateService } from '../../infrastructure/services/date/date.service';
import { HorariosService } from '../horarios/horarios.service';
import { EventRepository } from '../../infrastructure/repositories/event/event.repository';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { Cliente } from '../../domain/models/cliente.model';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Consulta } from '../../domain/models/consulta.model';
import { SituacaoHorario } from '../../domain/enums/situacao-horario.enum';
import { SituacaoConsulta } from '../../domain/enums/situacao-consulta.enum';
import { UpdateConsultaDto } from './dto/update-consulta.dto';

describe('ConsultasService', () => {
  let service: ConsultasService;
  let consultaRepository: ConsultaRepository;
  let dateService: DateService;
  let horariosService: HorariosService;
  let eventRepository: EventRepository;

  const mockCliente: Cliente = {
    uid: 'user-id',
  } as Cliente;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultasService,
        {
          provide: ConsultaRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: DateService,
          useValue: {
            now: jest.fn(),
          },
        },
        {
          provide: HorariosService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: EventRepository,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConsultasService>(ConsultasService);
    consultaRepository = module.get<ConsultaRepository>(ConsultaRepository);
    dateService = module.get<DateService>(DateService);
    horariosService = module.get<HorariosService>(HorariosService);
    eventRepository = module.get<EventRepository>(EventRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scheduling', () => {
    it('should throw BadRequestException if horario is not available', async () => {
      const createConsultaDto: CreateConsultaDto = {
        uidHorario: 'horario-id',
      };

      jest
        .spyOn(horariosService, 'findOne')
        .mockResolvedValue(
          { 
            situacao: SituacaoHorario.Reservado ,
            fim: null,
            inicio: null,
            medico: null,
            tempo: null,
            uid: null
          });

      await expect(
        service.scheduling(createConsultaDto, mockCliente),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should throw BadRequestException if horario is in the past', async () => {
      const createConsultaDto: CreateConsultaDto = {
        uidHorario: 'horario-id',
      };

      jest.spyOn(horariosService, 'findOne').mockResolvedValue(
        { 
          situacao: SituacaoHorario.Reservado ,
          fim: null,
          inicio: null,
          medico: null,
          tempo: null,
          uid: null
        }
      );
      jest.spyOn(dateService, 'now').mockReturnValue(new Date('2023-04-02'));

      await expect(
        service.scheduling(createConsultaDto, mockCliente),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should create a consulta scheduling', async () => {
      const createConsultaDto: CreateConsultaDto = {
        uidHorario: 'horario-id',
      };

      jest.spyOn(horariosService, 'findOne').mockResolvedValue(        { 
        situacao: SituacaoHorario.Livre ,
        fim: null,
        inicio: null,
        medico: null,
        tempo: null,
        uid: null
      });
      jest.spyOn(dateService, 'now').mockReturnValue(new Date('2023-04-02'));

      await service.scheduling(createConsultaDto, mockCliente);

      expect(eventRepository.publish).toHaveBeenCalledWith(
        'projects/fiap-tech-challenge-5soat/topics/consulta',
        'consulta.solicitada',
        expect.objectContaining({
          paciente: mockCliente,
          situacao: SituacaoConsulta.Agendada,
        }),
        true,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of consultas', async () => {
      await service.findAll('0', '10', '', '');

      expect(consultaRepository.findAll).toHaveBeenCalledWith(
        '0',
        '10',
        '',
        '',
      );
    });
  });

  describe('findOne', () => {
    it('should return a consulta', async () => {
      await service.findOne('consulta-id', '');

      expect(consultaRepository.findOne).toHaveBeenCalledWith('consulta-id', '');
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if user is not allowed to update', async () => {
      const updateConsultaDto: UpdateConsultaDto = {
        situacao: SituacaoConsulta.Cancelada,
      };
      jest.spyOn(consultaRepository, 'findOne').mockResolvedValue({
        paciente: { uid: 'different-user-id' },
        medico: { uid: 'different-user-id' },
      } as Consulta);

      await expect(
        service.update('consulta-id', updateConsultaDto, mockCliente),
      ).rejects.toThrowError(ForbiddenException);
    });

    it('should update a consulta', async () => {
      const updateConsultaDto: UpdateConsultaDto = {
        situacao: SituacaoConsulta.Cancelada,
      };
      jest.spyOn(consultaRepository, 'findOne').mockResolvedValue({
        paciente: { uid: 'user-id' },
      } as Consulta);

      await service.update('consulta-id', updateConsultaDto, mockCliente);

      expect(consultaRepository.update).toHaveBeenCalledWith(
        'consulta-id',
        expect.objectContaining({
          situacao: SituacaoConsulta.Cancelada,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException if user is not allowed to remove', async () => {
      jest.spyOn(consultaRepository, 'findOne').mockResolvedValue({
        paciente: { uid: 'different-user-id' },
        medico: { uid: 'different-user-id' },
      } as Consulta);

      await expect(
        service.remove('consulta-id', mockCliente),
      ).rejects.toThrowError(ForbiddenException);
    });

    it('should remove a consulta', async () => {
      const consulta: Consulta = {
        uid: 'consulta-id',
        paciente: { uid: 'user-id' },
      } as Consulta;
      jest.spyOn(consultaRepository, 'findOne').mockResolvedValue(consulta);

      await service.remove('consulta-id', mockCliente);

      expect(eventRepository.publish).toHaveBeenCalledWith(
        'projects/fiap-tech-challenge-5soat/topics/consulta',
        'consulta.cancelada',
        consulta,
        true,
      );
      expect(consultaRepository.remove).toHaveBeenCalledWith('consulta-id');
    });
  });

  describe('create', () => {
    it('should create a consulta', async () => {
      const consulta: Consulta = {
        uid: 'consulta-id',
      } as Consulta;

      await service.create(consulta);

      expect(eventRepository.publish).toHaveBeenCalledWith(
        'projects/fiap-tech-challenge-5soat/topics/consulta',
        'consulta.criada',
        consulta,
        true,
      );
      expect(consultaRepository.create).toHaveBeenCalledWith(consulta);
    });
  });
});

