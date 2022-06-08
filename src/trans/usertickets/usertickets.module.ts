import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserticketsController } from './usertickets.controller';
import { UserticketsService } from './usertickets.service';
import { ConfigModule } from '@nestjs/config';
import { Usertickets, UserticketsSchema } from './schemas/usertickets.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';

@Module({
    imports: [
      
        ConfigModule.forRoot(),UserbasicsModule,
        MongooseModule.forFeature([{ name: Usertickets.name, schema: UserticketsSchema }],'SERVER_TRANS')
    ],
    controllers: [UserticketsController],
    exports: [UserticketsService],
    providers: [UserticketsService],

})
export class UserticketsModule {}
