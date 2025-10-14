import { Injectable } from '@nestjs/common';
import * as os from 'os-utils';


@Injectable()
export class SystemMonitorService {
    private requestCount = 0;
    private lastRequestTimestamp = Date.now();
    private activeUsers = new Set<string>();
    async getSystemStats() {
        const [cpuLoad, mem] = await Promise.all([
            this.getCpuUsage(),
            this.getMemoryUsage(),
        ]);

        return {
            cpu: cpuLoad,
            memory: mem,
            uptime: this.getUptime(),
        };
    }

    private getUptime() {
        return os.sysUptime();
    }

    private async getCpuUsage(): Promise<number> {
        return new Promise((resolve) => {
            os.cpuUsage((v) => resolve(Number((v * 100).toFixed(2))));
        });
    }

    private async getMemoryUsage() {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;
        return {
            usedMB: Number((used).toFixed(2)),
            totalMB: Number(total.toFixed(2)),
            usedPercent: Number(((used / total) * 100).toFixed(2)),
        };
    }


}
