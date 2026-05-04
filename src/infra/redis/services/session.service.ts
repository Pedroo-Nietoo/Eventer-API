import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class SessionService {
  private readonly TTL = 900; // 15 minutos

  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async invalidatePreviousSession(userId: string): Promise<void> {
    const userKey = `auth:user:${userId}`;
    const oldToken = await this.redis.get(userKey);

    if (oldToken) {
      await this.redis.del(`auth:token:${oldToken}`, userKey);
    }
  }

  async createSession(userId: string, token: string, payload: string) {
    const tokenKey = `auth:token:${token}`;
    const userKey = `auth:user:${userId}`;

    await this.redis
      .multi()
      .set(tokenKey, payload, 'EX', this.TTL)
      .set(userKey, token, 'EX', this.TTL)
      .exec();
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
