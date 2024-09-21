import { Test, TestingModule } from "@nestjs/testing";
import { CommonsService } from "./commons.service";

describe('CommonsService', () => {
  let service: CommonsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonsService],
    }).compile();

    service = module.get<CommonsService>(CommonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queryFieldsArray success', () => {
    it('Deve retornar um array de string', async () => {
      expect(service.queryFieldsArray('nome,email,_id')).toBeInstanceOf(Array)
    });
  }); 

  describe('queryFieldsArray error typeOf', () => {
    it('Deve retornar nulo', async () => {
      expect(service.queryFieldsArray(12323 as unknown as string)).toBeNull()
    });
  });

  describe('queryFieldsArray error null', () => {
    it('Deve retornar nulo', async () => {
      expect(service.queryFieldsArray(null)).toBeNull()
    });
  });

  describe('queryFieldsArray error empty', () => {
    it('Deve retornar nulo', async () => {
      expect(service.queryFieldsArray(',,,,,,,,,')).toBeNull()
    });
  }); 

  describe('queryFieldsArray error regex', () => {
    it('Deve retornar nulo', async () => {
      expect(service.queryFieldsArray('&,*,,*,       ,,,,,')).toBeNull()
    });
  }); 

  describe('queryFieldsObject success', () => {
    it('Deve retornar um objeto com as respectivas propriedades', async () => {
      expect(service.queryFieldsObject('ativo=true,tipo=colaborador,conta=123234.12345,pais=França,nome=João da Silva')).toStrictEqual({
        ativo: true, tipo: 'colaborador', conta: 123234.12345
      })
    });
  }); 

  describe('queryFieldsObject error typeOf', () => {
    it('Deve retornar um objeto nulo', async () => {
      expect(service.queryFieldsObject(12323 as unknown as string)).toStrictEqual({})
    });
  });

  describe('queryFieldsObject error null', () => {
    it('Deve retornar um objeto nulo', async () => {
      expect(service.queryFieldsObject(null)).toStrictEqual({})
    });
  });

  describe('queryFieldsObject error empty', () => {
    it('Deve retornar um objeto nulo', async () => {
      expect(service.queryFieldsObject(',,,,,,,,,')).toStrictEqual({})
    });
  }); 

  describe('queryFieldsObject error empty value/key', () => {
    it('Deve retornar um objeto nulo', async () => {
      expect(service.queryFieldsObject('=,=,=,=,=,=,=,=,,=')).toStrictEqual({})
    });
  }); 

  describe('queryFieldsObject error regex', () => {
    it('Deve retornar nulo', async () => {
      expect(service.queryFieldsObject('!@#$@#$#@=^$#%$#%$#$#,{}:"')).toStrictEqual({})
    });
  });
});
