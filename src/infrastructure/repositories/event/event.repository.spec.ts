import { Test, TestingModule } from '@nestjs/testing';
import { EventRepository } from './event.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PubSub } from '@google-cloud/pubsub';

describe('EventRepository', () => {
  let service: EventRepository;
  const mockEventEmitter = {
    emit: jest.fn(),
  };
  const publishMessageMock = jest.fn(() => Promise.resolve('123'));
  const topicMock = jest.fn(() => ({
    publishMessage: publishMessageMock,
  }));
  const pubSubClientMock = {
    topic: topicMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRepository,
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: PubSub, useValue: pubSubClientMock },
      ],
    }).compile();

    service = module.get<EventRepository>(EventRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should publish a message', async () => {
    const topic = 'test-topic';
    const event = 'test-event';
    const data = { test: 'data' };

    await service.publish(topic, event, data);

    expect(topicMock).toHaveBeenCalled();
    expect(publishMessageMock).toHaveBeenCalled();
  });

  it('should dispatch an event', () => {
    const subscription = 'test-subscription';
    const data = { test: 'data' };
    const body = {
      message: {
        data: Buffer.from(JSON.stringify(data)).toString('base64'),
      },
      subscription: `/projects/test/subscriptions/${subscription}`,
    };

    service.dispatch(body);

    expect(mockEventEmitter.emit).toHaveBeenCalled();
  });
});