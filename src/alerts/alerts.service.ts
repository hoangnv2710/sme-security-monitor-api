import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Server } from 'socket.io'; // Socket.io Server type
import { Tail } from 'tail';

import { Alert, AlertDocument } from './schemas/alert.schema';
import { IngestAlertDto, SuricataAlert } from './dto/ingest-alert.dto';

@Injectable()
export class AlertsService implements OnModuleInit {
    private readonly logger = new Logger(AlertsService.name);
    private io: Server;

    constructor(
        @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
        private configService: ConfigService,
    ) {
        this.io = new Server(this.configService.get("SOCKET_PORT"), { cors: { origin: '*' } });

    }

    onModuleInit() {
        this.logger.log('AlertsService initialized. Starting log tail...');

        const logFilePath = this.configService.get<string>('LOG_FILE');

        if (!logFilePath) {
            this.logger.error('LOG_FILE không được định nghĩa.');
            return;
        }
        this.io.on('connection', (s) => {
            console.log("user connected", s.id);
        })
        try {
            const tail = new Tail(logFilePath, {
                useWatchFile: true,
                follow: true,
                encoding: "utf-8",
                fromStart: false,
            });

            tail.on("line", (line: string) => {
                this.handleNewLine(line);
            });

            tail.on("error", (err) => {
                this.logger.error("Tail error:", err);
            });

            this.logger.log(`Successfully started tailing: ${logFilePath}`);

        } catch (e) {
            this.logger.error(`FATAL: Could not initialize Tail for file: ${logFilePath}`, e.stack);
        }
    }

    private mapSuricataSeverity(severity: number): Alert['severity_level'] {
        if (severity <= 1) return 'Critical';
        if (severity === 2) return 'High';
        if (severity === 3) return 'Medium';
        return 'Low';
    }

    private processSingleLog(log: IngestAlertDto): Alert | null {
        if (log.event_type !== 'alert' || !log.alert) {
            return null;
        }

        try {
            const severityLevel = this.mapSuricataSeverity(log.alert.severity);

            const processedAlert: Alert = {
                timestamp: new Date(log.timestamp),
                signature: log.alert.signature,
                severity_level: severityLevel,
                src_ip: log.src_ip || 'N/A',
                dest_ip: log.dest_ip || 'N/A',
                src_port: log.src_port || 0,
                dest_port: log.dest_port || 0,
                protocol: log.proto || 'N/A',
                raw_data: log,
            };

            return processedAlert;
        } catch (error) {
            this.logger.error('Error processing log entry:', error);
            return null;
        }
    }

    private async handleNewLine(line: string) {
        console.log("newline:", line);
        const trimmedLine = line.trim();
        if (!trimmedLine) {
            return;
        }
        try {
            const logEntry: IngestAlertDto = JSON.parse(trimmedLine);

            const processedAlert = this.processSingleLog(logEntry);

            if (!processedAlert) {
                return;
            }

            const createdAlert = new this.alertModel(processedAlert);
            await createdAlert.save();

            this.logger.verbose(`Saved ALERT: ${processedAlert.signature} from ${processedAlert.src_ip}`);

            if (this.io) {
                this.io.emit("newAlert", processedAlert);
            }

        } catch (e) {
            this.logger.error("Lỗi trong quá trình xử lý log/lưu DB:", e.message);
        }
    }


    public setSocketServer(server: Server) {
        this.io = server;
        this.logger.log('Socket.io Server instance đã được thiết lập.');
    }


    async findAlerts(
        page: number = 1,
        limit: number = 20,
        severity?: string,
        search?: string,
    ): Promise<{ data: Alert[]; total: number; page: number; limit: number }> {
        const skip = (page - 1) * limit;
        const query: any = {};

        if (severity) {
            query.severity_level = severity;
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { src_ip: regex },
                { dest_ip: regex },
                { signature: regex },
            ];
        }

        const [data, total] = await Promise.all([
            this.alertModel.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.alertModel.countDocuments(query).exec(),
        ]);

        return { data, total, page, limit };
    }

    // async getAlertStatistics() {
    //     const severityStatsPipeline: PipelineStage[] = [
    //         {
    //             $group: {
    //                 _id: '$severity_level',
    //                 count: { $sum: 1 }
    //             }
    //         },
    //         { $sort: { count: -1 } }
    //     ];

    //     const topSourceIpsPipeline: PipelineStage[] = [
    //         {
    //             $group: {
    //                 _id: '$src_ip',
    //                 count: { $sum: 1 }
    //             }
    //         },
    //         { $sort: { count: -1 } },
    //         { $limit: 5 }
    //     ];

    //     const [severityStats, topSourceIps] = await Promise.all([
    //         this.alertModel.aggregate(severityStatsPipeline).exec(),
    //         this.alertModel.aggregate(topSourceIpsPipeline).exec(),
    //     ]);

    //     return {
    //         severityStats: severityStats.map(s => ({ level: s._id, count: s.count })),
    //         topSourceIps: topSourceIps.map(ip => ({ ip: ip._id, count: ip.count })),
    //     };
    // }
}