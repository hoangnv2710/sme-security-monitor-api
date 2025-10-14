import { Module } from '@nestjs/common';
import { SystemMonitorService } from './system-monitor.service';
import { SystemMonitorController } from './system-monitor.controller';

@Module({
    providers: [SystemMonitorService],
    controllers: [SystemMonitorController],
    exports: [SystemMonitorService],
})
export class SystemMonitorModule { }
