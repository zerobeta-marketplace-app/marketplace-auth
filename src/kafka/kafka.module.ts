import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.interfaces';

@Module({
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class KafkaModule {}