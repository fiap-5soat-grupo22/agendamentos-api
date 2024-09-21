import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from '../../../infrastructure/decorators/is-not-empty/is-not-empty.decorator';
import { IsDateString } from 'class-validator';

export class CreateHorarioDto {
  @IsNotEmpty()
  @IsDateString(
    {},
    {
      message: `inicio inválido`,
    },
  )
  @ApiProperty({
    description: `
      data e hora de inicio no formato ISO. É necessário ser ao menos 10 minutos antes da data fim
      `,
    example: '2024-09-21T12:00:00.000Z',
  })
  inicio: Date;

  @IsNotEmpty()
  @IsDateString(
    {},
    {
      message: `fim inválido`,
    },
  )
  @ApiProperty({
    description: `
    data e hora de fim no formato ISO. É necessário ser ao menos 10 minutos depois da data inicio
    `,
    example: '2024-09-21T12:10:00.000Z',
  })
  fim: Date;
}
