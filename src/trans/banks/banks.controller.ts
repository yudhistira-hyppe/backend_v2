import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, BadRequestException, Request, UploadedFile, UploadedFiles, Headers, UseInterceptors, Res, HttpStatus } from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBanksDto } from './dto/create-banks.dto';
import { Banks } from './schemas/banks.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OssService } from 'src/stream/oss/oss.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express/multer';

@Controller()
export class BanksController {
    constructor(private readonly banksService: BanksService,
                private readonly OssServices: OssService) { }

    @UseGuards(JwtAuthGuard)
    @Get('api/banks/all')
    async findAll() {
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.banksService.findAll();

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/banks/search')
    async findbank(@Req() request: Request) {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var bankcode = null;
        if (request_json["bankcode"] !== undefined) {
            bankcode = request_json["bankcode"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.banksService.findbankcode(bankcode);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/banks')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'icon_bank', maxCount: 1 }]))
    async create(
      @UploadedFiles() files: { 
        icon_bank?: Express.Multer.File[]
      },
    //   @Body() request,
    @Body() CreateBanksDto: CreateBanksDto,
      ) {

    //   console.log(CreateBanksDto);

      if(files.icon_bank == undefined)
      {
        throw new BadRequestException("Unabled to proceed. icon file is required");
      }
      else
      {
        var getresult = await this.banksService.create(CreateBanksDto);

        var insertfile = files.icon_bank[0];
        var getdata = getresult._id.toString();
        var path = "images/icon_bank/" + getdata + "." + insertfile.originalname.split(".")[1];
        var result = await this.OssServices.uploadFile(insertfile, path);
        CreateBanksDto.urlbankIcon = result.url;
        var id = getresult._id;
        var converttostring = id.toString();
        await this.banksService.update(converttostring, CreateBanksDto);
      }

      const messages = {
        "info": ["The process successful"],
      };

      return {
          response_code: 202,
          data: CreateBanksDto,
          messages: messages,
      };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/banks/update/:id')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'icon_bank', maxCount: 1 }]))
    async edit(
      @UploadedFiles() files: { 
        icon_bank?: Express.Multer.File[]
      },
        @Param('id') id: string,
        @Body() CreateBanksDto: CreateBanksDto,
        @Res() res
      ) {
        var id = id;
      
      if(files.icon_bank != undefined)
      {
        var insertfile = files.icon_bank[0];
        var path = "images/icon_bank/" + id + "." + insertfile.originalname.split(".")[1];
        var result = await this.OssServices.uploadFile(insertfile, path);
        CreateBanksDto.urlbankIcon = result.url;
      }

    //   console.log(CreateBanksDto);

        try {
            await this.banksService.update(id, CreateBanksDto);

            const messages = {
                "info": ["The process successful"],
            };

            return res.status(HttpStatus.OK).json({
                response_code: 202,
                data: CreateBanksDto,
                messages: messages,
            });
        } catch (e) {
            const messagesEror = {
                "info": ["Todo is not found!"],
              };

            return res.status(HttpStatus.BAD_REQUEST).json({
                "message": messagesEror
            });
        }
    }

}
