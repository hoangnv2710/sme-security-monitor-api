export class SuricataAlert {
    signature: string;
    severity: number;
    category: string;
    action: string;
}

export class IngestAlertDto {
    timestamp: string;
    event_type: string;
    src_ip: string;
    dest_ip: string;
    proto: string;
    src_port: number;
    dest_port: number;
    alert: SuricataAlert;
}