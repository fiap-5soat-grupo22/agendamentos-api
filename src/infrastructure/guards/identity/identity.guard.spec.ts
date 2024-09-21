import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IdentityGuard } from './identity.guard';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { TestBed } from '@automock/jest';
import { Reflector } from '@nestjs/core';
import { Usuario } from '@sortfy/nestjs-domain';
import { IdentityService } from '../../services/identity/identity.service';
import { Habilidade } from '../../domains/enums/habilidade.enum';

function mockContext(headers: object): DeepMocked<ExecutionContext> {
  return createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
      }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  });    
}

function createUser(): Usuario {
  const usuario = new Usuario();
  
  usuario.nome  = "foo"
  usuario.email = "foo@gmail.com"
  usuario.uid   = "n9r4hf42083fn083bfy2048"
  usuario.habilidades = [
    Habilidade.Gestao_Acesso_Colaborador_Consultar, 
    Habilidade.Gestao_Acesso_Colaborador_Excluir,
  ]
  return usuario;
}

function headers(): object {
  return {
    authorization: `Bearer asdasdas.sadasdaads.asdasdas`,
  }
}

const habilidades = [
  Habilidade.Gestao_Acesso_Colaborador_Consultar, 
  Habilidade.Gestao_Acesso_Colaborador_Excluir,
]

describe('IdentityGuard', () => {
  const serviceMock = TestBed.create(IdentityGuard).compile();
  const service: IdentityGuard = serviceMock.unit;
  let identityServiceMock: jest.Mocked<IdentityService>;
  let reflectorMock: jest.Mocked<Reflector>

  beforeAll(() => {})

  beforeEach(async () => {
    identityServiceMock = serviceMock.unitRef.get(IdentityService);
    reflectorMock = serviceMock.unitRef.get(Reflector);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('can activate public', () => {
    it('deve permitir o acesso publico', async () => {

      reflectorMock.getAllAndOverride.mockReturnValue(null)
  
      identityServiceMock.verifyIdToken.mockResolvedValue(createUser());

      const context: ExecutionContext = mockContext(headers())

      expect(await service.canActivate(context)).toBeTruthy()
    });
  });

  describe('can activate private', () => {
    it('deve permitir o acesso apenas para o perfil autorizado', async () => {

      reflectorMock.getAllAndOverride.mockReturnValue(habilidades)
  
      identityServiceMock.verifyIdToken.mockResolvedValue(createUser());

      const context: ExecutionContext = mockContext(headers())

      expect(await service.canActivate(context)).toBeTruthy()
    });
  });  

  describe('cannot activate user has no role', () => {
    it('não deve permitir o acesso para usuários sem o papel necessário', async () => {

      reflectorMock.getAllAndOverride.mockReturnValue({administracao: "admin"})
  
      identityServiceMock.verifyIdToken.mockResolvedValue(createUser());

      const context: ExecutionContext = mockContext(headers())

      await expect(async () => await service.canActivate(context)).rejects.toThrow(UnauthorizedException)
    });
  });

  describe('cannot activate user has no role at all', () => {
    it('não deve permitir o acesso privado para usuários sem nenhum papel', async () => {

      reflectorMock.getAllAndOverride.mockReturnValue(habilidades)

      const user = createUser();
      
      user.habilidades = null;
  
      identityServiceMock.verifyIdToken.mockResolvedValue(user);

      const context: ExecutionContext = mockContext(headers())

      await expect(async () => await service.canActivate(context)).rejects.toThrow(UnauthorizedException)
    });
  });

  describe('cannot activate invalid token', () => {
    it('Não deve permitir o acesso', async () => {
      reflectorMock.getAllAndOverride.mockReturnValue(habilidades)
  
      identityServiceMock.verifyIdToken.mockRejectedValueOnce('Erro');

      const context: ExecutionContext = mockContext(headers())
      await expect(async () => await service.canActivate(context)).rejects.toThrow(UnauthorizedException)
    });
  });

  describe('cannot activate no token', () => {
    it('Não deve permitir o acesso', async () => {
      const headers = {
        authorization: `Bearer `,
      }

      const context: ExecutionContext = mockContext(headers)
      await expect(async () => await service.canActivate(context)).rejects.toThrow(UnauthorizedException)
    });
  });

  describe('cannot activate no header', () => {
    it('Não deve permitir o acesso', async () => {
      const context: ExecutionContext = mockContext({})
      await expect(async () => await service.canActivate(context)).rejects.toThrow(UnauthorizedException)
    });
  });
});