import { Injectable } from '@nestjs/common';
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

    async find(path:string): Promise<any>{
        const file = fs.createWriteStream("file.docx");
        return http.get(BaseUrl+path, response => {
  response.pipe(file);
})
        // return new Promise(function (resolve, reject) {
        //     var req = http.request(BaseUrl+path, res => {
        //         let body = "";
        //         res.setEncoding('utf8');
        //         res.on('data', function (chunk) {
        //             body += chunk;
        //         });
        //         res.on("end", function () {
        //             return resolve(Buffer.from(body));
        //         });
        //     });
        //     req.on("error", function (err) {
        //         return reject(err);
        //     });
        //     req.end();
        // });
    }
}