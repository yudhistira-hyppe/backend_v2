import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Userbasic } from 'src/trans/userbasics/schemas/userbasic.schema';
import { UserplaylistService } from 'src/trans/userplaylist/userplaylist.service';

@Injectable()
export class PostPlaylistService {
    private readonly logger = new Logger(PostPlaylistService.name);  
  constructor(
    private playlistService: UserplaylistService,
  ) { }

  public async doGetUserPostPlaylist(body: any, headers: any, whoami: Userbasic): Promise<String[]> {
    return this.playlistService.doGetUserPostPlaylist(body, headers, whoami);
  }

}
