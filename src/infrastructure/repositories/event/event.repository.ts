import { Inject, Injectable } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventRepository {
  @Inject()
  private readonly eventEmitter: EventEmitter2;

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

  dispatch(body: unknown): boolean {
    const subscription = body['subscription']?.split('/')[3];
    const data = JSON.parse(
      Buffer.from(body['message'].data, 'base64').toString('utf-8'),
    );

    return this.eventEmitter.emit(subscription, data);
  }
}
