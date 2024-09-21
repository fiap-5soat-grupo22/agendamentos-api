import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { SituacaoHorario } from '../../domain/enums/situacao-horario.enum';
import { Medico } from '../../domain/models/medico.model';

@Entity({
  name: 'horarios',
})
export class HorarioEntity {
  @ObjectIdColumn()
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
  situacao: SituacaoHorario;
}
