import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ConfigModule } from '@nestjs/config';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { CountriesModule } from '../../INFRA/countries/countries.module';
import { CitiesModule } from '../../INFRA/cities/cities.module';
import { AreasModule } from '../../INFRA/areas/areas.module';
import { UserauthsModule } from '../../TRANS/userauths/userauths.module';
import { MediaprofilepictsModule } from '../../CONTENT/mediaprofilepicts/mediaprofilepicts.module';
import { InsightsModule} from '../../CONTENT/insights/insights.module';
import { LanguagesModule} from '../../INFRA/languages/languages.module';
import { InterestsModule } from '../../INFRA/interests/interests.module';
import { FileSystemStoredFile, FormDataRequest,NestjsFormDataModule } from 'nestjs-form-data';
@Module({
  imports: [
    ConfigModule.forRoot(),UserbasicsModule, NestjsFormDataModule,CountriesModule,AreasModule,UserauthsModule,CitiesModule,MediaprofilepictsModule,InsightsModule,LanguagesModule,InterestsModule,
    
],
  providers: [ProfileService],
  
controllers: [ProfileController],
exports: [ProfileService],

})
export class ProfileModule {}
