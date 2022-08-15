import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ConfigModule } from '@nestjs/config';
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
import { GroupModule } from '../usermanagement/group/group.module';
import { DivisionModule } from '../usermanagement/division/division.module';
import { UtilsModule } from '../../utils/utils.module';

@Module({
  imports: [
    UtilsModule,
    DivisionModule,
    GroupModule,
    ConfigModule.forRoot(),UserbasicsModule, NestjsFormDataModule,CountriesModule,AreasModule,UserauthsModule,CitiesModule,MediaprofilepictsModule,InsightsModule,LanguagesModule,InterestsModule,
    
],
  providers: [ProfileService],
  
controllers: [ProfileController],
exports: [ProfileService],

})
export class ProfileModule {}
