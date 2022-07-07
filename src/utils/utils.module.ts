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

@Module({
  imports: [
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
