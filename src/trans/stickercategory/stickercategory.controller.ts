import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Req, UploadedFiles, BadRequestException, Res, HttpStatus, NotAcceptableException } from '@nestjs/common';
import { StickerCategoryService } from './stickercategory.service';
import { CreateStickerCategoryDto } from './dto/create-stickercategory.dto';
import { UtilsService } from 'src/utils/utils.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OssService } from 'src/stream/oss/oss.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('api/stickercategory')
export class StickerCategoryController {
  constructor(private readonly stickerCategoryService: StickerCategoryService,
    private readonly utilService:UtilsService,
    private readonly osService: OssService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: "icon", maxCount: 1 }]))
  async create(
    @Req() request,
    @UploadedFiles() files:{
      icon?: Express.Multer.File[]
    },
    @Res() res
  ) {
    if(files.icon == undefined)
    {
        throw new BadRequestException("Unabled to proceed, icon field is required");
    }
    
    var request_json = JSON.parse(JSON.stringify(request.body));
    var name = request_json['name'];
    if(name == undefined || name == null)
    {   
        throw new BadRequestException("Unabled to proceed, name field is required");
    }

    var checkdata = await this.stickerCategoryService.findOne(name, "name");
    if(checkdata != null)
    {
        throw new NotAcceptableException("cannot create data, data still exist on database");   
    }
    
    var insertdata = new CreateStickerCategoryDto();
    var mongo = require('mongoose');
    var tempid = new mongo.Types.ObjectId();
    insertdata._id = tempid;
    insertdata.name = name;
    insertdata.active = true;
    insertdata.createdAt = await this.utilService.getDateTimeString();
    insertdata.updatedAt = await this.utilService.getDateTimeString();

    const messages = {
      "info": ["The process successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try
    {
      //upload icon
      var insertfile = files.icon[0];
      var path = "images/stickercategory/" + tempid + "." + insertfile.originalname.split(".")[1];
      var result = await this.osService.uploadFile(insertfile, path);
      insertdata.icon = result.url;

      await this.stickerCategoryService.create(insertdata);

      return res.status(HttpStatus.OK).json({
          response_code: 202,
          "data": insertdata,
          "message": messages
      });
    }
    catch(e)
    {
      return res.status(HttpStatus.BAD_REQUEST).json({
        "message": messagesEror
      });
    }

    // return this.stickerCategoryService.create(createStickerCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('listing')
  async findAll(@Req() request) {
    var page = null;
    var limit = null;

    var request_json = JSON.parse(JSON.stringify(request.body));
    if(request_json['page'] != undefined && request_json['page'] != null)
    {
        page = request_json['page'];
    }

    if(request_json['limit'] != undefined && request_json['limit'] != null)
    {
        limit = request_json['limit'];
    }

    var data = await this.stickerCategoryService.findAll(page, limit);

    const messages = {
      "info": ["The process successful"],
    };

    return {
        response_code:202,
        data: data,
        message:messages
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stickerCategoryService.findOne(id, "id");
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  async update(@Req() request) {
      var id = null;
      var name = null;
      var updatechild = false;

      var request_json = JSON.parse(JSON.stringify(request.body));
      if(request_json['id'] == undefined && request_json['id'] == null)
      {
          throw new BadRequestException("Unable to proceed. id field is required");
      }

      if(request_json['name'] == undefined && request_json['name'] == null)
      {
          throw new BadRequestException("Unable to proceed. name field is required");
      }

      id = request_json['id'];
      name = request_json['name'];

      var checkdata = await this.stickerCategoryService.findOne(name, "name");

      if(checkdata != null)
      {
        if(checkdata.name == name)
        {
            if(id != checkdata._id)
            {
                throw new NotAcceptableException("cannot update data, data still exist on database");   
            }
        }
        else
        {
            var childdata = checkdata.stiker_data;
            if(childdata.length != 0)
            {
                updatechild = true;
            }
        }
      }

      var updateStickerCategory = new CreateStickerCategoryDto();
      updateStickerCategory.name = name;
      
      await this.stickerCategoryService.update(id, updateStickerCategory, updatechild); 

      const messages = {
        "info": ["The process successful"],
      };

      return {
          response_code:202,
          message:messages
      };
  }

  @UseGuards(JwtAuthGuard)
  @Get('delete/:id')
  async remove(@Param('id') id: string) {
    var updatedata = new CreateStickerCategoryDto();
    updatedata.active = false;

    await this.stickerCategoryService.update(id, updatedata, false);

    const messages = {
      "info": ["The process successful"],
    };

    return {
        response_code:202,
        message:messages
    };
  }
}
