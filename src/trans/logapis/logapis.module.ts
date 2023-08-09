import { Module } from '@nestjs/common';
import { LogapisService } from './logapis.service';
import { LogapisController } from './logapis.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { logApis, logApisSchema } from './schema/logapis.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: logApis.name, schema: logApisSchema }
    ], 'SERVER_FULL')
  ],
  controllers: [LogapisController],
  providers: [LogapisService],
  exports:[LogapisService]
})
export class LogapisModule {}
