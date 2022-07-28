import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { Config, Rekognition } from "aws-sdk";
import { json } from "stream/consumers";
import { SeaweedfsService } from "../seaweedfs/seaweedfs.service";

var config = new Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

@Injectable()
export class AwsService {
    constructor(private seaweedfsService: SeaweedfsService) { }

    async comparing(params: Rekognition.CompareFacesRequest): Promise<any> {
        const client = new Rekognition(config);
        return new Promise(async function (resolve, reject) {
            await client.compareFaces(params, function (err, response) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(response);
                }
            });
        });
    }

    async detect(params: Rekognition.DetectFacesRequest): Promise<any> {
        const client = new Rekognition(config);
        //console.log(JSON.stringify(params));
        return new Promise(async function (resolve, reject) {
            await client.detectFaces(params, function (err, response) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(response);
                }
            });
        });
    }

    async test(): Promise<any>{
    }
}