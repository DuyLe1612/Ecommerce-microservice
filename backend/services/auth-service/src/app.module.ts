import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AddressModule } from './modules/address/address.module';
import { LocationModule } from './modules/location/location.module';

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
    ProfileModule,
    AddressModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}