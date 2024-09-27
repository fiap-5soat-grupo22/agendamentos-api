import { Test, TestingModule } from '@nestjs/testing';
import { IdentityRepository } from './identity.repository';
import { DecodedIdToken, FirebaseAuthError, getAuth as getAuthAdmin, UserMetadata } from 'firebase-admin/auth';
import { Cliente } from '../../../domain/models/cliente.model';
import {
  getAuth as getAuthApp,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';

jest.mock('firebase-admin/auth');
jest.mock('firebase/auth');

describe('IdentityRepository', () => {
  let service: IdentityRepository;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedGetAuthAdmin = getAuthAdmin as jest.MockedFunction<any>;
  const mockedCreateUser = jest.fn();
  const mockedGetUserByEmail = jest.fn();
  const mockedSetCustomUserClaims = jest.fn();
  const mockedUpdateUser = jest.fn();
  const mockedGetAuthApp = getAuthApp as jest.MockedFunction<
    typeof getAuthApp
  >;
  const mockedSignInWithEmailAndPassword =
    signInWithEmailAndPassword as jest.MockedFunction<
      typeof signInWithEmailAndPassword
    >;
  const mockedVerifyIdToken = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdentityRepository],
    }).compile();

    service = module.get<IdentityRepository>(IdentityRepository);
  });

  beforeEach(() => {
    mockedGetAuthAdmin.mockReturnValue({
      createUser: mockedCreateUser,
      getUserByEmail: mockedGetUserByEmail,
      setCustomUserClaims: mockedSetCustomUserClaims,
      updateUser: mockedUpdateUser,
      verifyIdToken: mockedVerifyIdToken,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWithPassword', () => {
    it('should create a new user with password', async () => {
      const cliente: Cliente = {
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        habilidades: ['JavaScript', 'TypeScript'],
        ativo: true,
      } as Cliente;
      const password = 'password123';
      const userId = 'someUserId';

      mockedCreateUser.mockResolvedValue({ uid: userId });

      const result = await service.createWithPassword(cliente, password);

      expect(result).toBe(userId);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'john.doe@example.com';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userRecord: any = {
        email: email,
        displayName: 'John Doe',
        uid: 'someUserId',
        disabled: false,
        emailVerified: true,
        cliente: {
          cpf: '12345678901',
          habilidades: ['JavaScript', 'TypeScript'],
          uid: 'someUserId',
        },
        metadata: new UserMetadata,
        providerData: [],
        toJSON: function (): object {
          throw new Error('Function not implemented.');
        }
      };
 
      mockedGetUserByEmail.mockResolvedValue(userRecord);

      const result = await service.findByEmail(email);

      expect(result).toEqual({
        email: userRecord.email,
        nome: userRecord.displayName,
        identity: userRecord.uid,
        ativo: !userRecord.disabled,
        cpf: userRecord.cliente.cpf,
        habilidades: userRecord.cliente.habilidades,
        uid: userRecord.cliente.uid,
      });
    });

    it('should return null if user not found', async () => {
      const email = 'john.doe@example.com';

      const firebaseError: FirebaseAuthError = new FirebaseAuthError('auth/user-not-found');

      mockedGetUserByEmail.mockRejectedValue(firebaseError);

      await expect(service.findByEmail(email)).resolves.toBeNull();
    });

    it('should throw error if other error occurs', async () => {
      const email = 'john.doe@example.com';

      mockedGetUserByEmail.mockRejectedValue(new Error('Some error'));

      await expect(service.findByEmail(email)).rejects.toThrowError(
        'Some error',
      );
    });
  });

  describe('setCustomUserClaims', () => {
    it('should set custom user claims', async () => {
      const uid = 'someUserId';
      const customClaims = {
        cpf: '12345678901',
        habilidades: ['JavaScript', 'TypeScript'],
        uid: 'someUserId',
      };

      mockedSetCustomUserClaims.mockResolvedValue(true);

      const result = await service.setCustomUserClaims(uid, customClaims);

      expect(mockedSetCustomUserClaims).toHaveBeenCalledWith(uid, {
        cliente: customClaims,
      });
      expect(result).toBe(true);
    });

    it('should return false if error occurs', async () => {
      const uid = 'someUserId';
      const customClaims = {
        cpf: '12345678901',
        habilidades: ['JavaScript', 'TypeScript'],
        uid: 'someUserId',
      };

      mockedSetCustomUserClaims.mockRejectedValue(new Error('Some error'));

      const result = await service.setCustomUserClaims(uid, customClaims);

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const uid = 'someUserId';
      const cliente: Cliente = {
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        habilidades: ['JavaScript', 'TypeScript'],
        ativo: true,
      } as Cliente;

      mockedUpdateUser.mockResolvedValue(true);

      const result = await service.update(uid, cliente);

      expect(mockedUpdateUser).toHaveBeenCalledWith(uid, {
        displayName: cliente.nome,
        email: cliente.email,
        disabled: !cliente.ativo,
      });
      expect(result).toBe(true);
    });
  });

  describe('signInWithEmailAndPassword', () => {
    it('should sign in with email and password', async () => {
      const email = 'john.doe@example.com';
      const password = 'password123';
      const idToken = 'someIdToken';
      const mockedUserCredential: UserCredential = {
        user: {
          getIdToken: jest.fn().mockResolvedValue(idToken),
        },
      } as unknown as UserCredential;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockedGetAuthApp.mockReturnValueOnce('app' as any);
      mockedSignInWithEmailAndPassword.mockResolvedValue(
        mockedUserCredential,
      );

      const result = await service.signInWithEmailAndPassword(email, password);

      expect(result).toBe(idToken);
    });
  });

  describe('verifyIdToken', () => {
    it('should verify ID token', async () => {
      const token = 'someIdToken';
      const decodedToken: DecodedIdToken = {
        uid: 'someUserId',
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        disabled: false,
        emailVerified: true,
        firebase: {
          sign_in_provider: 'password',
          identities: {}
        },
        cliente: {
          cpf: '12345678901',
          habilidades: ['JavaScript', 'TypeScript'],
          uid: 'someUserId',
        },
        aud: '',
        auth_time: 0,
        exp: 0,
        iat: 0,
        iss: '',
        sub: ''
      };

      mockedVerifyIdToken.mockResolvedValue(decodedToken);

      const result = await service.verifyIdToken(token);

      expect(mockedVerifyIdToken).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        identity: decodedToken.uid,
        email: decodedToken.email,
        nome: decodedToken.displayName,
        ativo: !decodedToken.disabled,
        cpf: decodedToken.cliente.cpf,
        habilidades: decodedToken.cliente.habilidades,
        uid: decodedToken.cliente.uid,
      });
    });
  });
});