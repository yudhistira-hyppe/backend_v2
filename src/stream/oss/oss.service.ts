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
export class OssService {
  constructor(
    private readonly configService: ConfigService
    ) { }

  getClient(){
    //---- OSS CONFIG ----
    var client = new OSS({
      accessKeyId: this.configService.get("OSS_ACCES_KEY_ID"),
      accessKeySecret: this.configService.get("OSS_ACCES_KEY_SECRET"),
      bucket: this.configService.get("OSS_BUCKET_PROFILE"),
      region: this.configService.get("OSS_REGION")
    });
    return client;
  }

  getClient2() {
    //---- OSS CONFIG ----
    var client = new OSS({
      accessKeyId: this.configService.get("OSS_PORD_ACCES_KEY_ID"),
      accessKeySecret: this.configService.get("OSS_PORD_ACCES_KEY_SECRET"),
      bucket: this.configService.get("OSS_PORD_BUCKET_PROFILE"),
      region: this.configService.get("OSS_PORD_REGION")
    });
    return client;
  }

  async uploadFile(file: Express.Multer.File, pathUpload: string) {
    //---- CREATE FILE BUFFER ----
    var buffer = file.buffer;
    try {
      //---- POST FILE OSS ----
      const result = await this.getClient().put(pathUpload, buffer);
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

  async uploadFileBuffer(file: Buffer, pathUpload: string) {
    try {
      //---- POST FILE OSS ----
      const result = await this.getClient().put(pathUpload, file);
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

  async uploadFileBuffer2(file: Buffer, pathUpload: string) {
    try {
      //---- POST FILE OSS ----
      const result = await this.getClient2().put(pathUpload, file);
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

  async readFile(pathUpload: string){
    try {
      const result = await this.getClient().get(pathUpload);
      if (result.res.status == 200) {
        return Buffer.from(result.content);
      }else{
        return null;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async readFileBase64(pathUpload: string) {
    try {
      const result = await this.getClient().get(pathUpload);
      if (result.res.status == 200) {
        return Buffer.from(result.content, 'base64');
      } else {
        return null;
      }
    } catch (e) {
      console.log(e);
    }
  }
}