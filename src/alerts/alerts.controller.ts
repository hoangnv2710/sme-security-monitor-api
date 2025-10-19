// src/alerts/alerts.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Get()
    async getAlerts(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('severity') severity: string,
        @Query('search') search: string,
    ) {
        return this.alertsService.findAlerts(
            parseInt(page),
            parseInt(limit),
            severity,
            search,
        );
    }

    // @Get('stats')
    // async getAlertStatistics() {
    //     return this.alertsService.getAlertStatistics();
    // }
}