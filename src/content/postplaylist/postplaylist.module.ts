import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserplaylistModule } from '../../trans/userplaylist/userplaylist.module';
import { PostPlaylistService } from './postplaylist.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        UserplaylistModule,
    ],
    controllers: [],
    providers: [PostPlaylistService],
    exports: [PostPlaylistService],
})
export class PostPlayModule {}