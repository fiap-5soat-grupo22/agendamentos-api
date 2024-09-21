import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const AcessoPublico = () => SetMetadata(IS_PUBLIC_KEY, true);
