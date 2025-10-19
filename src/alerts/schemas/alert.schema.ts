// src/alerts/schemas/alert.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlertDocument = Alert & Document;

@Schema({ timestamps: true }) // Tự động thêm createdAt và updatedAt
export class Alert {
    @Prop({ required: true, index: true })
    timestamp: Date;

    @Prop({ required: true })
    signature: string;

    @Prop({ required: true, index: true })
    severity_level: 'Critical' | 'High' | 'Medium' | 'Low';

    @Prop({ required: true, index: true })
    src_ip: string;

    @Prop({ required: true, index: true })
    dest_ip: string;

    @Prop()
    src_port: number;

    @Prop()
    dest_port: number;

    @Prop()
    protocol: string;

    @Prop({ type: Object })
    raw_data: any;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);