import { Test, TestingModule } from '@nestjs/testing';
import { CacheRepository } from './cache.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('CacheRepository', () => {
  let service: CacheRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheRepository, { provide: CACHE_MANAGER, useValue: {} }],
    }).compile();

    service = module.get<CacheRepository>(CacheRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
