import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  get(key: string): Promise<string> {
    return this.cacheManager.get(key);
  }
  set(key: string, value: string) {
    return this.cacheManager.set(key, value);
  }
}
