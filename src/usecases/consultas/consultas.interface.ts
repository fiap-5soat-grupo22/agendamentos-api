import { Consulta } from '../../domain/models/consulta.model';
import { IRepository } from '../../infrastructure/interfaces/repository.interface';

export interface IConsultasRepository extends IRepository<Consulta, string> {}
