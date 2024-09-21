import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Habilidade } from '../../../domain/enums/habilidade.enum';
import { HABILIDADES_KEY } from '../../decorators/habilidades.decorators';
import { Cliente } from '../../../domain/models/cliente.model';
import { IS_PUBLIC_KEY } from '../../decorators/acesso-publico.decorators';
import { IdentityRepository } from '../../repositories/identity/identity.repository';

@Injectable()
export class IdentityGuard implements CanActivate {
  @Inject()
  private identityRepository: IdentityRepository;

  @Inject()
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const roles = this.reflector.getAllAndOverride<Habilidade[]>(
      HABILIDADES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Nenhum token informado');
    }
    return this.identityRepository
      .verifyIdToken(token)
      .then((cliente: Cliente) => {
        request['cliente'] = cliente;
        return this.hasHabilidade(
          cliente['habilidades'] as Array<string>,
          roles,
        );
      })
      .catch((error) => {
        if (error instanceof ForbiddenException) {
          throw error;
        } else {
          throw new UnauthorizedException(error.toString() || 'Token inválido');
        }
      });
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private hasHabilidade(
    userHabilidades: string[],
    allowedHabilidades: Habilidade[],
  ): boolean {
    if (!allowedHabilidades || allowedHabilidades.length == 0) {
      return true;
    }

    if (!userHabilidades || userHabilidades.length == 0) {
      throw 'user has no roles';
    }

    /** FOR e não forEach por razões de performance */
    for (let i = 0; i < allowedHabilidades.length; i++) {
      for (let k = 0; k < userHabilidades.length; k++) {
        // eslint-disable-next-line security/detect-object-injection
        if (allowedHabilidades[i].toString() === userHabilidades[k]) {
          return true;
        }
      }
    }

    throw new ForbiddenException('feature not allowed to this user');
  }
}
