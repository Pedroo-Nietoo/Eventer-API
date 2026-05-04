import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class SessionService {
  private readonly TTL = 900; // 15 minutos

  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async createSession(token: string, payload: string) {
    const key = `auth:token:${token}`;

    await this.redis.set(key, payload, 'EX', this.TTL);
  }

  async getSession(token: string): Promise<string | null> {
    const key = `auth:token:${token}`;

    const result = await this.redis
      .multi()
      .get(key)
      .expire(key, this.TTL)
      .exec();

    if (!result) return null;

    const [[getErr, data]] = result;

    if (getErr || !data) return null;

    return data as string;
  }

  async deleteSession(token: string): Promise<boolean> {
    const deleted = await this.redis.del(`auth:token:${token}`);
    return deleted > 0;
  }
}
