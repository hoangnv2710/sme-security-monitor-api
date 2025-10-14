import { Controller, Get } from '@nestjs/common';
import { SystemMonitorService } from './system-monitor.service';

@Controller('system')
export class SystemMonitorController {
    constructor(private readonly monitorService: SystemMonitorService) { }

    @Get('stats')
    async getStats() {
        const stats = await this.monitorService.getSystemStats();
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            data: stats,
        };
    }

}
