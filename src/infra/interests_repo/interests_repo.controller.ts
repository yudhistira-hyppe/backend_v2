import { Body, Controller, Delete, Get, Param, Post, Res, Req, Request, Put, UseGuards, BadRequestException, HttpStatus } from '@nestjs/common';
import { InterestsRepoService } from './interests_repo.service';
import { CreateInterestsRepoDto } from './dto/create-interests_repo.dto';
import { Interestsrepo } from './schemas/interests_repo.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/interestsrepo')
export class InterestsRepoController {
    constructor(private readonly InterestsRepoService: InterestsRepoService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() CreateInterestsRepoDto: CreateInterestsRepoDto) {
      var mongoose = require('mongoose');
      var dt = new Date(Date.now());
      dt.setHours(dt.getHours() + 7); // timestamp
      var hasilconvert = dt.toISOString().split("T");
      var convert = hasilconvert[0] + " " + hasilconvert[1].split(".")[0];

      CreateInterestsRepoDto._id = new mongoose.Types.ObjectId();
      CreateInterestsRepoDto.createdAt = convert;
      CreateInterestsRepoDto.updatedAt = convert;
      CreateInterestsRepoDto._class = "io.melody.hyppe.infra.domain.Interests";
      
      await this.InterestsRepoService.create(CreateInterestsRepoDto);

      const messages = {
        "info": ["The process successful"],
      };

      return {
          response_code: 202,
          data: CreateInterestsRepoDto,
          messages: messages,
      };
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Interestsrepo[]> {
      return this.InterestsRepoService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Interestsrepo> {
      return this.InterestsRepoService.findOne(id);
    }

    @Post('update')
    @UseGuards(JwtAuthGuard)
    async update(@Res() res, @Request() request) {
      var repoID = null;
      var request_json = JSON.parse(JSON.stringify(request.body));
      if (request_json["repoID"] !== undefined) {
        repoID = request_json["repoID"];
      } else {
          throw new BadRequestException("Unabled to proceed");
      }
      
      var dt = new Date(Date.now());
      dt.setHours(dt.getHours() + 7); // timestamp
      var hasilconvert = dt.toISOString().split("T");
      var convert = hasilconvert[0] + " " + hasilconvert[1].split(".")[0];

      var updatedata = new CreateInterestsRepoDto();
      updatedata.updatedAt = convert;
      updatedata.interestNameId = request_json["interestNameId"];
      updatedata.interestName = request_json["interestName"];
      updatedata.icon = request_json["icon"];
      updatedata.langIso = request_json["langIso"];
      updatedata.thumbnail = request_json["thumbnail"];
      
      const messages = {
        "info": ["The process successful"],
      };

      const messagesEror = {
        "info": ["Todo is not found!"],
      };

      // //stuck disini. why ???
      // return {
      //     response_code: 202,
      //     messages: messages,
      // };

      try {
            let data = await this.InterestsRepoService.update(repoID, updatedata);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                "message": messagesEror
            });
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      this.InterestsRepoService.delete(id);

      const messages = {
        "info": ["The process successful"],
      };

      return {
          response_code: 202,
          messages: messages,
      };
    }
}
