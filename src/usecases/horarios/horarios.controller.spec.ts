import { Test, TestingModule } from '@nestjs/testing';
import { HorariosController } from './horarios.controller';
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { FastifyRequest } from 'fastify';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';

describe('HorariosController', () => {
  let controller: HorariosController;
  let horariosService: HorariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HorariosController],
      providers: [
        {
          provide: HorariosService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        IdentityRepository
      ],
    }).compile();

    controller = module.get<HorariosController>(HorariosController);
    horariosService = module.get<HorariosService>(HorariosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new horario', async () => {
      const createHorarioDto: CreateHorarioDto = {
        inicio: new Date('2023-10-26T10:00:00.000Z'),
        fim: new Date('2023-10-26T11:00:00.000Z'),
      };
      const request = {
        cliente: {
          uid: '123',
        },
      };
      const expectedResult = { uid: '456' };
      (horariosService.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(request as unknown as FastifyRequest, createHorarioDto);

      expect(result).toEqual(expectedResult);
      expect(horariosService.create).toHaveBeenCalledWith(
        createHorarioDto,
        request.cliente,
      );
    });
  });

  describe('findAllV1', () => {
    it('should return an array of horarios', async () => {
      const expectedResult = [{ uid: '123' }];
      (horariosService.findAll as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findAllV1('0', '10', 'inicio,fim', null);

      expect(result).toEqual(expectedResult);
      expect(horariosService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOneV1', () => {
    it('should return a horario', async () => {
      const expectedResult = { uid: '123' };
      (horariosService.findOne as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findOneV1('123', 'inicio,fim');

      expect(result).toEqual(expectedResult);
      expect(horariosService.findOne).toHaveBeenCalled();
    });
  });

  describe('updateV1', () => {
    it('should update a horario', async () => {
      const updateHorarioDto: UpdateHorarioDto = {
        inicio: new Date('2023-10-26T11:00:00.000Z'),
        fim: new Date('2023-10-26T12:00:00.000Z'),
      };
      const request = {
        cliente: {
          uid: '123',
        },
      };
      const expectedResult = {
        message: 'ok',
        statusCode: 200,
      };
      (horariosService.update as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.updateV1(
        request as unknown as FastifyRequest,
        '123',
        updateHorarioDto,
      );

      expect(result).toEqual(expectedResult);
      expect(horariosService.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a horario', async () => {
      const request = {
        cliente: {
          uid: '123',
        },
      };
      const expectedResult = {
        message: 'ok',
        statusCode: 200,
      };
      (horariosService.remove as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.remove(request as unknown as FastifyRequest, '123');

      expect(result).toEqual(expectedResult);
      expect(horariosService.remove).toHaveBeenCalled();
    });
  });
});