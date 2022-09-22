import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Userplaylist, UserplaylistSchema } from './schemas/userplaylist.schema';
import { UserplaylistController } from './userplaylist.controller';
import { UserplaylistService } from './userplaylist.service';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Userplaylist.name, schema: UserplaylistSchema }], 'SERVER_TRANS')
    ],
    controllers: [UserplaylistController],
    exports: [UserplaylistService],
    providers: [UserplaylistService],
})
export class UserplaylistModule {}