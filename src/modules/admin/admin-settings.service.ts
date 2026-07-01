import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../../entities/settings.entity';

@Injectable()
export class AdminSettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  async getSettings() {
    let settings = await this.settingsRepository.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepository.create({
        jazzCashNumber: '03062555956',
        easyPaisaNumber: '03062555956',
        adminEmail: 'admin@clickshop.com',
      });
      await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async updateSettings(payload: Partial<Settings>) {
    const settings = await this.getSettings();
    Object.assign(settings, payload);
    return this.settingsRepository.save(settings);
  }
}
