import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AwsRequest, AwsResponse } from "./dto/aws.dto";
import AWS from 'aws-sdk';

@Injectable()
export class AwsService {
    constructor() { }

    async comparing(AwsRequest_: AwsRequest): Promise<any> {
        var config = new AWS.Config({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        const client = new AWS.Rekognition(config);
        var AwsResponse_ = null;
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
        console.log(AwsResponse_);
        return AwsResponse_;
    }
}