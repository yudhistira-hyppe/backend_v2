import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AwsRequest, AwsResponse } from "./dto/aws.dto";
import AWS, { Config, Rekognition, Request } from "aws-sdk";
import { SeaweedfsService } from "../seaweedfs/seaweedfs.service";

var config = new Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

@Injectable()
export class AwsService {
    constructor(private seaweedfsService: SeaweedfsService) { }

    async comparing(AwsRequest_: any): Promise<any> {
        const client = new Rekognition(config);
        var AwsResponse_ = null;
        await client.compareFaces(AwsRequest_, function (err, response) {
            if (err) {
                return err;
            } else {
                console.log(response);
                //return response;
                // response.FaceMatches.forEach(data => {
                //     AwsResponse_ = data;
                //     let position = data.Face.BoundingBox
                //     let similarity = data.Similarity
                //     console.log(`The face at: ${position.Left}, ${position.Top} matches with ${similarity} % confidence`);
                //     return data;
                // });
            }
        });
    }

    async detect(AwsRequest_: any): Promise<any> {
        const client = new Rekognition(config);
        var AwsResponse_ = null;
        client.detectFaces(AwsRequest_, function (err, response) {
            if (err) {
                console.log(err, err.stack);
            } else {
                var table = "<table><tr><th>Low</th><th>High</th></tr>";
                // show each face and build out estimated age table
                for (var i = 0; i < response.FaceDetails.length; i++) {
                    table += '<tr><td>' + response.FaceDetails[i].AgeRange.Low +
                        '</td><td>' + response.FaceDetails[i].AgeRange.High + '</td></tr>';
                }
                table += "</table>";
                document.getElementById("opResult").innerHTML = table;
            }
        });
        console.log(AwsResponse_);
        return AwsResponse_;
    }

    async test(): Promise<any>{
        return await this.seaweedfsService.read('61e6436e548ae516042f1b8e/pict/00eeed53-5c72-4736-af39-131357cdccc4/885fbead-5f80-49cf-bf8b-60401a204468_0001.jpeg', false,{});
    }
}