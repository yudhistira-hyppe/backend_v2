import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserbasicsController } from './userbasics.controller';
import { UserbasicsService } from './userbasics.service';
import { ConfigModule } from '@nestjs/config';
import { Userbasic, UserbasicSchema } from './schemas/userbasic.schema';
import { LanguagesModule } from '../../infra/languages/languages.module';
import { CountriesModule } from '../../infra/countries/countries.module';
import { InterestsRepoModule } from '../../infra/interests_repo/interests_repo.module';
import { MediaproofpictsModule } from '../../content/mediaproofpicts/mediaproofpicts.module';
@Module({

    imports: [
        MediaproofpictsModule,
        InterestsRepoModule,
        LanguagesModule,
        CountriesModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Userbasic.name, schema: UserbasicSchema }], 'SERVER_TRANS')
    ],
    controllers: [UserbasicsController],
    exports: [UserbasicsService],
    providers: [UserbasicsService],
})
export class UserbasicsModule {}