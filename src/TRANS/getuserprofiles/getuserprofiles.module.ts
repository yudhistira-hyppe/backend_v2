import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetuserprofilesController } from './getuserprofiles.controller';
import { GetuserprofilesService } from './getuserprofiles.service';
import { ConfigModule } from '@nestjs/config';
import { Getuserprofiles, GetuserprofilesSchema } from './schemas/getuserprofiles.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { CountriesModule } from '../../infra/countries/countries.module';
import { CitiesModule } from '../../infra/cities/cities.module';
import { AreasModule } from '../../infra/areas/areas.module';
import { UserauthsModule } from '../userauths/userauths.module';
import { MediaprofilepictsModule } from '../../content/mediaprofilepicts/mediaprofilepicts.module';
import { InsightsModule} from '../../content/insights/insights.module';
import { LanguagesModule} from '../../infra/languages/languages.module';
import { InterestsModule } from '../../infra/interests/interests.module';
import { FileSystemStoredFile, FormDataRequest,NestjsFormDataModule } from 'nestjs-form-data';
@Module({
 
  imports: [
    ConfigModule.forRoot(),UserbasicsModule, NestjsFormDataModule,CountriesModule,AreasModule,UserauthsModule,CitiesModule,MediaprofilepictsModule,InsightsModule,LanguagesModule,InterestsModule,

    MongooseModule.forFeature([{ name: Getuserprofiles.name, schema: GetuserprofilesSchema }],'SERVER_TRANS')
],
controllers: [GetuserprofilesController],
exports: [GetuserprofilesService],
providers: [GetuserprofilesService],
})
export class GetuserprofilesModule {}
