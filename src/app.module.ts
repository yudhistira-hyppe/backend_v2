import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserdevicesModule } from './trans/userdevices/userdevices.module';
import { UserbasicsModule } from './trans/userbasics/userbasics.module';
import { UserauthsModule } from './trans/userauths/userauths.module';
import { UserticketsModule } from './trans/usertickets/usertickets.module';
import { JwtrefreshtokenModule } from './trans/jwtrefreshtoken/jwtrefreshtoken.module';
import { ConfigModule } from '@nestjs/config';
import { SnapshoteventsModule } from './trans/snapshotevents/snapshotevents.module';
import { SagasModule } from './trans/sagas/sagas.module';
import { AdrolesModule } from './trans/adroles/adroles.module';
import { AuthModule } from './auth/auth.module';
import { DomaineventsModule } from './trans/domainevents/domainevents.module';
import { ActivityeventsModule } from './trans/activityevents/activityevents.module';
import { OauthclientdetailsModule } from './trans/oauthclientdetails/oauthclientdetails.module';
import { AreasModule } from './infra/areas/areas.module';
import { CitiesModule } from './infra/cities/cities.module';
import { CountriesModule } from './infra/countries/countries.module';
import { DocumentsModule } from './infra/documents/documents.module';
import { CorevaluesModule } from './infra/corevalues/corevalues.module';
import { EulasModule } from './infra/eulas/eulas.module';
import { FsChunksModule } from './infra/fs.chunks/fs.chunks.module';
import { FsfilesModule } from './infra/fsfiles/fsfiles.module';
import { InterestsModule } from './infra/interests/interests.module';
import { InterestsRepoModule } from './infra/interests_repo/interests_repo.module';
import { LanguagesModule } from './infra/languages/languages.module';
import { ReactionsModule } from './infra/reactions/reactions.module';
import { ReactionsRepoModule } from './infra/reactions_repo/reactions_repo.module';
import { ReportsModule } from './infra/reports/reports.module';
import { TemplatesModule } from './infra/templates/templates.module';
import { TemplatesRepoModule } from './infra/templates_repo/templates_repo.module';
import { WelcomenotesModule } from './infra/welcomenotes/welcomenotes.module';
import { ContentdailyqueueModule } from './content/contentdailyqueue/contentdailyqueue.module';
import { ContenteventsModule } from './content/contentevents/contentevents.module';
import { ContentqmaticModule } from './content/contentqmatic/contentqmatic.module';
import { DisqusModule } from './content/disqus/disqus.module';
import { DisquscontactsModule } from './content/disquscontacts/disquscontacts.module';
import { DisquslogsModule } from './content/disquslogs/disquslogs.module';
import { InsightlogsModule } from './content/insightlogs/insightlogs.module';
import { InsightsModule } from './content/insights/insights.module';
import { MediadiariesModule } from './content/mediadiaries/mediadiaries.module';
import { MediapictsModule } from './content/mediapicts/mediapicts.module';
import { MediaprofilepictsModule } from './content/mediaprofilepicts/mediaprofilepicts.module';
import { MediaproofpictsModule } from './content/mediaproofpicts/mediaproofpicts.module';
import { MediastoriesModule } from './content/mediastories/mediastories.module';
import { MediavideosModule } from './content/mediavideos/mediavideos.module';
import { NotificationsModule } from './content/notifications/notifications.module';
import { PostsModule } from './content/posts/posts.module';
import { ProfileModule } from './trans/profile/profile.module';
import { GetuserprofilesModule } from './trans/getuserprofiles/getuserprofiles.module';
import { GetusercontentsModule } from './trans/getusercontents/getusercontents.module';
import { CommentModule } from './trans/getusercontents/comment/comment.module';
import { FaqsModule } from './trans/faqs/faqs.module';
import { AnnouncementsModule } from './trans/announcements/announcements.module';
import { UtilsModule } from './utils/utils.module';
import { TransactionsModule } from './trans/transactions/transactions.module';
import { AccountbalancesModule } from './trans/accountbalances/accountbalances.module';
import { GetcontenteventsModule } from './trans/getusercontents/getcontentevents/getcontentevents.module';
import { UserticketdetailsModule } from './trans/usertickets/userticketdetails/userticketdetails.module';
import { FaqdetailsModule } from './trans/faqs/faqdetails/faqdetails.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.SERVER_TRANS, {
      connectionName: 'SERVER_TRANS',
    }),
    MongooseModule.forRoot(process.env.SERVER_CONTENT, {
      connectionName: 'SERVER_CONTENT',
    }),
    MongooseModule.forRoot(process.env.SERVER_INFRA, {
      connectionName: 'SERVER_INFRA',
    }),
    // UserdevicesModule,
    // UserbasicsModule,
    // UserauthsModule,
    //CommentModule,
    FaqdetailsModule,
    UserticketdetailsModule,
    UtilsModule,
    GetcontenteventsModule,
    AccountbalancesModule,
    TransactionsModule,
    AnnouncementsModule,
    UserticketsModule,
    FaqsModule,
    GetusercontentsModule,
    GetuserprofilesModule,
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
    AuthModule,

  ],
})
export class AppModule { }
