import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { Medico } from '../../domain/models/medico.model';
import { Paciente } from '../../domain/models/paciente.model';
import { SituacaoConsulta } from '../../domain/enums/situacao-consulta.enum';
import { ObjectId } from 'mongodb';

@Entity({
  name: 'consultas',
})
export class ConsultaEntity {
  @ObjectIdColumn()
  _id: ObjectId;

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
