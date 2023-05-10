import { Body, Controller, Delete, Get, Param, Post, Res, Req, Request, Put, UseGuards, BadRequestException, HttpStatus, UploadedFile, UploadedFiles, Headers, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express/multer';
import { InterestsRepoService } from './interests_repo.service';
import { CreateInterestsRepoDto } from './dto/create-interests_repo.dto';
import { Interestsrepo } from './schemas/interests_repo.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OssService } from 'src/stream/oss/oss.service';

@Controller('api/interestsrepo')
export class InterestsRepoController {
    constructor(
      private readonly InterestsRepoService: InterestsRepoService,
      private readonly OssServices: OssService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileFieldsInterceptor([{ name: 'icon_file', maxCount: 1 }]))
    async create(
      @UploadedFiles() files: { 
        icon_file?: Express.Multer.File[]
      },
      @Body() request,
      ) {
      var mongoose = require('mongoose');
      var dt = new Date(Date.now());
      dt.setHours(dt.getHours() + 7); // timestamp
      var hasilconvert = dt.toISOString().split("T");
      var convert = hasilconvert[0] + " " + hasilconvert[1].split(".")[0];

      var insertdata = new CreateInterestsRepoDto();
      insertdata._id = new mongoose.Types.ObjectId();
      insertdata.createdAt = convert;
      insertdata.updatedAt = convert;
      insertdata._class = "io.melody.hyppe.infra.domain.Interests";
      insertdata.interestName = request.interestName;
      insertdata.interestNameId = request.interestNameId;
      insertdata.langIso = request.langIso;
      insertdata.thumbnail = request.thumbnail;
      
      if(files.icon_file == undefined)
      {
        throw new BadRequestException("Unabled to proceed. icon file is required");
      }
      else
      {
        var insertfile = files.icon_file[0];
        var lowercase = insertdata.interestName.toLocaleLowerCase();
        var path = "images/icon_interest/" + lowercase + "." + insertfile.originalname.split(".")[1];
        var result = await this.OssServices.uploadFile(insertfile, path);
        insertdata.icon = result.url;
      }

      await this.InterestsRepoService.create(insertdata);

      const messages = {
        "info": ["The process successful"],
      };

      return {
          response_code: 202,
          data: insertdata,
          messages: messages,
      };
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Interestsrepo[]> {
      return this.InterestsRepoService.findAll();
    }

    @Post('list')
    @UseGuards(JwtAuthGuard)
    async findAllForList(@Request() request) {
      var page = null;
      var limit = null;
      var search = null;

      var request_json = JSON.parse(JSON.stringify(request.body));
      if (request_json["search"] !== undefined) {
        search = request_json["search"];
      }

      if (request_json["page"] !== undefined) {
        page = Number(request_json["page"]);
      } else {
          throw new BadRequestException("Unabled to proceed");
      }

      if (request_json["limit"] !== undefined) {
        limit = Number(request_json["limit"]);
      } else {
          throw new BadRequestException("Unabled to proceed");
      }

      var data = await this.InterestsRepoService.getInterestPagination(search, page, limit);
      //return this.InterestsRepoService.findAll();

      const messages = {
        "info": ["The process successful"],
      };

      return {
          response_code: 202,
          data:data,
          messages: messages,
      };
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Interestsrepo> {
      return this.InterestsRepoService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('update')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'icon_file', maxCount: 1 }]))
    async update(
      @UploadedFiles() files: { 
        icon_file?: Express.Multer.File[]
      },
      @Body() request,
      @Res() res,
      ) {
    
      var repoID = null;
      if (request.repoID !== undefined) {
        repoID = request.repoID;
      } else {
          throw new BadRequestException("Unabled to proceed");
      }
      
      var dt = new Date(Date.now());
      dt.setHours(dt.getHours() + 7); // timestamp
      var hasilconvert = dt.toISOString().split("T");
      var convert = hasilconvert[0] + " " + hasilconvert[1].split(".")[0];

      var updatedata = new CreateInterestsRepoDto();
      updatedata.updatedAt = convert;
      updatedata.interestNameId = request.interestNameId;
      updatedata.interestName = request.interestName;
      updatedata.langIso = request.langIso;
      updatedata.thumbnail = request.thumbnail;

      if(files.icon_file != undefined)
      {
        var insertfile = files.icon_file[0];
        var lowercase = updatedata.interestName.toLocaleLowerCase();
        var path = "images/icon_interest/" + lowercase + "." + insertfile.originalname.split(".")[1];
        var result = await this.OssServices.uploadFile(insertfile, path);
        updatedata.icon = result.url;
      }
      
      const messages = {
        "info": ["The process successful"],
      };

      const messagesEror = {
        "info": ["Todo is not found!"],
      };

      try {
            let data = await this.InterestsRepoService.update(repoID, updatedata);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": updatedata,
                "message": messages
            });
        } catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                "message": messagesEror
            });
        }
    }

    // @Delete(':id')
    // async delete(@Param('id') id: string) {
    //   await this.InterestsRepoService.delete(id);

    //   const messages = {
    //     "info": ["The process successful"],
    //   };

    //   return {
    //       response_code: 202,
    //       messages: messages,
    //   };
    // }
}
