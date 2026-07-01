import { Controller, Get } from '@nestjs/common';
import { AdminSettingsService } from '../admin/admin-settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get('contact')
  async getContactSettings() {
    return this.settingsService.getSettings();
  }
}
