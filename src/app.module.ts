import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserdevicesModule } from './TRANS/userdevices/userdevices.module';
import { UserbasicsModule } from './TRANS/userbasics/userbasics.module';
import { UserauthsModule } from './TRANS/userauths/userauths.module';
import { JwtrefreshtokenModule } from './TRANS/jwtrefreshtoken/jwtrefreshtoken.module';
import { ConfigModule } from '@nestjs/config';
import { SnapshoteventsModule } from './TRANS/snapshotevents/snapshotevents.module';
import { SagasModule } from './TRANS/sagas/sagas.module';
import { AdrolesModule } from './TRANS/adroles/adroles.module';
import { AuthModule } from './auth/auth.module';
import { DomaineventsModule } from './TRANS/domainevents/domainevents.module';
import { ActivityeventsModule } from './TRANS/activityevents/activityevents.module';
import { OauthclientdetailsModule } from './TRANS/oauthclientdetails/oauthclientdetails.module';
import { AreasModule } from './INFRA/areas/areas.module';
import { CitiesModule } from './INFRA/cities/cities.module';
import { CountriesModule } from './INFRA/countries/countries.module';
import { DocumentsModule } from './INFRA/documents/documents.module';
import { CorevaluesModule } from './INFRA/corevalues/corevalues.module';
import { EulasModule } from './INFRA/eulas/eulas.module';
import { FsChunksModule } from './INFRA/fs.chunks/fs.chunks.module';
import { FsfilesModule } from './INFRA/fsfiles/fsfiles.module';
import { InterestsModule } from './INFRA/interests/interests.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.SERVER_TRANS,{ connectionName: 'SERVER_TRANS' }),
    MongooseModule.forRoot(process.env.SERVER_CONTENT,{ connectionName: 'SERVER_CONTENT' }),
    MongooseModule.forRoot(process.env.SERVER_INFRA,{ connectionName: 'SERVER_INFRA' }),
   // UserdevicesModule,
   // UserbasicsModule,
   // UserauthsModule,
   InterestsModule,
   FsfilesModule,
   FsChunksModule,
   EulasModule,
   CorevaluesModule,
   DocumentsModule,
   CountriesModule,
   CitiesModule,
   AreasModule,
   OauthclientdetailsModule,
   ActivityeventsModule,
   DomaineventsModule,
    JwtrefreshtokenModule,
    SnapshoteventsModule,
    SagasModule,
    AdrolesModule,
    AuthModule
  ],
})
export class AppModule {}
