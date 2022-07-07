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

    async find(path_:string): Promise<any>{
        // const file = fs.createWriteStream("file.png");
        // return new Promise(function (resolve, reject) {
        //     var req = http.request(BaseUrl+path_, res => {
        //         let body = "";

        //         res.on('data', function(chunk) {
        //             body += chunk;
        //         });
        //         res.on('end', function() {
        //            return resolve(Buffer.from(body));
        //         });
        //         res.pipe(file);
        //     });
        //     req.on("error", function (err) {
        //         return reject(err);
        //     });
        //     req.end();
        // });
        var fs = require('fs')
        var http = require('http')

        var buf=function(res,fd,i,s,buffer){
            if(i+buffer.length<s){
                fs.read(fd,buffer,0,buffer.length,i,function(e,l,b){
                    res.write(b.slice(0,l))
                    //console.log(b.toString('utf8',0,l))
                    i=i+buffer.length
                    buf(res,fd,i,s,buffer)
                })
            }
            else{
                fs.read(fd,buffer,0,buffer.length,i,function(e,l,b){
                    res.end(b.slice(0,l))
                    fs.close(fd)
                })
            }
        }
        return void buf;
        // var app = function(req,res){
        // var head={'Content-Type':'text/html; charset=UTF-8'}
        // switch(req.url.slice(-3)){
        //     case '.js':head={'Content-Type':'text/javascript'};break;
        //     case 'css':head={'Content-Type':'text/css'};break;
        //     case 'png':head={'Content-Type':'image/png'};break;
        //     case 'ico':head={'Content-Type':'image/x-icon'};break;
        //     case 'ogg':head={'Content-Type':'audio/ogg'};break;
        //     case 'ebm':head={'Content-Type':'video/webm'};break;
        // }
        // head['Transfer-Encoding']='chunked'
        // res.writeHead(200,head)
        // fs.open('.'+req.url,'r',function(err,fd){
        //         fs.fstat(fd,function(err, stats){
        //             console.log('.'+req.url+' '+stats.size+' '+head['Content-Type']+' '+head['Transfer-Encoding'])
        //             var buffer = new Buffer(100)
        //             buf(res,fd,0,stats.size,buffer)
        //         })
        //     })
        // }



        // const file = fs.createWriteStream("file.png");
        // return new Promise(function (resolve, reject) {
        //     var req = http.request(BaseUrl+path_, res => {
        //         let body = "";

        //         res.on('data', function(chunk) {
        //             //console.log(typeof chunk);
        //             //console.log(chunk);
        //             body += chunk;
        //         });
        //         res.on('end', function() {
        //             //console.log(typeof body);
        //             //console.log(body);
        //            return resolve(body);
        //         });
        //         res.pipe(file);
        //     });
        //     req.on("error", function (err) {
        //         return reject(err);
        //     });
        //     req.end();
        // });
    }
}