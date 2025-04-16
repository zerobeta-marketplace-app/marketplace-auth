import { Module } from '@nestjs/common';
import Redis from 'ioredis';

const RedisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => new Redis(process.env.REDIS_URL || 'redis://localhost:6379'),
};

@Module({
  providers: [RedisProvider],
  exports: [RedisProvider],
})
export class RedisModule {}
