import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { SignInDto } from '../auth/dto/sign-in.dto';
import { AdminAuthService } from './admin-auth.service';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body() payload: SignInDto) {
    return this.adminAuthService.signIn(payload);
  }
}
