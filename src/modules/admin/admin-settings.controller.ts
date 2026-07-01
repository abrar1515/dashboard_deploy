import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminSettingsService } from './admin-settings.service';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard)
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  async updateSettings(@Body() payload: any) {
    return this.settingsService.updateSettings(payload);
  }
}
