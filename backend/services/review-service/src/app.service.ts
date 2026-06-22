import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'review-service',
      timestamp: new Date().toISOString(),
    };
  }
}
