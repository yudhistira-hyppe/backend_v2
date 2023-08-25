import { Module } from '@nestjs/common';
import { ErrorHandler } from './error.handler';
import { UtilsService } from './utils.service';
import { UserauthsModule } from '../trans/userauths/userauths.module';
import { JwtrefreshtokenModule } from '../trans/jwtrefreshtoken/jwtrefreshtoken.module';
import { TemplatesModule } from '../infra/templates/templates.module';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { UtilsController } from './utils.controller';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { InterestsRepoModule } from '../infra/interests_repo/interests_repo.module';
import { AreasModule } from '../infra/areas/areas.module';
import { CitiesModule } from '../infra/cities/cities.module';
import { CountriesModule } from '../infra/countries/countries.module';
import { WelcomenotesModule } from '../infra/welcomenotes/welcomenotes.module';
import { LanguagesModule } from '../infra/languages/languages.module';
import { ReactionsRepoModule } from '../infra/reactions_repo/reactions_repo.module';
import { ReactionsModule } from '../infra/reactions/reactions.module';
import { DocumentsModule } from '../infra/documents/documents.module';
import { ReportsModule } from '../infra/reports/reports.module';
import { CorevaluesModule } from '../infra/corevalues/corevalues.module';
import { DevicelogModule } from '../infra/devicelog/devicelog.module';
import { UserbasicsModule } from '../trans/userbasics/userbasics.module';
import { InsightsModule } from '../content/insights/insights.module';
import { InterestsModule } from '../infra/interests/interests.module';
import { EulasModule } from '../infra/eulas/eulas.module';
import { MediaprofilepictsModule } from '../content/mediaprofilepicts/mediaprofilepicts.module';
import { SettingsModule } from '../trans/settings/settings.module';
import { SeaweedfsModule } from '../stream/seaweedfs/seaweedfs.module';
import { UserdevicesModule } from "../trans/userdevices/userdevices.module";
import { NotificationsModule } from "../content/notifications/notifications.module";
import { TemplatesRepoModule } from '../infra/templates_repo/templates_repo.module';
import { BanksModule } from '../trans/banks/banks.module';
import { DeepArModule } from '../trans/deepar/deepar.module';
import { UserscoresModule } from '../trans/userscores/userscores.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    UserbasicsModule,
    ScheduleModule,
    UserscoresModule,
    DeepArModule,
    BanksModule,
    TemplatesRepoModule,
    UserdevicesModule,
    NotificationsModule,
    SeaweedfsModule,
    SettingsModule,
    MediaprofilepictsModule,
    EulasModule,
    InterestsModule,
    InsightsModule,
    UserbasicsModule,
    DevicelogModule,
    CorevaluesModule,
    ReportsModule,
    DocumentsModule,
    ReactionsModule,
    ReactionsRepoModule,
    LanguagesModule,
    WelcomenotesModule,
    EulasModule,
    CountriesModule,
    CitiesModule,
    AreasModule,
    InterestsRepoModule,
    TemplatesModule,
    UserauthsModule,
    JwtrefreshtokenModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME },
    }),
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('EMAIL_HOST'),
          secure: false,
          auth: {
            user: config.get('EMAIL_USERNAME'),
            pass: config.get('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('EMAIL_USERNAME')}>`,
        },
        template: {
          dir: process.cwd() + '/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UtilsController],
  providers: [ErrorHandler, UtilsService],
  exports: [ErrorHandler, UtilsService],
})
export class UtilsModule { }
