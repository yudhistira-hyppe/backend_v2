import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Userchallenges, UserchallengesSchema } from './schemas/userchallenges.schema';
import { UserchallengesController } from './userchallenges.controller';
import { UserchallengesService } from './userchallenges.service';
import { UtilsModule } from '../../utils/utils.module';
import { UserbasicsModule } from '../userbasics/userbasics.module';

@Module({

    imports: [
        UserbasicsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Userchallenges.name, schema: UserchallengesSchema }], 'SERVER_FULL')
    ],
    controllers: [UserchallengesController],
    providers: [UserchallengesService],
    exports: [UserchallengesService],
})
export class UserchallengesModule { }
