import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import Redis from 'ioredis';
import { environment } from '../../environment';
import { CommonConfig } from '../common.config';

@Injectable()
export class RedisService implements OnApplicationBootstrap {
  private redisClient: Redis;

  public onApplicationBootstrap(): void {
    this.redisClient = new Redis({
      host: environment.REDIS_HOST,
      connectTimeout: CommonConfig.RedisConnectionTimeout,
    });
  }

  public async get(key: string): Promise<string | undefined> {
    return this.redisClient.get(key);
  }

  public async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }
}
