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

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Auth Service...');
    try {
      this.logger.log('Subscribing to response pattern: get-user-by-email');
      this.userClient.subscribeToResponseOf('get-user-by-email');
      
      this.logger.log('Attempting to connect to Kafka...');
      await this.userClient.connect();
      this.logger.log('Successfully connected to Kafka!');
      
      // Test Kafka connection
      this.logger.log('Sending test message to Kafka...');
      this.userClient.emit('auth-test-topic', { message: 'Test from Auth Service' });
      this.logger.log('Test message sent to Kafka');
    } catch (error) {
      this.logger.error(`Failed to connect to Kafka: ${error.message}`);
      this.logger.error(error.stack);
    }
  }

  async validateUser(email: string, password: string) {
    this.logger.log(`Validating user with email: ${email}`);
    
    try {
      // Send a simple test message first
      this.logger.log('Sending test message before actual request');
      this.userClient.emit('auth-test-message', { email });
      
      // Now try the actual request
      this.logger.log('Sending request to get-user-by-email');
      const user$ = this.userClient.send('get-user-by-email', { value: email })
        .pipe(
          timeout(10000), // Increase timeout to 10 seconds
          catchError(err => {
            this.logger.error(`Error when sending Kafka message: ${err.message}`);
            this.logger.error(err.stack);
            throw new UnauthorizedException('Service unavailable, please try again later');
          })
        );
      
      this.logger.log('Waiting for response...');
      const userResponse = await firstValueFrom(user$);
      this.logger.log(`user received from : user object ` + user$);
      this.logger.log(`user received from : user object ` + JSON.stringify(user$));
      const userResolved = await firstValueFrom(user$);
      this.logger.log(`user received from : user object ` + JSON.stringify(userResolved));
      this.logger.log(`Response received from firstvalue from : userResponse`);
      this.logger.log(`Response received: ${JSON.stringify(userResponse)}`);
      
      const user = typeof userResponse === 'string' ? JSON.parse(userResponse) : userResponse;
      this.logger.log(`Parsed user object: ${JSON.stringify(user)}`);
      
      if (!user || !user.password) {
        this.logger.error('User object is invalid or missing required fields'); 
        throw new UnauthorizedException('Invalid credentials - user not found');
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials - password mismatch');
      }
      
      return user;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      this.logger.error(error.stack);
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

  // Login method remains the same
}