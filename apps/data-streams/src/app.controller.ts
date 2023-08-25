import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('KAFKA_CLIENT') private client: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @Get()
  public async getHello(): Promise<string> {
    this.client.emit('kafka.test', { test: true }).pipe(timeout(5000));
    return this.appService.getHello();
  }
}
