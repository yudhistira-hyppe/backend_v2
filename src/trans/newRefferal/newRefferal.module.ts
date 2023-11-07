import { Module } from '@nestjs/common';
import { NewRefferalService } from './newRefferal.service';
import { NewRefferalController } from './newRefferal.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { newRefferal, newRefferalSchema } from './schemas/newRefferal.schema';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports:[
    UtilsModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: newRefferal.name, schema: newRefferalSchema}], 'SERVER_FULL')
  ],
  controllers: [NewRefferalController],
  providers: [NewRefferalService],
  exports: [NewRefferalService]
})
export class NewRefferalModule {}
