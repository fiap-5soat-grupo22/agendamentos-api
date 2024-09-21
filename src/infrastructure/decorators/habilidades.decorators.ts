import { SetMetadata } from '@nestjs/common';
import { Habilidade } from '../../domain/enums/habilidade.enum';

export const HABILIDADES_KEY = 'habilidades';

export const Habilidades = (...habilidades: Habilidade[]) =>
  SetMetadata(HABILIDADES_KEY, habilidades);
