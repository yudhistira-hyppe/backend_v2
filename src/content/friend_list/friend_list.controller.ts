import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FriendListService } from './friend_list.service';
import { FriendListDto } from './dto/create-friend_list.dto';

@Controller('friend-list')
export class FriendListController {}
