import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminSummaryService } from './admin-summary.service';

@Controller('admin/summary')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminSummaryController {
  constructor(private readonly adminSummaryService: AdminSummaryService) {}

  @Get()
  async getSummary() {
    return this.adminSummaryService.getSummary();
  }
}
