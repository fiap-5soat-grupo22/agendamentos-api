import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FastifyRequest } from 'fastify';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const appServiceMock = {
      dispatchEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appServiceMock,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('dispatchEventV1', () => {
    it('should call appService.dispatchEvent with correct arguments', () => {
      const body = { test: 'data' };
      const requestMock = {} as FastifyRequest;
      appController.dispatchEventV1(body, requestMock);
      expect(appService.dispatchEvent).toHaveBeenCalledWith(body, requestMock);
    });

    it('should return the result from appService.dispatchEvent', () => {
      const body = { test: 'data' };
      const requestMock = {} as FastifyRequest;
      const expectedResult = { statusCode: 200, message: 'OK' };
      (appService.dispatchEvent as jest.Mock).mockReturnValue(expectedResult);
      const result = appController.dispatchEventV1(body, requestMock);
      expect(result).toBe(expectedResult);
    });
  });
});

