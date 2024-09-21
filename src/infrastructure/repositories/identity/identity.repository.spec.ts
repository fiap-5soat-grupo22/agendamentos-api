import { Test, TestingModule } from '@nestjs/testing';
import { IdentityRepository } from './identity.repository';

describe('IdentityRepository', () => {
  let service: IdentityRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdentityRepository],
    }).compile();

    service = module.get<IdentityRepository>(IdentityRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
