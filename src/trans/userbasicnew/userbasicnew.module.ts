import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserbasicnewController } from './userbasicnew.controller';
import { UserbasicnewService } from './userbasicnew.service';
import { ConfigModule } from '@nestjs/config';
import { Userbasicnew, UserbasicnewSchema } from './schemas/userbasicnew.schema';
import { LogapisModule } from '../logapis/logapis.module';

@Module({

    imports: [
        ConfigModule.forRoot(),
        LogapisModule,
        MongooseModule.forFeature([{ name: Userbasicnew.name, schema: UserbasicnewSchema }], 'SERVER_FULL')
    ],
    controllers: [UserbasicnewController],
    exports: [UserbasicnewService],
    providers: [UserbasicnewService],
})
export class UserbasicnewModule { }
