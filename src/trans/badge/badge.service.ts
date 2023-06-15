import { Injectable, BadRequestException, Res } from '@nestjs/common';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { badge, badgeDocument } from './schemas/badge.schema';
import { OssService } from 'src/stream/oss/oss.service';
import { first } from 'rxjs';

@Injectable()
export class BadgeService {
  constructor(
    @InjectModel(badge.name, 'SERVER_FULL')
    private readonly dataModel: Model<badgeDocument>,
    private readonly ossservices: OssService
  ){ }

  async create(general: Express.Multer.File[], profile: Express.Multer.File[], body: any) {
    var mongoose = require('mongoose');
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    var hasilconvert = dt.toISOString().split("T");
    var convert = hasilconvert[0] + " " + hasilconvert[1].split(".")[0];

    var insertdata = new CreateBadgeDto();
    var tempid = new mongoose.Types.ObjectId();
    insertdata._id = tempid;
    insertdata.createdAt = convert;
    insertdata.name = body.name;
    var stringdata = body.type;
    insertdata.type = stringdata.toUpperCase();

    if(general == undefined)
    {
      throw new BadRequestException("Unabled to proceed. badge general is required");
    }

    if(profile == undefined)
    {
      throw new BadRequestException("Unabled to proceed. badge profile is required");
    }

    //upload badge general
    var insertfile = general[0];
    var path = "images/badge/" + tempid + "_general" + "." + insertfile.originalname.split(".")[1];
    var result = await this.ossservices.uploadFile(insertfile, path);
    insertdata.badgeOther = result.url;

    //upload badge profile
    var insertfile = profile[0];
    var path = "images/badge/" + tempid + "_profile" + "." + insertfile.originalname.split(".")[1];
    var result = await this.ossservices.uploadFile(insertfile, path);
    insertdata.badgeProfile = result.url;

    var data = await this.dataModel.create(insertdata);

    return insertdata;
  }

  async findAll() {
    var data = await this.dataModel.find().exec();

    return data;
  }

  async detailAll(search: string, listjuara: any[], page:number, limit:number)
  {
    var pipeline = [];
    var firstmatch = [];

    if(search != null && search != undefined)
    {
      firstmatch.push(
        {
          "name":
          {
            "$regex":search,
            "$options":"i"
          }
        }
      );
    }

    if(listjuara != null && listjuara != undefined)
    {
      var convertlistjuara = [];
      for(var i = 0; i < listjuara.length; i++)
      {
        var setstringjuara = 'JUARA' + listjuara[i].toString();
        convertlistjuara.push(setstringjuara);
      }

      firstmatch.push(
        {
          "$expr":
          {
            "$in":
              [
                "$type", convertlistjuara
              ]
          }
        }
      );
    }

    if(firstmatch.length != 0)
    {
      pipeline.push(
        {
          "$match":
          {
            "$and":firstmatch
          }
        }
      );
    }

    if(page > 0)
    {
        pipeline.push({
            "$skip":limit * page
        });
    }

    if(limit > 0)
    {
        pipeline.push({   
            "$limit":limit
        });
    }

    var query = await this.dataModel.aggregate(pipeline);

    return query;
  }

  async findOne(id: string) {
    var mongoose = require('mongoose');
    var convert = mongoose.Types.ObjectId(id);
    return await this.dataModel.findOne({ _id : convert }).exec();
  }

  async update(id: string, general: Express.Multer.File[], profile: Express.Multer.File[], body: any) {
    var updatedata = new CreateBadgeDto();
    // updatedata.createdAt = convert;
    updatedata.name = body.name;
    var stringdata = body.type;
    updatedata.type = stringdata.toUpperCase();

    if(general != undefined)
    {
      //upload badge general
      var insertfile = general[0];
      var path = "images/badge/" + id + "_general" + "." + insertfile.originalname.split(".")[1];
      var result = await this.ossservices.uploadFile(insertfile, path);
      updatedata.badgeOther = result.url;
    }

    if(profile != undefined)
    {
      //upload badge profile
      var insertfile = profile[0];
      var path = "images/badge/" + id + "_profile" + "." + insertfile.originalname.split(".")[1];
      var result = await this.ossservices.uploadFile(insertfile, path);
      updatedata.badgeProfile = result.url;
    }

    var mongoose = require('mongoose');
    var convert = mongoose.Types.ObjectId(id);
    
    await this.dataModel.updateOne(
      {
        _id:convert
      },
      {
        "$set":
        {
          "name":updatedata.name,
          "type":updatedata.type,
          "badgeProfile":updatedata.badgeProfile,
          "badgeOther":updatedata.badgeOther,
        }
      }
    );

    return updatedata;
  }

  // async update(id: string, createBadgeData: CreateBadgeDto) {
  //   var mongoose = require('mongoose');
  //   var convert = mongoose.Types.ObjectId(id);
    
  //   return await this.dataModel.updateOne(
  //     {
  //       _id:convert
  //     },
  //     {
  //       "$set":
  //       {
  //         "name":createBadgeData.name,
  //         "type":createBadgeData.type,
  //         "badgeProfile":createBadgeData.badgeProfile,
  //         "badgeOther":createBadgeData.badgeOther,
  //       }
  //     }
  //   );
  // }

  // async remove(id: number) {
  //   return `This action removes a #${id} badge`;
  // }
}
