import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { Module } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto) {
    console.log(' message LoginDto:', LoginDto);
    return this.authService.login(dto);
  }
}