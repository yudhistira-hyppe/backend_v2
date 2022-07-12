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
import { MediaModule } from '../stream/media/media.module';
import { AreasModule } from '../infra/areas/areas.module';
import { CitiesModule } from '../infra/cities/cities.module';
import { CountriesModule } from '../infra/countries/countries.module';
import { EulasModule } from '../infra/eulas/eulas.module';
import { WelcomenotesModule } from 'src/infra/welcomenotes/welcomenotes.module';
import { LanguagesModule } from 'src/infra/languages/languages.module';
import { ReactionsRepoModule } from 'src/infra/reactions_repo/reactions_repo.module';
import { ReactionsModule } from 'src/infra/reactions/reactions.module';
import { DocumentsModule } from 'src/infra/documents/documents.module';
import { ReportsModule } from 'src/infra/reports/reports.module';
import { CorevaluesModule } from 'src/infra/corevalues/corevalues.module';

@Module({
  imports: [
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
    MediaModule,
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
export class UtilsModule {}
