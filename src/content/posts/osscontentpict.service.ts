import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { createWriteStream, unlink } from 'fs'
import * as http from "http";
import { parse } from 'path';

var co = require('co');
var OSS = require('ali-oss')
var path = require("path");
var CircularJSON = require('circular-json')

@Injectable()
export class OssContentPictService {
    constructor(
        private readonly configService: ConfigService
    ) { }

    getClient() {
        //---- OSS CONFIG ----
        var client = new OSS({
            accessKeyId: this.configService.get("OSS_PICT_ACCES_KEY_ID"),
            accessKeySecret: this.configService.get("OSS_PICT_ACCES_KEY_SECRET"),
            bucket: this.configService.get("OSS_PICT_BUCKET_PROFILE"),
            region: this.configService.get("OSS_PICT_REGION")
        });
        return client;
    }

    async uploadFileBuffer(file: Buffer, pathUpload: string) {
        try {
            //---- POST FILE OSS ----
            const result = await this.getClient().put(this.configService.get("OSS_PICT_PATH_UPLOAD") +pathUpload, file);
            console.log(result);
            return result;
        } catch (e) {
            console.log(e);
            return {
                res: {
                    status: 400,
                    statusCode: 400,
                    statusMessage: e,
                }
            }
        }
    }
}