import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Postchallenge, PostchallengeSchema } from './schemas/postchallenge.schema';
import { PostchallengeController } from './postchallenge.controller';
import { PostchallengeService } from './postchallenge.service';
import { UtilsModule } from '../../utils/utils.module';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Postchallenge.name, schema: PostchallengeSchema }], 'SERVER_FULL')
    ],
    controllers: [PostchallengeController],
    providers: [PostchallengeService],
    exports: [PostchallengeService],
})
export class PostchallengeModule { }
