import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { JenischallengeService } from './jenischallenge.service';
import { CreateJenischallengeDto } from './dto/create-jenischallenge.dto';
import { jenisChallenge } from './schemas/jenischallenge.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/jenischallenge')
export class JenischallengeController {
  constructor(private readonly jenischallenge: JenischallengeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createJenischallengeDto: CreateJenischallengeDto) {
    var data = await this.jenischallenge.create(createJenischallengeDto);
    
    const messages = {
      "info": ["The process successful"],
    };

    return {
        response_code: 202,
        data:createJenischallengeDto,
        messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<jenisChallenge[]> {
    return this.jenischallenge.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('listing')
  async detailfindAll(@Req() request: Request) {
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
        throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json["limit"] !== undefined) {
        limit = Number(request_json["limit"]);
    } else {
        throw new BadRequestException("Unabled to proceed, limit field is required");
    }

    var data = await this.jenischallenge.detailAll(search, page, limit);
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
  async findOne(@Param('id') id: string) {
    var data = await this.jenischallenge.findOne(id);
    const messages = {
      "info": ["The process successful"],
    };

    return {
        response_code: 202,
        data:data,
        messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() createJenischallengeDto: CreateJenischallengeDto) {
    var data = await this.jenischallenge.update(id, createJenischallengeDto);

    const messages = {
      "info": ["The process successful"],
    };

    return {
        response_code: 202,
        data:createJenischallengeDto,
        messages: messages,
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.jenischallengeService.remove(id);
  // }
}
