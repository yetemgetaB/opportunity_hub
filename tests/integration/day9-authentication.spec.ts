import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

const request = require('supertest');

jest.setTimeout(30000);

describe('Day 9 - Real JWT Authentication', () => {
let app: INestApplication;

beforeAll(async () => {
const moduleFixture: TestingModule =
await Test.createTestingModule({
imports: [AppModule],
}).compile();


app = moduleFixture.createNestApplication();

app.setGlobalPrefix('api/v1');

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

await app.init();


});

afterAll(async () => {
await app.close();
});

it('rejects an apply request without a JWT with 401 Unauthorized', async () => {
const response = await request(app.getHttpServer()).post(
'/api/v1/opportunities/00000000-0000-0000-0000-000000000000/apply',
);


expect(response.status).toBe(401);
expect(response.body.message).toBe(
  'Authorization header is required.',
);


});
});
