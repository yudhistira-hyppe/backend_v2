import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';
import { Mediastreamingrequest, MediastreamingrequestDocument } from './schema/mediastreamingrequest.schema';
import { MediastreamingRequestDto } from './dto/mediastreaming.dto';
@Injectable()
export class MediastreamingrequestService {
  private readonly logger = new Logger(MediastreamingrequestService.name);
  
  constructor(
    @InjectModel(Mediastreamingrequest.name, 'SERVER_FULL')
    private readonly MediastreamingrequestModel: Model<MediastreamingrequestDocument>,
  ) {}

  async createStreamingRequest(MediastreamingRequestDto_: MediastreamingRequestDto): Promise<Mediastreamingrequest> {
    const DataSave = await this.MediastreamingrequestModel.create(MediastreamingRequestDto_);
    return DataSave;
  }
}
