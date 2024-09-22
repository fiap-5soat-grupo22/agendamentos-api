import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { SituacaoHorario } from '../../domain/enums/situacao-horario.enum';
import { Medico } from '../../domain/models/medico.model';
import { ObjectId } from 'mongodb';

@Entity({
  name: 'horarios',
})
export class HorarioEntity {
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
  situacao: SituacaoHorario;
}
