import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ReviewModule } from '../review/review.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [ReviewModule, MessagingModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
