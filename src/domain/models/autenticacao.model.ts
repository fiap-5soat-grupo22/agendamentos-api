import { Cliente } from './cliente.model';

export class Autenticacao {
  uid: string;
  cliente: Cliente;
  data: Date;
  access_token: string;
  validade: Date;
  headers: Map<string, string>;
}
