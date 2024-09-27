import { Horario } from '../../domain/models/horario.model';
import { IRepository } from '../../infrastructure/interfaces/repository.interface';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IHorariosRepository extends IRepository<Horario, string> {
}
