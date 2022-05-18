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
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.SERVER_TRANS,{ connectionName: 'SERVER_TRANS' }),
    MongooseModule.forRoot(process.env.SERVER_CONTENT,{ connectionName: 'SERVER_CONTENT' }),
    MongooseModule.forRoot(process.env.SERVER_INFRA,{ connectionName: 'SERVER_INFRA' }),
   // UserdevicesModule,
   // UserbasicsModule,
   // UserauthsModule,
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
