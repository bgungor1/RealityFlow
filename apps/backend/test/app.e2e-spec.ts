import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('RealityFlow API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api'); // Match main.ts configuration
    await app.init();
  });

  describe('Dashboard Module', () => {
    it('/api/dashboard (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalTransactions');
          expect(res.body).toHaveProperty('topAgents');
        });
    });
  });


  describe('Transaction Module', () => {
    it('/api/transactions (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/transactions')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

