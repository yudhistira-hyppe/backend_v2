import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { MediaprofilepictsService } from './mediaprofilepicts.service';
import { CreateMediaprofilepictsDto } from './dto/create-mediaprofilepicts.dto';
import { Mediaprofilepicts } from './schemas/mediaprofilepicts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OssService } from 'src/stream/oss/oss.service';

@Controller('api/mediaprofilepicts')
export class MediaprofilepictsController {
    constructor(private readonly MediaprofilepictsService: MediaprofilepictsService,
      private readonly ossService: OssService) {}

    @Post()
    async create(@Body() CreateMediaprofilepictsDto: CreateMediaprofilepictsDto) {
      await this.MediaprofilepictsService.create(CreateMediaprofilepictsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Mediaprofilepicts[]> {
      return this.MediaprofilepictsService.findAll();
    }
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Mediaprofilepicts> {
      return this.MediaprofilepictsService.findOne(id);
    }
  

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.MediaprofilepictsService.delete(id);
    }

  @Post("/move/oss")
  async moveOss() {
      var OSS_path = "http://be-production.oss-ap-southeast-5.aliyuncs.com/";
      var dataProfile = await this.MediaprofilepictsService.findByOssName("be-staging");
      for (var i = 0; i < dataProfile.length; i++) {
        console.log(dataProfile[i]._id.toString());
        var mediaproofpicts_mediaBasePath = dataProfile[i].mediaBasePath.toString();
        var new_mediaproofpicts_mediaBasePath = mediaproofpicts_mediaBasePath.replace("profilepict", "profilePict");
        var mediaproofpicts_fsSourceUri = OSS_path + new_mediaproofpicts_mediaBasePath;

        var buffer_mediaproofpicts_mediaBasePath = await this.ossService.readFile(new_mediaproofpicts_mediaBasePath);
        var upload_mediaproofpicts_mediaBasePath = await this.ossService.uploadFileBuffer2(Buffer.from(buffer_mediaproofpicts_mediaBasePath), new_mediaproofpicts_mediaBasePath);
        if (dataProfile[i].mediaThumBasePath != undefined) {
          var mediaproofpicts_mediaThumBasePath = dataProfile[i].mediaThumBasePath.toString();
          var buffer_mediaproofpicts_mediaThumBasePath = await this.ossService.readFile(mediaproofpicts_mediaThumBasePath);
          var upload_mediaproofpicts_mediaBasePath = await this.ossService.uploadFileBuffer2(Buffer.from(buffer_mediaproofpicts_mediaThumBasePath), mediaproofpicts_mediaThumBasePath);
        }
        var Mediaprofilepicts_ = new Mediaprofilepicts();
        Mediaprofilepicts_.fsSourceUri = mediaproofpicts_fsSourceUri;
        Mediaprofilepicts_.fsTargetUri = mediaproofpicts_fsSourceUri;
        Mediaprofilepicts_.mediaBasePath = new_mediaproofpicts_mediaBasePath;
        await this.MediaprofilepictsService.updatebyId(dataProfile[i]._id.toString(), Mediaprofilepicts_); 
      }
    }
}
