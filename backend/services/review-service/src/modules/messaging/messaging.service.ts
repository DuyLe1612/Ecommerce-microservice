import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class MessagingService implements OnModuleInit {
  private readonly logger = new Logger(MessagingService.name);
  private channel: amqp.Channel | null = null;

  private readonly EXCHANGE = 'review.events';
  private readonly ROUTING_KEYS = {
    approved: 'review.approved',
    rejected: 'review.rejected',
  };

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    const url = this.configService.get<string>('RABBITMQ_URL');
    if (!url) {
      this.logger.warn('RABBITMQ_URL not set, messaging disabled');
      return;
    }

    try {
      const connection = await amqp.connect(url);
      this.channel = await (connection as any).createChannel();

      if (this.channel) {
        await this.channel.assertExchange(this.EXCHANGE, 'topic', { durable: true });
        this.logger.log(`Connected to RabbitMQ. Exchange: ${this.EXCHANGE}`);
      }
    } catch (err) {
      this.logger.error(`Failed to connect to RabbitMQ: ${(err as Error).message}`);
      // Don't crash the service if RabbitMQ is unavailable
    }
  }

  async publishReviewApproved(payload: {
    reviewId: number;
    productId: number;
    userId: number;
    rating: number;
  }) {
    await this.publish(this.ROUTING_KEYS.approved, {
      event: 'ReviewApproved',
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }

  async publishReviewRejected(payload: {
    reviewId: number;
    productId: number;
    userId: number;
  }) {
    await this.publish(this.ROUTING_KEYS.rejected, {
      event: 'ReviewRejected',
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }

  private async publish(routingKey: string, message: object) {
    if (!this.channel) {
      this.logger.warn(`Cannot publish (no channel). RoutingKey: ${routingKey}`);
      return;
    }

    try {
      const content = Buffer.from(JSON.stringify(message));
      this.channel.publish(this.EXCHANGE, routingKey, content, {
        persistent: true,
        contentType: 'application/json',
      });
      this.logger.log(`Published event: ${routingKey}`);
    } catch (err) {
      this.logger.error(`Failed to publish event ${routingKey}: ${(err as Error).message}`);
    }
  }
}
