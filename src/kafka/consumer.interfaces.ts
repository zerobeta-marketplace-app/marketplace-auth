import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { Consumer, ConsumerConfig, ConsumerRunConfig, ConsumerSubscribeTopic, Kafka, KafkaMessage } from "kafkajs";
import { ConfigService } from '@nestjs/config';
import {IConsumer} from "./IConsumer";

interface KafkajsConsumerOptions {
    topic: ConsumerSubscribeTopic;
    config: ConsumerConfig;
    onMessage: (message: KafkaMessage) => Promise<void>;
}
@Injectable()
export class ConsumerService implements OnApplicationShutdown {
    private readonly kafka = new Kafka({
        brokers: ['kafka:29092'],
    });
   
    private readonly consumers: Consumer[] = [];
    

    async consume( topic: ConsumerSubscribeTopic, config: ConsumerRunConfig ) {
        const consumer = this.kafka.consumer({ groupId: 'auth-consumer' });
        await consumer.connect();
        await consumer.subscribe(topic);
        await consumer.run(config);
        this.consumers.push(consumer);
      } 
   async onApplicationShutdown() {
        for (const consumer of this.consumers) {
            await consumer.disconnect();
          }
        }

}

