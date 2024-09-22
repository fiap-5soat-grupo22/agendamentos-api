import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { SituacaoHorario } from '../../domain/enums/situacao-horario.enum';
import { Medico } from '../../domain/models/medico.model';
import { Paciente } from '../../domain/models/paciente.model';
import { SituacaoConsulta } from '../../domain/enums/situacao-consulta.enum';

@Entity({
  name: 'consultas',
})
export class ConsultaEntity {
  @ObjectIdColumn({
    name: '_id',
  })
  uid: string;

  @Column({ type: 'datetime' })
  inicio: Date;

  @Column({ type: 'timestamp' })
  fim: Date;

  @Column()
  tempo: number;

  @Column()
  medico: Medico;

  @Column()
  paciente: Paciente;

  @Column()
  situacao: SituacaoConsulta;
}
