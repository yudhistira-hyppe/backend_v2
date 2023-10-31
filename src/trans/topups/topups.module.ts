
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Topups, TopupsSchema } from './schema/topups.schema';
import { TopupsController } from './topups.controller';
import { TopupsService } from './topups.service';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { UserauthsModule } from '../userauths/userauths.module';
import { AccountbalancesModule } from '../accountbalances/accountbalances.module';

@Module({
  imports: [
    AccountbalancesModule,
    UserbasicsModule,
    UserauthsModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Topups.name, schema: TopupsSchema }], 'SERVER_FULL')
  ],
  controllers: [TopupsController],
  providers: [TopupsService],
  exports: [TopupsService],
})
export class TopupsModule { }