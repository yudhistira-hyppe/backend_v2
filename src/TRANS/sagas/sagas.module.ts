
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SagasController } from './sagas.controller';
import { SagasService } from './sagas.service';
import { ConfigModule } from '@nestjs/config';
import { Sagas, SagasSchema } from './schemas/sagas.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Sagas.name, schema: SagasSchema }],'SERVER_TRANS')
    ],
  controllers: [SagasController],
  providers: [SagasService]
})
export class SagasModule {}
