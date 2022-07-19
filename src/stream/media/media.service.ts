import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as http from 'http';
import * as fs from 'fs';
import { join } from 'path';

var server  = process.env.SEAWEEDFS_HOST;
var port  = process.env.SEAWEEDFS_PORT;
var BaseUrl ='http://'+server+':'+port;

@Injectable()
export class MediaService {
  constructor(
  ) {}

    async getPitch(path_:string): Promise<any>{
        return new Promise(function (resolve, reject) {
            var req = http.request(BaseUrl+path_, res => {
                let body = [];

                res.on('data', function (chunk) {
                   body.push(chunk)
                });
                res.on('end', function() {
                   return resolve(Buffer.concat(body));
                });
                //res.pipe(file);
            });
            req.on("error", function (err) {
                return reject(err);
            });
            req.end();
        });
    } 
}