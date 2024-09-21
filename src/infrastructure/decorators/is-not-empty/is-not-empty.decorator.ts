import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function IsNotEmpty(_validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBlank',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: `campo ${propertyName} vazio`,
      },
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: string, _args: ValidationArguments): boolean {
          return value && typeof value === 'string' && value.trim() !== '';
        },
      },
    });
  };
}
