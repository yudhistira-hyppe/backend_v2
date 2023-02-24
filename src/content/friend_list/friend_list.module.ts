import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendListService } from './friend_list.service';
import { FriendListController } from './friend_list.controller';
import { ConfigModule } from '@nestjs/config';
import { FriendList, FriendListSchema } from './schema/friend_list.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: FriendList.name, schema: FriendListSchema }], 'SERVER_FULL')
  ],
  controllers: [FriendListController],
  providers: [FriendListService],
  exports: [FriendListService]
})
export class FriendListModule {}
