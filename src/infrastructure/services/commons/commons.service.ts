import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonsService {
  /**
   *
   * @param fields Exemplo: 'campo1,campo2'
   * @returns Array com os campos
   */
  queryFieldsArray(fields: string): Array<string> {
    if (!fields) return null;

    if (typeof fields !== 'string') return null;

    const empty = fields.replaceAll(',', '').trim();

    if (empty === '') return null;

    const allowed: RegExp = new RegExp(/^[a-z0-9_]+$/i);

    if (!allowed.test(empty)) return null;

    return fields.split(',');
  }

  /**
   *
   * @param fields Exemplo: campo1=123224,campo2=true,campo3=João Silva
   * @returns A representação da string no formato de um objeto. Exemplo: {campo1=123224,campo2=true,campo3='João Silva'}
   */
  queryFieldsObject(fields: string): object {
    const objectFields: object = {};

    if (!fields) return objectFields;

    if (typeof fields !== 'string') return objectFields;

    const empty = fields.replaceAll(',', '').trim();

    if (empty === '') return objectFields;

    const allowed: RegExp = new RegExp(/^[a-z0-9_=. ]+$/i);

    fields.split(',').forEach((field: string) => {
      if (!allowed.test(field)) return;

      const [key, value] = field.split('=');

      if (key?.trim() === '' || value?.trim() === '') return;

      if (isNaN(new Number(value).valueOf())) {
        // eslint-disable-next-line security/detect-object-injection
        objectFields[key] =
          value === 'true' || value === 'false' ? value === 'true' : value;
      } else {
        // eslint-disable-next-line security/detect-object-injection
        objectFields[key] = new Number(value).valueOf();
      }
    });

    return objectFields;
  }
}
