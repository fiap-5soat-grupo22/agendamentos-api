import { Injectable } from '@nestjs/common';
import {
  DecodedIdToken,
  FirebaseAuthError,
  getAuth as getAuthAdmin,
  UserRecord,
} from 'firebase-admin/auth';

import {
  getAuth as getAuthApp,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { Cliente } from '../../../domain/models/cliente.model';
import { IAutenticacaoRepository } from '../../../domain/interfaces/autenticacao.interface';

@Injectable()
export class IdentityRepository implements IAutenticacaoRepository {
  async createWithPassword(domain: Cliente, password: string): Promise<string> {
    const userRecord: UserRecord = await getAuthAdmin().createUser({
      email: domain.email,
      emailVerified: false,
      password: password,
      displayName: domain.nome,
      disabled: false,
    });

    return userRecord.uid;
  }

  async findByEmail(email: string): Promise<Cliente> {
    try {
      const userRecord: UserRecord = await getAuthAdmin().getUserByEmail(email);
      return this.fromUserRecord(userRecord);
    } catch (error) {
      if (error instanceof FirebaseAuthError) {
        return null;
      } else {
        throw error;
      }
    }
  }

  async setCustomUserClaims(
    uid: string,
    customClains: object,
  ): Promise<boolean> {
    try {
      await getAuthAdmin().setCustomUserClaims(uid, {
        cliente: customClains,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(entity: Cliente): Promise<string> {
    throw new Error('Method not implemented.');
  }

  findAll(): Promise<Array<Cliente>> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findOne(uid: string): Promise<Cliente> {
    throw new Error('Method not implemented.');
  }

  async update(uid: string, entity: Cliente): Promise<boolean> {
    await getAuthAdmin().updateUser(uid, {
      displayName: entity.nome,
      email: entity.email,
      disabled: !entity.ativo,
    });

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(uid: string): Promise<boolean> {
    throw 'Método não implementado';
  }

  async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<string> {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      getAuthApp(),
      email,
      password,
    );
    return userCredential.user.getIdToken();
  }

  async verifyIdToken(token: string): Promise<Cliente> {
    const decoded: DecodedIdToken = await getAuthAdmin().verifyIdToken(token);
    return this.fromUserRecord(decoded);
  }

  private fromUserRecord(entity: UserRecord | DecodedIdToken): Cliente {
    const domain: Cliente = new Cliente();

    console.info(entity);

    domain.email = entity.email;
    domain.nome = entity.displayName || entity['cliente']['nome'];
    domain.identity = entity.uid;
    domain.ativo = !entity.disabled;
    domain.cpf = entity['cliente']['cpf'];
    domain.habilidades = entity['cliente']['habilidades'];
    domain.uid = entity['cliente']['uid'];

    //Caso seja médico
    domain['crm'] = entity['cliente']['crm'];

    return domain;
  }
}
