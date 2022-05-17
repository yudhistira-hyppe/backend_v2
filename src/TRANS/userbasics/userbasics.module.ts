import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserbasicsController } from './userbasics.controller';
import { UserbasicsService } from './userbasics.service';
import { ConfigModule } from '@nestjs/config';
import { Userbasic, UserbasicSchema } from './schemas/userbasic.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Userbasic.name, schema: UserbasicSchema }],'SERVER_TRANS')
    ],
    controllers: [UserbasicsController],
    exports: [UserbasicsService],
    providers: [UserbasicsService],
})
export class UserbasicsModule {}
