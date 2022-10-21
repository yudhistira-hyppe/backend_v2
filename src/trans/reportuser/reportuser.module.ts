import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportuserController } from './reportuser.controller';
import { ReportuserService } from './reportuser.service';
import { ConfigModule } from '@nestjs/config';
import { Reportuser, ReportuserSchema } from './schemas/reportuser.schema';
import { RemovedreasonsModule } from '../removedreasons/removedreasons.module';
import { ReportreasonsModule } from '../reportreasons/reportreasons.module';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { PostsModule } from '../../content/posts/posts.module';
import { AdsModule } from '../ads/ads.module';
@Module({

    imports: [
        UserbasicsModule, PostsModule, AdsModule, ReportreasonsModule, RemovedreasonsModule, ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Reportuser.name, schema: ReportuserSchema }], 'SERVER_FULL')
    ],
    controllers: [ReportuserController],
    providers: [ReportuserService],
    exports: [ReportuserService],
})
export class ReportuserModule { }
