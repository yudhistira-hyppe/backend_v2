import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { Challenge } from './schemas/challenge.schema';
import { OssService } from 'src/stream/oss/oss.service';

@Controller('api/challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService,
    private readonly osservices: OssService) {}

  @Post()
  create(@Body() createChallenge: CreateChallengeDto) {
    return this.challengeService.create(createChallenge);
  }

  @Post('listing')
  findAll(@Req() request: Request) {
    var page = null;
    var limit = null;
    var namachallenge = null;
    var startdate = null;
    var enddate = null;
    var objectchallenge = null;
    var statuschallenge = null;
    var caragabung = null;

    return this.challengeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.challengeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() createChallenge: CreateChallengeDto) {
    return this.challengeService.update(id, createChallenge);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.challengeService.remove(id);
  }
}
