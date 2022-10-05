import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Userplaylist } from 'src/trans/userplaylist/schemas/userplaylist.schema';
import { Userbasic } from '../../trans/userbasics/schemas/userbasic.schema';
import { UserplaylistService } from '../../trans/userplaylist/userplaylist.service';

@Injectable()
export class PostPlaylistService {
    private readonly logger = new Logger(PostPlaylistService.name);  
  constructor(
    private playlistService: UserplaylistService,
  ) { }

  public async doGetUserPostPlaylist(body: any, headers: any, whoami: Userbasic): Promise<String[]> {
    this.logger.log('doGetUserPostPlaylist >>> start: ' + JSON.stringify(body));
    return this.playlistService.doGetUserPostPlaylist(body, headers, whoami);
  }

  public async doGetUserPostPlaylistV2(body: any, headers: any, whoami: Userbasic): Promise<Userplaylist[]> {
    this.logger.log('doGetUserPostPlaylist >>> start: ' + JSON.stringify(body));
    return this.playlistService.doGetUserPostPlaylistV2(body, headers, whoami);
  }  

}
