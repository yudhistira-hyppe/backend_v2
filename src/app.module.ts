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
import { InterestsRepoModule } from './INFRA/interests_repo/interests_repo.module';
import { LanguagesModule } from './INFRA/languages/languages.module';
import { ReactionsModule } from './INFRA/reactions/reactions.module';
import { ReactionsRepoModule } from './INFRA/reactions_repo/reactions_repo.module';
import { ReportsModule } from './INFRA/reports/reports.module';
import { TemplatesModule } from './INFRA/templates/templates.module';
import { TemplatesRepoModule } from './INFRA/templates_repo/templates_repo.module';
import { WelcomenotesModule } from './INFRA/welcomenotes/welcomenotes.module';
import { ContentdailyqueueModule } from './CONTENT/contentdailyqueue/contentdailyqueue.module';
import { ContenteventsModule } from './CONTENT/contentevents/contentevents.module';
import { ContentqmaticModule } from './CONTENT/contentqmatic/contentqmatic.module';
import { DisqusModule } from './CONTENT/disqus/disqus.module';
import { DisquscontactsModule } from './CONTENT/disquscontacts/disquscontacts.module';
import { DisquslogsModule } from './CONTENT/disquslogs/disquslogs.module';
import { InsightlogsModule } from './CONTENT/insightlogs/insightlogs.module';
import { InsightsModule } from './CONTENT/insights/insights.module';
import { MediadiariesModule } from './CONTENT/mediadiaries/mediadiaries.module';
import { MediapictsModule } from './CONTENT/mediapicts/mediapicts.module';
import { MediaprofilepictsModule } from './CONTENT/mediaprofilepicts/mediaprofilepicts.module';
import { MediaproofpictsModule } from './CONTENT/mediaproofpicts/mediaproofpicts.module';
import { MediastoriesModule } from './CONTENT/mediastories/mediastories.module';
import { MediavideosModule } from './CONTENT/mediavideos/mediavideos.module';
import { NotificationsModule } from './CONTENT/notifications/notifications.module';
import { PostsModule } from './CONTENT/posts/posts.module';
import { ProfileModule } from './TRANS/profile/profile.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.SERVER_TRANS,{ connectionName: 'SERVER_TRANS' }),
    MongooseModule.forRoot(process.env.SERVER_CONTENT,{ connectionName: 'SERVER_CONTENT' }),
    MongooseModule.forRoot(process.env.SERVER_INFRA,{ connectionName: 'SERVER_INFRA' }),
   // UserdevicesModule,
   // UserbasicsModule,
   // UserauthsModule,
   ProfileModule,
   PostsModule,
   NotificationsModule,
   MediavideosModule,
   MediastoriesModule,
   MediaproofpictsModule,
   MediaprofilepictsModule,
   MediapictsModule,
   MediadiariesModule,
   InsightsModule,
   InsightlogsModule,
   DisquslogsModule,
   DisquscontactsModule,
   DisqusModule,
   ContentqmaticModule,
   ContenteventsModule,
   ContentdailyqueueModule,
   WelcomenotesModule,
   TemplatesRepoModule,
   TemplatesModule,
   ReportsModule,
   ReactionsRepoModule,
   ReactionsModule,
   LanguagesModule,
   InterestsRepoModule,
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
