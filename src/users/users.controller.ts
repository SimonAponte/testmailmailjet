import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NoAccountGuard } from '../auth/decorators/no-account-guard.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { FindUsersDto } from './dto/find-users.dto';
import { EmailDto } from './dto/searchEmail.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @Post('recuperation-otp')
  async generateEmailChangePassword(@Body() body: EmailDto) {
    const { email } = body;
    console.log(email);
    // Buscar al usuario por email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { status: 'failure', message: 'User not found' };
    }

    // Generar el OTP y enviar el correo
    await this.usersService.generateEmailVerification(user.id, true);

    return { status: 'success', message: 'Sending email in a moment' };
  }

  @Get()
  findMany(@Query() query: FindUsersDto) {
    return this.usersService.findMany(query);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @NoAccountGuard()
  @Post('verification-otp')
  async generateEmailVerification(@CurrentUser() user: User) {
    await this.usersService.generateEmailVerification(user.id);

    return { status: 'success', message: 'Sending email in a moment' };
  }

  @NoAccountGuard()
  @Post('verify/:otp')
  async verifyEmail(@Param('otp') otp: string, @CurrentUser() user: User) {
    const result = await this.usersService.verifyEmail(user.id, otp);

    return { status: result ? 'sucess' : 'failure', message: null };
  }
}
