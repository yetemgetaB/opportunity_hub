import { Controller, Get } from '@nestjs/common';
import { DatabaseHealthService } from './database.health.service';

@Controller('health/database')
export class DatabaseHealthController {
  constructor(private readonly healthService: DatabaseHealthService) {}

  @Get()
  async getDatabaseHealth() {
    return this.healthService.checkConnection();
  }
}
