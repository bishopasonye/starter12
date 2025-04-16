import { NotificationGateway } from '@app/service';
import { Module } from '@nestjs/common';

@Module({
    imports: [NotificationGateway], 
  providers: [],
  controllers: [],
  exports: [],
})
export class WebSocketModule {}
