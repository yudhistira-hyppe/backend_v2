import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as http from 'http';
import * as fs from 'fs';
import { join } from 'path';

var server  = process.env.SEAWEEDFS_HOST;
var port  = process.env.SEAWEEDFS_PORT;
var BaseUrl ='http://'+server+':'+port;

@Injectable()
export class MediaService {
  constructor() {}
}