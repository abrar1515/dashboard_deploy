import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from '../../entities/settings.entity';
import { AdminSettingsService } from '../admin/admin-settings.service';
import { SettingsController } from './settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  controllers: [SettingsController],
  providers: [AdminSettingsService],
  exports: [AdminSettingsService],
})
export class SettingsModule {}
