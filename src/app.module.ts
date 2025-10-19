import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogsModule } from './log/log.module';
import { SystemMonitorModule } from './system-monitor/system-monitor.module';
import { AlertsModule } from './alerts/alert.module';


@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // LogsModule,
    SystemMonitorModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
