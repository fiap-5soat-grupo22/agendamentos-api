import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsSelect, MongoRepository } from 'typeorm';
import { IHorariosRepository } from '../../../usecases/horarios/horarios.interface';
import { Horario } from '../../../domain/models/horario.model';
import { HorarioEntity } from '../../entities/horario.entity';
import { HorarioFactory } from '../../factories/horario.factory';
import { CommonsService } from '../../services/commons/commons.service';
import { UpdateResult, Document, ObjectId } from 'mongodb';

@Injectable()
export class HorarioRepository implements IHorariosRepository {
  @InjectDataSource('agendamentos')
  private readonly dataSource: DataSource;

  @Inject()
  private readonly commonsService: CommonsService;

  @Inject()
  private readonly horarioFactory: HorarioFactory;

  repository: MongoRepository<HorarioEntity> = null;

  async create(domain: Horario): Promise<string> {
    this.repository = this.dataSource.getMongoRepository(HorarioEntity);
    const entity: HorarioEntity = this.horarioFactory.toEntity(domain);
    const persisted: HorarioEntity = await this.repository.save(entity);
    return persisted.uid;
  }

  async findAll(
    skip: string,
    take: string,
    fields?: string,
    filters?: string,
  ): Promise<Horario[]> {
    this.repository = this.dataSource.getMongoRepository(HorarioEntity);
    const domains: Array<Horario> = [];

    const select = this.commonsService.queryFieldsArray(fields);
    const where = this.commonsService.queryFieldsObject(filters);

    const entities: Array<HorarioEntity> = await this.repository.find({
      select,
      where,
      skip: parseInt(skip),
      take: parseInt(take),
    });

    entities.forEach((entity: HorarioEntity) => {
      domains.push(this.horarioFactory.toDomain(entity));
    });

    return domains;
  }

  async findOne(uid: string, fields?: string): Promise<Horario> {
    this.repository = this.dataSource.getMongoRepository(HorarioEntity);
    const select = this.commonsService.queryFieldsArray(
      fields,
    ) as FindOptionsSelect<HorarioEntity>;

    const entity: HorarioEntity = await this.repository.findOne({
      select,
      where: { _id: new ObjectId(uid) },
    });

    return this.horarioFactory.toDomain(entity);
  }

  async update(uid: string, domain: Horario): Promise<boolean> {
    this.repository = this.dataSource.getMongoRepository(HorarioEntity);
    const entity: HorarioEntity = this.horarioFactory.toEntity(domain);

    const resultado: Document | UpdateResult = await this.repository.updateOne(
      { _id: new ObjectId(uid) },
      { $set: entity },
      { upsert: false },
    );

    return resultado.modifiedCount == 1 && resultado.matchedCount == 1;
  }

  remove(uid: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findHorariosReservados(uidMedico: string, inicio: Date, fim: Date) {
    this.repository = this.dataSource.getMongoRepository(HorarioEntity);
    const domains: Array<Horario> = [];
    const entities: Array<HorarioEntity> = await this.repository.find({
      where: {
        'medico.uid': { $eq: uidMedico },
        $or: [
          { inicio: { $gt: inicio, $lt: fim } },
          { fim: { $gt: inicio, $lte: fim } },
        ],
      },
    });

    entities.forEach((entity: HorarioEntity) => {
      domains.push(this.horarioFactory.toDomain(entity));
    });

    return domains;
  }
}
