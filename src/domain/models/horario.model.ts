import { SituacaoHorario } from '../enums/situacao-horario.enum';
import { Medico } from './medico.model';

export class Horario {
  uid: string;
  inicio: Date;
  fim: Date;
  tempo: number;
  medico: Medico;
  situacao: SituacaoHorario;
}
