import { Horario } from '../../domain/models/horario.model';
import { IRepository } from '../../infrastructure/interfaces/repository.interface';

export interface IHorariosRepository extends IRepository<Horario, string> {
}
