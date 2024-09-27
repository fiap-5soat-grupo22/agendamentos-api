import { Consulta } from '../../domain/models/consulta.model';
import { IRepository } from '../../infrastructure/interfaces/repository.interface';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IConsultasRepository extends IRepository<Consulta, string> {}
