import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserbasicsnewController } from './userbasicsnew.controller';
import { UserbasicsnewService } from './userbasicsnew.service';
import { ConfigModule } from '@nestjs/config';
import { Userbasic, UserbasicnewSchema } from './schemas/userbasicnew.schema';
@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Userbasic.name, schema: UserbasicnewSchema }], 'SERVER_TRANS')
    ],
    controllers: [UserbasicsnewController],
    exports: [UserbasicsnewService],
    providers: [UserbasicsnewService],
})
export class UserbasicsnewModule {}