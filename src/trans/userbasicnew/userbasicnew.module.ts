import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserbasicnewController } from './userbasicnew.controller';
import { UserbasicnewService } from './userbasicnew.service';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../../utils/utils.module';
import { Userbasicnew, UserbasicnewSchema } from './schemas/userbasicnew.schema';


@Module({

    imports: [

        ConfigModule.forRoot(), UtilsModule,
        MongooseModule.forFeature([{ name: Userbasicnew.name, schema: UserbasicnewSchema }], 'SERVER_FULL')
    ],
    controllers: [UserbasicnewController],
    exports: [UserbasicnewService],
    providers: [UserbasicnewService],
})
export class UserbasicnewModule { }
