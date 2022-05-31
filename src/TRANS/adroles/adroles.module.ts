
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdrolesController } from './adroles.controller';
import { AdrolesService } from './adroles.service';
import { ConfigModule } from '@nestjs/config';
import { Adroles, AdrolesSchema } from './schemas/adroles.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Adroles.name, schema: AdrolesSchema }],'SERVER_TRANS')
    ],
  controllers: [AdrolesController],
  providers: [AdrolesService]
})
export class AdrolesModule {}
