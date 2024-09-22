import { ApiProperty } from '@nestjs/swagger';
import { SituacaoConsulta } from '../../../domain/enums/situacao-consulta.enum';
import { IsNotEmpty } from '../../../infrastructure/decorators/is-not-empty/is-not-empty.decorator';

export class UpdateConsultaDto {
  @IsNotEmpty()
  @ApiProperty({
    description: `
      Situação da consulta
      `,
    example: '2024-09-21T12:00:00.000Z',
  })
  situacao: SituacaoConsulta;
}
