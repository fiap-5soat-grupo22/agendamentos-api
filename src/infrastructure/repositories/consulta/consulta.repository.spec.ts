import { Test, TestingModule } from '@nestjs/testing';
import { ConsultaRepository } from './consulta.repository';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ConsultaEntity } from '../../entities/consulta.entity';
import { ConsultaFactory } from '../../factories/consulta.factory';
import { CommonsService } from '../../services/commons/commons.service';
import { Consulta } from '../../../domain/models/consulta.model';
import { SituacaoConsulta } from '../../../domain/enums/situacao-consulta.enum';
import { Medico } from '../../../domain/models/medico.model';
import { Paciente } from '../../../domain/models/paciente.model';
import { ObjectId } from 'mongodb';

describe('ConsultaRepository', () => {
  let service: ConsultaRepository;
  let consultaFactory: ConsultaFactory;

  const mockConsulta: Consulta = {
    uid: '66974b15529af1d850a03f19',
    inicio: new Date(),
    fim: new Date(),
    tempo: 0,
    paciente: new Paciente(),
    medico: new Medico(),
    situacao: SituacaoConsulta.Agendada
  };

  const mockConsultaEntity: ConsultaEntity = {
    _id: new ObjectId('66974b15529af1d850a03f19'),
    inicio: new Date(),
    fim: new Date(),
    tempo: 0,
    paciente: new Paciente(),
    medico: new Medico(),
    situacao: SituacaoConsulta.Agendada
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockDataSource = (_config: object): Partial<DataSource> => ({
    name: 'agendamentos',
    destroy: jest.fn(),
    getMongoRepository: jest.fn().mockReturnValue({
      insertOne: jest.fn().mockResolvedValue({insertedId: mockConsulta.uid }),
      deleteOne: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(mockConsultaEntity),
      findOne: jest.fn().mockResolvedValue(mockConsultaEntity),
      find: jest.fn().mockResolvedValue([mockConsultaEntity]),
      updateOne: jest.fn().mockResolvedValue({
        modifiedCount: 1,
        matchedCount: 1,
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultaRepository,
        ConsultaFactory,
        {
          provide: getDataSourceToken('agendamentos'),
          useFactory: () =>
            mockDataSource({
              type: 'mongodb',
              entities: [ConsultaEntity],
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

    service = module.get<ConsultaRepository>(ConsultaRepository);
    consultaFactory = module.get<ConsultaFactory>(ConsultaFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new Consulta', async () => {
      const uid = await service.create(mockConsulta);
      expect(uid).toBe(mockConsulta.uid);
    });
  });

  describe('findAll', () => {
    it('should find all consultas', async () => {
      const consultas = await service.findAll(
        '0',
        '10',
        'uid',
        'email=test@example.com',
      );
      expect(consultas).toEqual([mockConsulta]);
    });
  });

  describe('findOne', () => {
    it('should find a consulta by uid', async () => {
      const consulta = await service.findOne(mockConsulta.uid, 'nome');
      expect(consulta).toEqual(mockConsulta);
    });

    it('should find a consulta by uid without fields asked', async () => {
      const consulta = await service.findOne(mockConsulta.uid, null);
      expect(consulta).toEqual(mockConsulta);
    });
  });

  describe('update', () => {
    it('should update a consulta', async () => {
      const result = await service.update(mockConsulta.uid, mockConsulta);
      expect(result).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove a consulta', async () => {
      await expect(service.remove('66974b15529af1d850a03f19')).resolves.toBeTruthy();
    });
  });
});

