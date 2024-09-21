import { SituacaoConsulta } from '../enums/situacao-consulta.enum';
import { Medico } from './medico.model';
import { Paciente } from './paciente.model';

export class Consulta {
  uid: string;
  inicio: Date;
  fim: Date;
  tempo: number;
  paciente: Paciente;
  medico: Medico;
  situacao: SituacaoConsulta;
}
