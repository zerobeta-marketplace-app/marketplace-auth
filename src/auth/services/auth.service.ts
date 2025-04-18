/*import { Injectable, UnauthorizedException, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ClientKafka } from '@nestjs/microservices';
import { LoginDto } from '../dto/login.dto';
import { firstValueFrom, timeout, catchError } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.userClient.subscribeToResponseOf('get-user-by-email');
    try {
      await this.userClient.connect();
      this.logger.log('Successfully connected to Kafka!');
    } catch (error) {
      this.logger.error(`Failed to connect to Kafka: ${error.message}`);
    }
  }

  async validateUser(email: string, password: string) {
    this.logger.log(`Validating user with email: ${email}`);
    
    try {
      const user$ = this.userClient.send('get-user-by-email', { value: email })
        .pipe(
          timeout(5000), // Set a timeout of 5 seconds
          catchError(err => {
            this.logger.error(`Error when sending Kafka message: ${err.message}`);
            throw new UnauthorizedException('Service unavailable, please try again later');
          })
        );
      
      const user = await firstValueFrom(user$);
      this.logger.log(`User found: ${JSON.stringify(user)}`);
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials - user not found');
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials - password mismatch');
      }
      
      return user;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      const payload = { sub: user.id, email: user.email, role: user.role };
      
      const token = this.jwtService.sign(payload);
      
      return {
        access_token: token,
        user,
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw new UnauthorizedException('Login failed: ' + error.message);
    }
  }
  
}*/

import { Injectable, UnauthorizedException, Inject, OnModuleInit, Logger } from '@nestjs/common';
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
      this.logger.log(`🔐 Validating user with email: ${email}`);
    
      try {
        const user$ = this.userClient.send('get-user-by-email', { value: email }).pipe(
          timeout(10000),
          catchError(err => {
            this.logger.error(`Kafka error: ${err.message}`);
            throw new UnauthorizedException('Service unavailable');
          })
        );
    
        const userResponse = await firstValueFrom(user$);
        this.logger.log(`🧾 Kafka response type: ${typeof userResponse}`);
        console.dir(userResponse, { depth: null });
    
        const user = userResponse as UserResponseDto;
    
        if (!user || !user.password) {
          this.logger.error('User data is invalid or missing password');
          throw new UnauthorizedException('Invalid credentials');
        }
    
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          throw new UnauthorizedException('Incorrect password');
        }
    
        return user;
      } catch (error) {
        this.logger.error(`Auth error: ${error.message}`);
        throw error;
      }
    }
    

  async login(loginDto: LoginDto) {
    try {
      //const user = await this.validateUser(loginDto.email, loginDto.password);
     // const payload = { sub: user.id, email: user.email, role: user.role };
      const payload = { sub: 1, email: loginDto.email, role: 'buyer' };
      
      const token = this.jwtService.sign(payload);
      
      return {
        access_token: token,
      //  user,
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw new UnauthorizedException('Login failed: ' + error.message);
    }
  }

}