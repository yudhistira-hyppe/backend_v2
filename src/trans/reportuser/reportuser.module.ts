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
import { TransactionsModule } from '../transactions/transactions.module';
import { UserauthsModule } from '../userauths/userauths.module';
import { UserAdsModule } from '../userads/userads.module';
import { MediaprofilepictsModule } from '../../content/mediaprofilepicts/mediaprofilepicts.module';
@Module({

    imports: [
        UserbasicsModule, MediaprofilepictsModule, UserAdsModule, UserauthsModule, TransactionsModule, PostsModule, AdsModule, ReportreasonsModule, RemovedreasonsModule, ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Reportuser.name, schema: ReportuserSchema }], 'SERVER_FULL')
    ],
    controllers: [ReportuserController],
    providers: [ReportuserService],
    exports: [ReportuserService],
})
export class ReportuserModule { }
