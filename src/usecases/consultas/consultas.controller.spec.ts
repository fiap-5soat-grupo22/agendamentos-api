import { Test, TestingModule } from '@nestjs/testing';
import { ConsultasController } from './consultas.controller';
import { ConsultasService } from './consultas.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { FastifyRequest } from 'fastify';
import { Consulta } from '../../domain/models/consulta.model';
import { SituacaoConsulta } from '../../domain/enums/situacao-consulta.enum';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';

describe('ConsultasController', () => {
  let controller: ConsultasController;
  let service: ConsultasService;

  const mockRequest = {
    cliente: {
      uid: 'user-id',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsultasController],
      providers: [
        IdentityRepository,
        {
          provide: ConsultasService,
          useValue: {
            scheduling: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConsultasController>(ConsultasController);
    service = module.get<ConsultasService>(ConsultasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createV1', () => {
    it('should create a consulta scheduling', async () => {
      const createConsultaDto: CreateConsultaDto = {
        uidHorario: 'horario-id',
      };

      await controller.createV1(
        mockRequest as unknown as FastifyRequest,
        createConsultaDto,
      );

      expect(service.scheduling).toHaveBeenCalledWith(
        createConsultaDto,
        mockRequest['cliente'],
      );
    });
  });

  describe('findAllV1', () => {
    it('should return an array of consultas', async () => {
      await controller.findAllV1('0', '10', '', 'situacao=agendada');

      expect(service.findAll).toHaveBeenCalledWith('0', '10', '', 'situacao=agendada');
    });
  });

  describe('findOneV1', () => {
    it('should return a consulta', async () => {
      await controller.findOneV1('consulta-id', 'inicio,fim,situacao');

      expect(service.findOne).toHaveBeenCalledWith(
        'consulta-id',
        'inicio,fim,situacao',
      );
    });
  });

  describe('updateV1', () => {
    it('should update a consulta', async () => {
      const updateConsultaDto: UpdateConsultaDto = {
        situacao: SituacaoConsulta.Cancelada,
      };

      await controller.updateV1(
        mockRequest as unknown as FastifyRequest,
        'consulta-id',
        updateConsultaDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        'consulta-id',
        updateConsultaDto,
        mockRequest['cliente'],
      );
    });
  });

  describe('remove', () => {
    it('should remove a consulta', async () => {
      await controller.remove(
        mockRequest as unknown as FastifyRequest,
        'consulta-id',
      );

      expect(service.remove).toHaveBeenCalledWith(
        'consulta-id',
        mockRequest['cliente'],
      );
    });
  });

  describe('handleConsultaSolicitadaEvent', () => {
    it('should create a consulta', async () => {
      const consulta: Consulta = {
        uid: 'consulta-id',
      } as Consulta;

      await controller.handleConsultaSolicitadaEvent(consulta);

      expect(service.create).toHaveBeenCalledWith(consulta);
    });
  });
});