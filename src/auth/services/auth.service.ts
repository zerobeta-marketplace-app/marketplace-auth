import { Injectable, UnauthorizedException, Inject, OnModuleInit, Logger } from '@nestjs/common';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ClientKafka } from '@nestjs/microservices';
import { LoginDto } from '../dto/login.dto';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userClient: ClientKafka,
  ) {}

  async validateUser(email: string, password: string) {
    this.logger.log(` Validating user with email: ${email}`);

    try {
      // const response = await axios.get<UserResponseDto>(
      //   `http://localhost:3004/users/email/${encodeURIComponent(email)}`
      // );
      const response = await axios.get(`http://user-service:3004/users/email/${email}`);
      //const user = response.data;

      const user = response.data;

      this.logger.log(` User retrieved: ${user.email}`);

      if (!user || !user.password) {
        throw new UnauthorizedException('User not found or invalid structure');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Incorrect password');
      }

      return user;

    } catch (error) {
      this.logger.error(` Auth error: ${error.message}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }
    

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      const payload = { sub: user.id, email: user.email, role: user.role };
  
      const token = this.jwtService.sign(payload);
  
      return {
        statusCode: 200,
        message: 'Login successful',
        data: {
          access_token: token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        }
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }
  }  

}