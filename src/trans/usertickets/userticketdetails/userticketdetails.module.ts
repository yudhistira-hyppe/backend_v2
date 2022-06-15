import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Userticketdetails, UserticketdetailsSchema } from './schemas/userticketdetails.schema';
import { UserticketdetailsController } from '../userticketdetails/userticketdetails.controller';
import { UserticketdetailsService } from '../userticketdetails/userticketdetails.service';
import { UserbasicsModule } from '../../userbasics/userbasics.module';
import { UserticketsModule } from '../../usertickets/usertickets.module';

@Module({

    imports: [

        ConfigModule.forRoot(), UserbasicsModule, UserticketsModule,
        MongooseModule.forFeature([{ name: Userticketdetails.name, schema: UserticketdetailsSchema }], 'SERVER_TRANS'),
        UserticketdetailsModule
    ],
    controllers: [UserticketdetailsController],
    exports: [UserticketdetailsService],
    providers: [UserticketdetailsService],
})
export class UserticketdetailsModule { }
