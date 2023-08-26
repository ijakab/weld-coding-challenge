import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';

import { INestApplication } from '@nestjs/common';
import { CommonModule } from '../src/common/common.module';

describe('WorkerController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
