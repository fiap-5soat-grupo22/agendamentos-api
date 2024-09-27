/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { HorariosService } from './horarios.service';
import { HorarioRepository } from '../../infrastructure/repositories/horario/horario.repository';
import { DateService } from '../../infrastructure/services/date/date.service';
import { EventRepository } from '../../infrastructure/repositories/event/event.repository';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SituacaoHorario } from '../../domain/enums/situacao-horario.enum';
import { Consulta } from '../../domain/models/consulta.model';
import { UpdateHorarioDto } from './dto/update-horario.dto';

describe('HorariosService', () => {
  let service: HorariosService;
  let horarioRepository: HorarioRepository;
  let dateService: DateService;
  let eventRepository: EventRepository;

  const mockCliente = {
    uid: '123',
  };

  const mockMedico = {
    uid: '123',
  };

  const mockCreateHorarioDto: CreateHorarioDto = {
    inicio: new Date('2023-10-27T10:00:00.000Z'),
    fim: new Date('2023-10-27T11:00:00.000Z'),
  };

  const mockUpdateHorarioDto: UpdateHorarioDto = {
    inicio: new Date('2023-10-27T11:00:00.000Z'),
    fim: new Date('2023-10-27T12:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HorariosService,
        {
          provide: HorarioRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findHorariosReservados: jest.fn(),
          },
        },
        {
          provide: DateService,
          useValue: {
            dtoToDate: jest.fn((date) => new Date(date)),
            now: jest.fn(() => new Date('2023-10-26T10:00:00.000Z')),
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

    service = module.get<HorariosService>(HorariosService);
    horarioRepository = module.get<HorarioRepository>(HorarioRepository);
    dateService = module.get<DateService>(DateService);
    eventRepository = module.get<EventRepository>(EventRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new horario', async () => {
      const expectedResult = { uid: '456' };
      (horarioRepository.create as jest.Mock).mockResolvedValue(
        expectedResult.uid,
      );
      (horarioRepository.findHorariosReservados as jest.Mock).mockResolvedValue(
        [],
      );

      const result = await service.create(
        mockCreateHorarioDto,
        mockCliente as any,
      );

      expect(result).toEqual(expectedResult);
      expect(horarioRepository.create).toHaveBeenCalled();
    });

    it('should throw an error if the start date is not before the end date', async () => {
      const createHorarioDto: CreateHorarioDto = {
        ...mockCreateHorarioDto,
        inicio: new Date('2023-10-27T11:00:00.000Z'),
        fim: new Date('2023-10-27T10:00:00.000Z'),
      };

      await expect(
        service.create(createHorarioDto, mockCliente as any),
      ).rejects.toThrow(BadRequestException);
      expect(horarioRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if the time difference is less than 10 minutes', async () => {
      const createHorarioDto: CreateHorarioDto = {
        ...mockCreateHorarioDto,
        fim: new Date('2023-10-27T10:09:00.000Z'),
      };

      await expect(
        service.create(createHorarioDto, mockCliente as any),
      ).rejects.toThrow(BadRequestException);
      expect(horarioRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if the start date is in the past', async () => {
      const createHorarioDto: CreateHorarioDto = {
        ...mockCreateHorarioDto,
        inicio: new Date('2023-10-25T10:00:00.000Z'),
      };

      await expect(
        service.create(createHorarioDto, mockCliente as any),
      ).rejects.toThrow(BadRequestException);
      expect(horarioRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if there is already a reserved time slot for the same period', async () => {
      (horarioRepository.findHorariosReservados as jest.Mock).mockResolvedValue(
        [
          {
            uid: '1',
          },
        ],
      );

      await expect(
        service.create(mockCreateHorarioDto, mockCliente as any),
      ).rejects.toThrow(BadRequestException);
      expect(horarioRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of horarios', async () => {
      const expectedResult = [{ uid: '123' }];
      (horarioRepository.findAll as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await service.findAll('0', '10', 'inicio,fim', null);

      expect(result).toEqual(expectedResult);
      expect(horarioRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a horario', async () => {
      const expectedResult = { uid: '123' };
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await service.findOne('123', 'inicio,fim');

      expect(result).toEqual(expectedResult);
      expect(horarioRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a horario', async () => {
      const persisted = {
        uid: '123',
        inicio: new Date('2023-10-27T10:00:00.000Z'),
        fim: new Date('2023-10-27T11:00:00.000Z'),
        tempo: 60,
        medico: mockMedico,
        situacao: SituacaoHorario.Livre,
      };
      const expectedResult = {
        message: 'ok',
        statusCode: 200,
      };
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(persisted);
      (horarioRepository.findHorariosReservados as jest.Mock).mockResolvedValue(
        [],
      );
      (horarioRepository.update as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await service.update(
        '123',
        mockUpdateHorarioDto,
        mockMedico as any,
      );

      expect(result).toEqual(expectedResult);
      expect(horarioRepository.update).toHaveBeenCalled();
    });

    it('should throw an error if the start date is not before the end date', async () => {
      const persisted = {
        uid: '123',
        inicio: new Date('2023-10-27T10:00:00.000Z'),
        fim: new Date('2023-10-27T11:00:00.000Z'),
        tempo: 60,
        medico: mockMedico,
        situacao: SituacaoHorario.Livre,
      };
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(persisted);

      await expect(
        service.update('123', {
          ...mockUpdateHorarioDto,
          inicio: new Date('2023-10-27T12:00:00.000Z'),
          fim: new Date('2023-10-27T11:00:00.000Z'),
        }, mockMedico as any),
      ).rejects.toThrow(BadRequestException);
      expect(horarioRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if the time difference is less than 10 minutes', async () => {
      const persisted = {
        uid: '123',
        inicio: new Date('2023-10-27T10:00:00.000Z'),
        fim: new Date('2023-10-27T11:00:00.000Z'),
        tempo: 60,
        medico: mockMedico,
        situacao: SituacaoHorario.Livre,
      };
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(persisted);

      await expect(
        service.update('123', {
          ...mockUpdateHorarioDto,
          fim: new Date('2023-10-27T11:09:00.000Z'),
        }, mockMedico as any),
      ).rejects.toThrow(BadRequestException);
      expect(horarioRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if the start date is in the past', async () => {
      const persisted = {
        uid: '123',
        inicio: new Date('2023-10-27T10:00:00.000Z'),
        fim: new Date('2023-10-27T11:00:00.000Z'),
        tempo: 60,
        medico: mockMedico,
        situacao: SituacaoHorario.Livre,
      };
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(persisted);

      await expect(
        service.update('123', {
          ...mockUpdateHorarioDto,
          inicio: new Date('2023-10-25T10:00:00.000Z'),
        }, mockMedico as any),
      ).rejects.toThrow(BadRequestException);
      expect(horarioRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if there is already a reserved time slot for the same period', async () => {
      const persisted = {
        uid: '123',
        inicio: new Date('2023-10-27T10:00:00.000Z'),
        fim: new Date('2023-10-27T11:00:00.000Z'),
        tempo: 60,
        medico: mockMedico,
        situacao: SituacaoHorario.Livre,
      };
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(persisted);
      (horarioRepository.findHorariosReservados as jest.Mock).mockResolvedValue(
        [
          {
            uid: '456',
          },
        ],
      );

      await expect(
        service.update('123', mockUpdateHorarioDto, mockMedico as any),
      ).rejects.toThrow(BadRequestException);
      expect(horarioRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if the horario is not found', async () => {
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.update('123', mockUpdateHorarioDto, mockMedico as any),
      ).rejects.toThrow(NotFoundException);
      expect(horarioRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not the owner of the horario', async () => {
      const persisted = {
        uid: '123',
        inicio: new Date('2023-10-27T10:00:00.000Z'),
        fim: new Date('2023-10-27T11:00:00.000Z'),
        tempo: 60,
        medico: {
          uid: '456',
        },
        situacao: SituacaoHorario.Livre,
      };
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(persisted);

      await expect(
        service.update('123', mockUpdateHorarioDto, mockMedico as any),
      ).rejects.toThrow(ForbiddenException);
      expect(horarioRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('updateStatusConsultaCriada', () => {
    it('should update the status of the horario to Reservado', async () => {
      const domain: Consulta = {
        uid: '123',
      } as any;
      const horario = {
        uid: '123',
        situacao: SituacaoHorario.Livre,
      };
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(horario);
      (horarioRepository.update as jest.Mock).mockResolvedValue({});

      const result = await service.updateStatusConsultaCriada(domain);

      expect(result).toEqual({
        message: 'ok',
        statusCode: 200,
      });
      expect(horarioRepository.update).toHaveBeenCalledWith('123', {
        ...horario,
        situacao: SituacaoHorario.Reservado,
      });
    });
  });

  describe('updateStatusConsultaLivre', () => {
    it('should update the status of the horario to Livre', async () => {
      const domain: Consulta = {
        uid: '123',
      } as any;
      const horario = {
        uid: '123',
        situacao: SituacaoHorario.Reservado,
      };
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(horario);
      (horarioRepository.update as jest.Mock).mockResolvedValue({});

      const result = await service.updateStatusConsultaLivre(domain);

      expect(result).toEqual({
        message: 'ok',
        statusCode: 200,
      });
      expect(horarioRepository.update).toHaveBeenCalledWith('123', {
        ...horario,
        situacao: SituacaoHorario.Livre,
      });
    });
  });

  describe('remove', () => {
    it('should remove a horario', async () => {
      const persisted = {
        uid: '123',
        inicio: new Date('2023-10-27T10:00:00.000Z'),
        fim: new Date('2023-10-27T11:00:00.000Z'),
        tempo: 60,
        medico: mockMedico,
        situacao: SituacaoHorario.Livre,
      };
      (horarioRepository.findOne as jest.Mock).mockResolvedValue(persisted);
      const expectedResult = {
        message: 'ok',
        statusCode: 200,
      };
      (horarioRepository.remove as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await service.remove('123', mockMedico as any);

      expect(result).toEqual(expectedResult);
      expect(horarioRepository.remove).toHaveBeenCalledWith('123');
    });
  });
});