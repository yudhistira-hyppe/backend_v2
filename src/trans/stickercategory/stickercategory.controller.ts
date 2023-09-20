import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Req, UploadedFiles, BadRequestException, Res, HttpStatus, NotAcceptableException } from '@nestjs/common';
import { StickerCategoryService } from './stickercategory.service';
import { CreateStickerCategoryDto } from './dto/create-stickercategory.dto';
import { UtilsService } from 'src/utils/utils.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OssService } from 'src/stream/oss/oss.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MediastikerService } from 'src/content/mediastiker/mediastiker.service';

@Controller('api/stickercategory')
export class StickerCategoryController {
  constructor(private readonly stickerCategoryService: StickerCategoryService,
    private readonly utilService:UtilsService,
    private readonly osService: OssService,
    private readonly mstikerService:MediastikerService) {}

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
    var tipesticker = request_json['tipesticker'];
    if(tipesticker == undefined || tipesticker == null)
    {   
        throw new BadRequestException("Unabled to proceed, tipesticker field is required");
    }

    var checkdata = await this.stickerCategoryService.checkdata(name, tipesticker, null);
    if(checkdata != null)
    {
        throw new NotAcceptableException("cannot create data, data still exist on database");   
    }
    
    var insertdata = new CreateStickerCategoryDto();
    var mongo = require('mongoose');
    var tempid = new mongo.Types.ObjectId();
    insertdata._id = tempid;
    insertdata.name = name;
    insertdata.type = tipesticker;
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
    var tipesticker = null;
    
    var request_json = JSON.parse(JSON.stringify(request.body));
    if(request_json['tipesticker'] == undefined && request_json['tipesticker'] == null)
    {
      throw new BadRequestException("Unabled to proceed, tipesticker field is required");
    }
    
    tipesticker = request_json['tipesticker'];
    page = request_json['page'];
    limit = request_json['limit'];

    var data = await this.stickerCategoryService.findAll(tipesticker, page, limit);

    const messages = {
      "info": ["The process successful"],
    };

    return {
        response_code:202,
        data: data,
        message:messages
    }
  }

  @Get(':id/:tipestiker')
  findOne(@Param('id') id: string, @Param('tipestiker') tipesticker:string) {
    return this.stickerCategoryService.findOne(id, tipesticker, "id");
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  async update(@Req() request) {
      var id = null;
      var name = null;
      var updatechild = false;
      var tipesticker = null;

      var request_json = JSON.parse(JSON.stringify(request.body));
      if(request_json['id'] == undefined && request_json['id'] == null)
      {
          throw new BadRequestException("Unable to proceed. id field is required");
      }

      if(request_json['name'] == undefined && request_json['name'] == null)
      {
          throw new BadRequestException("Unable to proceed. name field is required");
      }

      if(request_json['tipesticker'] == undefined && request_json['tipesticker'] == null)
      {   
          throw new BadRequestException("Unabled to proceed, tipesticker field is required");
      }
      
      id = request_json['id'];
      name = request_json['name'];
      tipesticker = request_json['tipesticker'];

      var checkdata = await this.stickerCategoryService.checkdata(name, tipesticker, id);
      if(checkdata != null)
      {
        throw new NotAcceptableException("cannot create data, data still exist on database");
      }

      var getdata = await this.stickerCategoryService.findone2(id);

      var updateStickerCategory = new CreateStickerCategoryDto();
      updateStickerCategory.name = name;
      updateStickerCategory.type = tipesticker;
      
      await this.stickerCategoryService.update(id, updateStickerCategory); 

      var checkanak = await this.mstikerService.findByKategori(getdata.name.toString());
      if(checkanak.length != 0)
      {
        await this.mstikerService.updatedatabasedonkategori(getdata.name.toString(), name.toString(), tipesticker); 
      }

      const messages = {
        "info": ["The process successful"],
      };

      return {
          response_code:202,
          message:messages
      };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/status/delete')
  async remove(@Param('id') id: string) {
    var data = await this.stickerCategoryService.findone2(id);
    var child = await this.mstikerService.findByKategori(data.name.toString());

    var updatedata = new CreateStickerCategoryDto();
    updatedata.active = false;

    await this.stickerCategoryService.update(id, updatedata);

    if(child.length != 0)
    {
      for(var i = 0; i < child.length; i++)
      {
        var konvert = child[i]._id;
        await this.mstikerService.updateNonactive(konvert.toString());
      }
    }

    const messages = {
      "info": ["The process successful"],
    };

    return {
        response_code:202,
        message:messages
    };
  }
}
