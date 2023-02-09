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
      bucket: this.configService.get("OSS_BUCKET"),
      region: this.configService.get("OSS_REGION")
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

  async readFile(pathUpload: string){
    try {
      const result = await this.getClient().getStream(pathUpload);
      console.log(pathUpload)
      console.log(result.res.status)
      console.log(JSON.parse(CircularJSON.stringify(result.stream))._readableState.buffer)
      // const blob = await result.content.blob();
      // const arrayBuffer = await blob.arrayBuffer();
      // const buffer = Buffer.from(arrayBuffer);
      // var buff = Buffer.from(JSON.stringify(result.content))
      // console.log(typeof result.content)
      // console.log(typeof buff)
      return JSON.parse(CircularJSON.stringify(result.stream))._readableState.buffer;
    } catch (e) {
      console.log(e);
    }
  }

  async readURL(url: string): Promise<any> {
    return new Promise(async function (resolve, reject) {
      let err =null;
      await fetch(url).then((response) => {
        console.log(response);
        if (response.ok) {
          return response;
        } else {
          return err;
        }
      }).then(async (response) => {
        console.log(response);
        if (response != null) {
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return resolve(buffer);
        } else {
          return resolve(err);
        }
      }).catch((error) => {
        console.log(error);
        return resolve(err);
      });
    });
  }

  async readURLBase64(url: string): Promise<any> {
    return new Promise(async function (resolve, reject) {
      let err = null;
      var response = await fetch(url).then((response) => {
        if (response.ok) {
          return response;
        } else {
          return err;
        }
      }).then(async (response) => {
        if (response != null) {
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer, 'base64');
          return resolve(buffer);
        } else {
          return resolve(err);
        }
      }).catch((error) => {
        return resolve(err);
      });
    });
  }
}