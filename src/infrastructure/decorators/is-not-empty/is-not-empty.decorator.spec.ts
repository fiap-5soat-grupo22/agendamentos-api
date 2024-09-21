import { IsNotEmpty } from "./is-not-empty.decorator";
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

class MockDto {
  @IsNotEmpty()
  name: string;
};

describe('IsNotEmptyDecorator', () => {
  describe('success', () => {
    it('shoud return success', () => {
      const createUserDto = plainToClass(MockDto, {
        name: 'Admin',
      });
      const errors = validateSync(createUserDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('error', () => {
    it('shoud return error empty', () => {
      const createUserDto = plainToClass(MockDto, {
        name: '',
      });
      const errors = validateSync(createUserDto);
      expect(errors).toHaveLength(1);
    });
    
    it('shoud return error blank spaces', () => {
      const createUserDto = plainToClass(MockDto, {
        name: '          ',
      });
      const errors = validateSync(createUserDto);
      expect(errors).toHaveLength(1);
    });
  });
});
