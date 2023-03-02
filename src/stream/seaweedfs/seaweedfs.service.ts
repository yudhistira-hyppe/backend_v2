import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import * as https from "https";
import * as http from "http"; 
import * as url from "url";
//import path from "path";
import * as fs from 'fs';
import FormData from "form-data";
import { json } from "stream/consumers";

@Injectable()
export class SeaweedfsService {
    constructor(private readonly httpService: HttpService) { }

    async write(path: string, FormData_: FormData): Promise<any> {
        const res = await this.httpService.post('http://'+process.env.SEAWEEDFS_HOST + ':' + process.env.SEAWEEDFS_PORT + '/localrepo' + path, FormData_, {maxContentLength: Infinity,
        maxBodyLength: Infinity}).toPromise();
        console.log(res); 
        // return new Promise(function (resolve, reject) {
        //     var options = {
        //         'method': 'POST',
        //         'hostname': process.env.SEAWEEDFS_HOST,
        //         'port': process.env.SEAWEEDFS_PORT,
        //         'path': '/localrepo' + path,
        //         'headers': {
        //         }
        //     };
        //     var req = http.request(options, function (res) {
        //         let body = [];
        //         let err;
        //         //console.log(res);

        //         res.setEncoding('utf8');
        //         res.on("data", function (chunk) {
        //             //console.log(chunk);
        //             body.push(chunk);
        //         });

        //         res.on("end", function (chunk) {
        //             var json = JSON.parse(JSON.stringify(body));
        //             if (json.error) {
        //                 err.volumeId = json.volumeId;
        //                 return reject(err);
        //             } else {
        //                 return resolve(json);
        //             }
        //         });

        //         res.on("error", function (error) {
        //             return reject(err);
        //         });
        //     });
        //     var postData = JSON.parse(JSON.stringify(FormData_))._streams;
        //     req.setHeader('content-type', 'multipart/form-data; boundary=' + JSON.parse(JSON.stringify(FormData_))._boundary);
        //     req.write(JSON.stringify(postData));
        //     req.end();
        // });
    }

    async find(path: string): Promise<any> {
        return new Promise(function (resolve, reject) {
            // var options = {
            //     'method': 'GET',
            //     'hostname': process.env.SEAWEEDFS_HOST,
            //     'port': process.env.SEAWEEDFS_PORT,
            //     'path': '/localrepo' + path,
            //     'headers': {
            //     }
            // };
            var req = https.get('https://' + process.env.SEAWEEDFS_HOST + '/localrepo' + path, function (res) {
            //var req = http.request(options, function (res) {
                let body = [];
                let err;

                res.setEncoding('utf8');
                res.on("data", function (chunk) {
                    body.push(chunk);
                });

                res.on("end", function (chunk) {
                    var json = JSON.parse(JSON.stringify(body));
                    if (json.error) {
                        err.volumeId = json.volumeId;
                        return reject(err);
                    } else {
                        return resolve(json);
                    }
                });

                res.on("error", function (error) {
                    return reject(err);
                });
            });
            req.end();
        });
    }

    async read(path: string): Promise<any> {
        var data_find = await this.find(path);
        if (data_find.length > 0) {
            return new Promise(function (resolve, reject) {
                // var options = {
                //     'method': 'GET',
                //     'hostname': process.env.SEAWEEDFS_HOST,
                //     'port': process.env.SEAWEEDFS_PORT,
                //     'path': '/localrepo' + path,
                //     'headers': {
                //     },
                //     'maxRedirects': 20
                // };

                var req = https.get('https://' + process.env.SEAWEEDFS_HOST + '/localrepo' + path, function (res) {
                //var req = http.request(options, function (res) {
                        let body = [];

                    res.on("data", function (chunk) {
                        body.push(chunk);
                    });

                    res.on("end", function (chunk) {
                        return resolve(Buffer.concat(body));
                    });

                    res.on("error", function (error) {
                        return reject(error);
                    });
                });
                req.end();
            });
        } else {
            return null;
        }
    }

    async remove(path: string): Promise<any> {
        var data_find = await this.find(path);
        if (data_find.length > 0) {
            return new Promise(function (resolve, reject) {
                var options = {
                    'method': 'DELETE',
                    'hostname': process.env.SEAWEEDFS_HOST,
                    'port': process.env.SEAWEEDFS_PORT,
                    'path': '/localrepo' + path,
                    'headers': {
                    },
                    'maxRedirects': 20
                };
                var req = http.request(options, function (res) {
                    let body = [];

                    res.on('data', function (chunk) {
                        body.push(chunk)
                    });
                    res.on('end', function () {
                        return resolve(Buffer.concat(body));
                    });
                });
                req.on("error", function (err) {
                    return reject(err);
                });
                req.end();
            });
        }
    }
}