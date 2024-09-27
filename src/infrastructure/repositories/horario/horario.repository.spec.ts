import { Test, TestingModule } from '@nestjs/testing';
import { HorarioRepository } from './horario.repository';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { HorarioEntity } from '../../entities/horario.entity';
import { HorarioFactory } from '../../factories/horario.factory';
import { CommonsService } from '../../services/commons/commons.service';
import { Horario } from '../../../domain/models/horario.model';
import { SituacaoHorario } from '../../../domain/enums/situacao-horario.enum';
import { Medico } from '../../../domain/models/medico.model';
import { ObjectId } from 'mongodb';

describe('HorarioRepository', () => {
  let service: HorarioRepository;
  let horarioFactory: HorarioFactory;

  const mockHorario: Horario = {
    uid: '66974b15529af1d850a03f19',
    inicio: new Date(),
    fim: new Date(),
    tempo: 0,
    medico: new Medico(),
    situacao: SituacaoHorario.Livre
  };

  const mockHorarioEntity: HorarioEntity = {
    _id: new ObjectId('66974b15529af1d850a03f19'),
    inicio: new Date(),
    fim: new Date(),
    tempo: 0,
    medico: new Medico(),
    situacao: SituacaoHorario.Livre
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockDataSource = (_config: object): Partial<DataSource> => ({
    name: 'agendamentos',
    destroy: jest.fn(),
    getMongoRepository: jest.fn().mockReturnValue({
      insertOne: jest.fn().mockResolvedValue({insertedId: mockHorario.uid }),
      deleteOne: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(mockHorarioEntity),
      findOne: jest.fn().mockResolvedValue(mockHorarioEntity),
      find: jest.fn().mockResolvedValue([mockHorarioEntity]),
      updateOne: jest.fn().mockResolvedValue({
        modifiedCount: 1,
        matchedCount: 1,
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HorarioRepository,
        HorarioFactory,
        {
          provide: getDataSourceToken('agendamentos'),
          useFactory: () =>
            mockDataSource({
              type: 'mongodb',
              entities: [HorarioEntity],
            }),
        },
        {
          provide: DataSource,
          useFactory: mockDataSource,
        },
        {
          provide: CommonsService,
          useValue: {
            queryFieldsArray: jest.fn().mockReturnValue(['uid']),
            queryFieldsObject: jest
              .fn()
              .mockReturnValue({ email: 'test@example.com' }),
          },
        },
      ],
    }).compile();

    service = module.get<HorarioRepository>(HorarioRepository);
    horarioFactory = module.get<HorarioFactory>(HorarioFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new Horario', async () => {
      const uid = await service.create(mockHorario);
      expect(uid).toBe(mockHorario.uid);
    });
  });

  describe('findAll', () => {
    it('should find all horarios', async () => {
      const horarios = await service.findAll(
        '0',
        '10',
        'uid',
        'email=test@example.com',
      );
      expect(horarios).toEqual([mockHorario]);
    });
  });

  describe('findOne', () => {
    it('should find a horario by uid', async () => {
      const horario = await service.findOne(mockHorario.uid, 'nome');
      expect(horario).toEqual(mockHorario);
    });

    it('should find a horario by uid without fields asked', async () => {
      const horario = await service.findOne(mockHorario.uid, null);
      expect(horario).toEqual(mockHorario);
    });
  });

  describe('update', () => {
    it('should update a horario', async () => {
      const result = await service.update(mockHorario.uid, mockHorario);
      expect(result).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove a horario', async () => {
      await expect(service.remove('66974b15529af1d850a03f19')).resolves.toBeTruthy();
    });
  });
});

