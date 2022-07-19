import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FileFieldsInterceptor } from "@nestjs/platform-express/multer";
import { AwsService } from './aws.service';
import { AwsRequest } from "./dto/aws.dto";


@Controller()
export class AwsController {
    constructor(private readonly awsService: AwsService) {}

    @Post('api/aws/comparing')
    async comparing(AwsRequest_: AwsRequest)  {
        const data = await this.awsService.comparing(AwsRequest_);
        console.log(data);
    }

    @Post('api/aws/comparing/upload') 
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 }
    ]))
    async uploadcomparing(@UploadedFiles() files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] }) {
        var AwsRequest_ = new AwsRequest();
        AwsRequest_.SimilarityThreshold = 70;
        AwsRequest_.SourceImage = {Bytes:files.avatar[0].path+'.jpg'};
        AwsRequest_.TargetImage = {Bytes: files.background[0].path + '.jpg'};
        const data = await this.awsService.comparing(AwsRequest_);
        console.log(data);
        //console.log(files);
    }
}