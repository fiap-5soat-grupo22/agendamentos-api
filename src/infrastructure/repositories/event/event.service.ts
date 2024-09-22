import { Injectable } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';

@Injectable()
export class EventService {
  pubSubClient: PubSub = new PubSub();

  async publish(
    topic: string,
    event: string,
    data: object,
    once: boolean = true,
  ): Promise<void> {
    const messageId = await this.pubSubClient.topic(topic).publishMessage({ 
      attributes: {
        domain: 'agendamentos',
        event: event,
      },
      isExactlyOnceDelivery: once,
      data: Buffer.from(JSON.stringify(data)),
    });

    console.info('Message published', topic, event, messageId);
  }
}
