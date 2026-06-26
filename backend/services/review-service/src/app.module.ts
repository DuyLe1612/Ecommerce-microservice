import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReviewModule } from './modules/review/review.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { MessagingModule } from './modules/messaging/messaging.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => {
          let id = req.headers['x-correlation-id'];
          if (!id) {
            id = randomUUID();
            req.headers['x-correlation-id'] = id;
            console.log(JSON.stringify({level: "INFO", message: "correlation_id generated locally, missing from upstream: " + id, correlation_id: id}));
          }
          return id;
        },
        customProps: (req, res) => {
          return {
            correlation_id: req.id
          };
        },

        formatters: {
          level: (label) => {
            return { level: label.toUpperCase() };
          },
        },
        messageKey: 'message',
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DB_URI'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ReviewModule,
    AdminModule,
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
