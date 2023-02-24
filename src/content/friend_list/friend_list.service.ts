import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { FriendListDto } from './dto/create-friend_list.dto';
import { FriendList, FriendListDocument } from './schema/friend_list.schema';

@Injectable()
export class FriendListService {
  constructor(
      @InjectModel(FriendList.name, 'SERVER_FULL')
      private readonly friendListModel: Model<FriendListDocument>,
  ) { }

  async create(FriendListDto: FriendListDto):Promise<FriendList> {
    const data = await this.friendListModel.create(FriendListDto);
    
    return data;
  }

  async findAll() {
    return await this.friendListModel.find().exec();
  }

  async findOne(id: ObjectId) {
    return await this.friendListModel.findOne({ _id: id }).exec();
  }

  async update(id: ObjectId, FriendListDto: FriendListDto) {
    const data = await this.friendListModel.updateOne(
      {
        _id:id
      }, 
      {
        "$set":FriendListDto 
      });

    return data;
  }

  async deleteFriendList(email_target:string, email_source:string)
  {
    var datasource = await this.friendListModel.findOne({ email: email_source }).exec();
    
    //cari data email_target dalam list email_source 
    var tempresult = datasource.friendlist;
    var setfriendarray = [];
    for(var i = 0; i < tempresult.length; i++)
    {
      var tempdata = tempresult[i].email;
      if(tempdata != email_target)
      {
        setfriendarray.push({
          "email":tempdata
        });
      }
    }

    var total = setfriendarray.length;
    var setinput = {
      totalfriend:total,
      friendlist:setfriendarray
    };

    // console.log(email_target);
    // console.log(email_source);
    // console.log(setinput);
    // console.log('berhasil');

    return await this.friendListModel.updateOne(
      {
        _id:datasource._id
      },
      {
        "$set":setinput
      }
    );
  }

  async addFriendList(email_target:string, email_source:string)
  {
    var ketemu = false;
    var datasource = await this.friendListModel.findOne({ email: email_source }).exec();
    
    //cari data email_target dalam list email_source 
    var tempresult = datasource.friendlist;
    for(var i = 0; i < tempresult.length; i++)
    {
      var tempdata = tempresult[i].email;
      if(tempdata == email_target)
      {
        ketemu = true;
      }
    }

    if(ketemu == false)
    {
      var setfriendarray = tempresult;
      setfriendarray.push({
        "email":email_target
      });

      var total = setfriendarray.length;
      var setinput = {
        totalfriend:total,
        friendlist:setfriendarray
      };

      await this.friendListModel.updateOne(
        {
          _id:datasource._id
        },
        {
          "$set":setinput
        }
      );
    }

    return true;
  }
}
