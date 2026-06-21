import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

/**
 * Consumes OrderCompleted events from order-service.
 * When an order is completed, we can mark the product-user pair as review-eligible.
 */
@Injectable()
export class OrderConsumer implements OnModuleInit {
  private readonly logger = new Logger(OrderConsumer.name);
  private channel: amqp.Channel | null = null;

  private readonly EXCHANGE = 'order.events';
  private readonly QUEUE = 'review-service.order-completed';
  private readonly ROUTING_KEY = 'order.completed';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  private async startConsuming() {
    const url = this.configService.get<string>('RABBITMQ_URL');
    if (!url) {
      this.logger.warn('RABBITMQ_URL not set, order consumer disabled');
      return;
    }

    try {
      const connection = await amqp.connect(url);
      this.channel = await (connection as any).createChannel();

      if (!this.channel) return;

      await this.channel.assertExchange(this.EXCHANGE, 'topic', { durable: true });
      const { queue } = await this.channel.assertQueue(this.QUEUE, { durable: true });
      await this.channel.bindQueue(queue, this.EXCHANGE, this.ROUTING_KEY);

      await this.channel.consume(queue, (msg) => {
        if (msg) {
          this.handleOrderCompleted(msg);
          this.channel?.ack(msg);
        }
      });

      this.logger.log(`Consuming order events from queue: ${this.QUEUE}`);
    } catch (err) {
      this.logger.error(`Failed to start order consumer: ${(err as Error).message}`);
    }
  }

  private handleOrderCompleted(msg: amqp.ConsumeMessage) {
    try {
      const payload = JSON.parse(msg.content.toString());
      this.logger.log(
        `Received OrderCompleted: orderId=${payload.orderId}, userId=${payload.userId}`,
      );
      // Future: persist review-eligibility to DB
      // e.g. INSERT INTO eligible_reviews (userId, productId, orderId) ON CONFLICT DO NOTHING
    } catch (err) {
      this.logger.error(`Failed to process OrderCompleted: ${(err as Error).message}`);
    }
  }
}
