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

  async create(FriendListDto: FriendListDto): Promise<FriendList> {
    const data = await this.friendListModel.create(FriendListDto);

    return data;
  }

  async findAll() {
    return await this.friendListModel.find().exec();
  }
  async findOnebyemail(email: string): Promise<FriendList> {
    return this.friendListModel.findOne({ email: email }).exec();
  }
  async findOne(id: ObjectId) {
    return await this.friendListModel.findOne({ _id: id }).exec();
  }

  async update(id: ObjectId, FriendListDto: FriendListDto) {
    const data = await this.friendListModel.updateOne(
      {
        _id: id
      },
      {
        "$set": FriendListDto
      });

    return data;
  }

  async deleteFriendList(email_target: string, email_source: string) {
    var datasource = await this.friendListModel.findOne({ email: email_source }).exec();

    //cari data email_target dalam list email_source
    try {
      var tempresult = datasource.friendlist;
      var setfriendarray = [];
      for (var i = 0; i < tempresult.length; i++) {
        var tempdata = tempresult[i].email;
        if (tempdata != email_target) {
          setfriendarray.push({
            "email": tempdata
          });
        }
      }

      var total = setfriendarray.length;
      var setinput = {
        totalfriend: total,
        friendlist: setfriendarray
      };

      // console.log(email_target);
      // console.log(email_source);
      // console.log(setinput);
      // console.log('berhasil');

      return await this.friendListModel.updateOne(
        {
          _id: datasource._id
        },
        {
          "$set": setinput
        }
      );
    }
    catch (e) {
      return false;
      //console.log('baru');
    }
  }

  async addFriendList(email_target: string, email_source: string) {
    var setfriendarray = null;
    var setinput = null;
    var ketemu = false;

    //var datasource = await this.friendListModel.findOne({ email: email_source }).exec();
    var datasource = await this.friendListModel.aggregate([
      {
        "$match":
        {
          email: email_source,
          friendlist:
          {
            "$elemMatch":
            {
              "email": email_target
            }
          }
        }
      }
    ]);

    // console.log('test');
    // console.log(email_target);
    // console.log(datasource);

    if (datasource.length == 0) {
      var datasource2 = await this.friendListModel.findOne({ email: email_source }).exec();
      // console.log(datasource2);
      if (datasource2 == null) {
        var query = await this.friendListModel.aggregate([
          {
            "$limit": 1
          },
          {
            "$lookup":
            {
              from: "userauths",
              let:
              {
                auth_fk: email_source
              },
              as: "auth_data",
              pipeline:
                [
                  {
                    "$match":
                    {
                      "$expr":
                      {
                        "$eq":
                          [
                            "$email",
                            "$$auth_fk"
                          ]
                      }
                    }
                  },
                  {
                    "$project":
                    {
                      _id: 0,
                      username: 1
                    }
                  },
                ]
            }
          },
          {
            "$lookup":
            {
              from: "userbasics",
              let:
              {
                basic_fk: email_source
              },
              as: "basic_data",
              pipeline:
                [
                  {
                    "$match":
                    {
                      "$expr":
                      {
                        "$eq":
                          [
                            "$email",
                            "$$basic_fk"
                          ]
                      }
                    }
                  },
                  {
                    "$project":
                    {
                      _id: 1,
                      fullName: 1,
                      email: 1,
                    }
                  },
                ]
            }
          },
          {
            "$project":
            {
              _id:
              {
                "$arrayElemAt":
                  [
                    "$basic_data._id", 0
                  ]
              },
              fullName:
              {
                "$arrayElemAt":
                  [
                    "$basic_data.fullName", 0
                  ]
              },
              username:
              {
                "$arrayElemAt":
                  [
                    "$auth_data.username", 0
                  ]
              }
            }
          }
        ]);
        setfriendarray = [];
        setfriendarray.push({
          "email": email_target
        });

        setinput =
        {
          _id: query[0]._id,
          email: email_source,
          fullName: query[0].fullName,
          username: query[0].username,
          totalfriend: 1,
          friendlist: setfriendarray
        };


        return await this.create(setinput);
      }
      else {
        var tempresult = datasource2.friendlist;
        //cari data email_target dalam list email_source 
        for (var i = 0; i < tempresult.length; i++) {
          var tempdata = tempresult[i].email;
          if (tempdata == email_target) {
            ketemu = true;
          }
        }

        if (ketemu == false) {
          setfriendarray = tempresult;
          setfriendarray.push({
            "email": email_target
          });

          var total = setfriendarray.length;
          setinput = {
            totalfriend: total,
            friendlist: setfriendarray
          };

          await this.friendListModel.updateOne(
            {
              _id: datasource2._id
            },
            {
              "$set": setinput
            }
          );
        }

        return true;
      }
    }
  }

  async addFriendList3(email_target: string, email_source: string) {
    var setfriendarray = null;
    var setinput = null;
    var ketemu = false;

    //var datasource = await this.friendListModel.findOne({ email: email_source }).exec();
    var datasource = await this.friendListModel.aggregate([
      {
        "$match":
        {
          email: email_source,
          friendlist:
          {
            "$elemMatch":
            {
              "email": email_target
            }
          }
        }
      }
    ]);

    if (datasource.length == 0) {
      var datasource2 = await this.friendListModel.findOne({ email: email_source }).exec();
      // console.log(datasource2);
      if (datasource2 == null) {
        var query = await this.friendListModel.aggregate([
          {
            "$limit": 1
          },
          {
            "$lookup":
            {
              from: "newUserBasics",
              let:
              {
                basic_fk: email_source
              },
              as: "basic_data",
              pipeline:
                [
                  {
                    "$match":
                    {
                      "$expr":
                      {
                        "$eq":
                          [
                            "$email",
                            "$$basic_fk"
                          ]
                      }
                    }
                  },
                  {
                    "$project":
                    {
                      _id: 1,
                      fullName: 1,
                      email: 1,
                      username:1,
                    }
                  },
                ]
            }
          },
          {
            "$project":
            {
              _id:
              {
                "$arrayElemAt":
                  [
                    "$basic_data._id", 0
                  ]
              },
              fullName:
              {
                "$arrayElemAt":
                  [
                    "$basic_data.fullName", 0
                  ]
              },
              username:
              {
                "$arrayElemAt":
                  [
                    "$basic_data.username", 0
                  ]
              }
            }
          }
        ]);
        setfriendarray = [];
        setfriendarray.push({
          "email": email_target
        });

        setinput =
        {
          _id: query[0]._id,
          email: email_source,
          fullName: query[0].fullName,
          username: query[0].username,
          totalfriend: 1,
          friendlist: setfriendarray
        };


        return await this.create(setinput);
      }
      else {
        var tempresult = datasource2.friendlist;
        //cari data email_target dalam list email_source 
        for (var i = 0; i < tempresult.length; i++) {
          var tempdata = tempresult[i].email;
          if (tempdata == email_target) {
            ketemu = true;
          }
        }

        if (ketemu == false) {
          setfriendarray = tempresult;
          setfriendarray.push({
            "email": email_target
          });

          var total = setfriendarray.length;
          setinput = {
            totalfriend: total,
            friendlist: setfriendarray
          };

          await this.friendListModel.updateOne(
            {
              _id: datasource2._id
            },
            {
              "$set": setinput
            }
          );
        }

        return true;
      }
    }
  }
}
