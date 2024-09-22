import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsSelect, MongoRepository } from 'typeorm';
import { IConsultasRepository } from '../../../usecases/consultas/consultas.interface';
import { Consulta } from '../../../domain/models/consulta.model';
import { ConsultaEntity } from '../../entities/consulta.entity';
import { ConsultaFactory } from '../../factories/consulta.factory';
import { CommonsService } from '../../services/commons/commons.service';
import { UpdateResult, Document, ObjectId } from 'mongodb';

@Injectable()
export class ConsultaRepository implements IConsultasRepository {
  @InjectDataSource('agendamentos')
  private readonly dataSource: DataSource;

  @Inject()
  private readonly commonsService: CommonsService;

  @Inject()
  private readonly consultaFactory: ConsultaFactory;

  repository: MongoRepository<ConsultaEntity> = null;

  async create(domain: Consulta): Promise<string> {
    this.repository = this.dataSource.getMongoRepository(ConsultaEntity);
    const entity: ConsultaEntity = this.consultaFactory.toEntity(domain);
    const persisted: ConsultaEntity = await this.repository.save(entity);
    return persisted._id.toString();
  }

  async findAll(
    skip: string,
    take: string,
    fields?: string,
    filters?: string,
  ): Promise<Consulta[]> {
    this.repository = this.dataSource.getMongoRepository(ConsultaEntity);
    const domains: Array<Consulta> = [];

    const select = this.commonsService.queryFieldsArray(fields);
    const where = this.commonsService.queryFieldsObject(filters);

    const entities: Array<ConsultaEntity> = await this.repository.find({
      select,
      where,
      skip: parseInt(skip),
      take: parseInt(take),
    });

    entities.forEach((entity: ConsultaEntity) => {
      domains.push(this.consultaFactory.toDomain(entity));
    });

    return domains;
  }

  async findOne(uid: string, fields?: string): Promise<Consulta> {
    this.repository = this.dataSource.getMongoRepository(ConsultaEntity);
    const select = this.commonsService.queryFieldsArray(
      fields,
    ) as FindOptionsSelect<ConsultaEntity>;

    const entity: ConsultaEntity = await this.repository.findOne({
      select,
      where: { _id: new ObjectId(uid) },
    });

    return this.consultaFactory.toDomain(entity);
  }

  async update(uid: string, domain: Consulta): Promise<boolean> {
    this.repository = this.dataSource.getMongoRepository(ConsultaEntity);
    const entity: ConsultaEntity = this.consultaFactory.toEntity(domain);

    const resultado: Document | UpdateResult = await this.repository.updateOne(
      { _id: new ObjectId(uid) },
      { $set: entity },
      { upsert: false },
    );

    return resultado.modifiedCount == 1 && resultado.matchedCount == 1;
  }

  async remove(uid: string): Promise<boolean> {
    await this.repository.deleteOne({ _id: new ObjectId(uid) });

    return true;
  }

  async findConsultasReservados(uidMedico: string, inicio: Date, fim: Date) {
    this.repository = this.dataSource.getMongoRepository(ConsultaEntity);
    const domains: Array<Consulta> = [];
    const entities: Array<ConsultaEntity> = await this.repository.find({
      where: {
        'medico.uid': { $eq: uidMedico },
        $or: [
          { inicio: { $gt: inicio, $lt: fim } },
          { fim: { $gt: inicio, $lte: fim } },
        ],
      },
    });

    entities.forEach((entity: ConsultaEntity) => {
      domains.push(this.consultaFactory.toDomain(entity));
    });

    return domains;
  }
}
