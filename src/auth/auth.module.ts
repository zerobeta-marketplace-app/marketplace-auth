// src/auth/auth.module.ts
import { Inject, Module } from '@nestjs/common';
import { AuthService } from '../auth/services/auth.service';
import { AuthController } from '../auth/controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';
import { ConsumerService } from 'src/kafka/consumer.interfaces';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'beta_marketplace',
      signOptions: { expiresIn: '1h' },
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth-client',
            brokers: ['kafka:29092'],
          },
          consumer: {
            groupId: 'auth-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, ConsumerService],
})
export class AuthModule {
  constructor(@Inject('USER_SERVICE') private readonly userClient: ClientKafka) {}

  async onModuleInit() {
    this.userClient.subscribeToResponseOf('get-user-by-email');
    await this.userClient.connect();
  }
}
