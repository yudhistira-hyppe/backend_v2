import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AwsRequest, AwsResponse } from "./dto/aws.dto";
const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

@Injectable()
export class AwsService {
    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) { }

    async comparing(AwsRequest_: AwsRequest): Promise<AwsResponse> {
        const client = new AWS.Rekognition();
        var AwsResponse_ = new AwsResponse();
        client.compareFaces(AwsRequest_, function (err, response) {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                response.FaceMatches.forEach(data => {
                    AwsResponse_ = data;
                    let position = data.Face.BoundingBox
                    let similarity = data.Similarity
                    console.log(`The face at: ${position.Left}, ${position.Top} matches with ${similarity} % confidence`)
                }) // for response.faceDetails
            } // if
        });
        return AwsResponse_;
    }
}