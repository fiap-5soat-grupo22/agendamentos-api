import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from '../../../infrastructure/decorators/is-not-empty/is-not-empty.decorator';
import { IsMongoId } from 'class-validator';

export class CreateConsultaDto {
  @IsNotEmpty()
  @IsMongoId({
    message: 'O código do horário fornecido é inválido.',
  })
  @ApiProperty({
    description: `
      Código identificador do horário para agendamento da consulta. Esse código é obtido através da consulta de horários disponíveis de um médico.
      `,
    example: '66eefea01ebd9fc4c2636420',
  })
  uidHorario: string;
}
