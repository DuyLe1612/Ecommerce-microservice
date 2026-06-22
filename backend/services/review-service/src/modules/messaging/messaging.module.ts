import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { OrderConsumer } from './consumers/order.consumer';

@Module({
  providers: [MessagingService, OrderConsumer],
  exports: [MessagingService],
})
export class MessagingModule {}
