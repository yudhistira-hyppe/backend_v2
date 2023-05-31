import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTemplatesRepoDto } from '../../../infra/templates_repo/dto/create-templatesrepo.dto';
import { TemplatesRepo, TemplatesRepoDocument } from '../../../infra/templates_repo/schemas/templatesrepo.schema';

@Injectable()
export class AdsNotificationService {
  constructor(
    @InjectModel(TemplatesRepo.name, 'SERVER_FULL')
    private readonly TemplatesRepoModel: Model<TemplatesRepoDocument>,
  ) {}

  async update(_id: string, CreateTemplatesRepoDto_: CreateTemplatesRepoDto) {
    const _CreateTemplatesRepoDto_ = this.TemplatesRepoModel.updateOne(
      { _id: Object(_id) },
      CreateTemplatesRepoDto_,
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      });
  }

  async findOne(id: string): Promise<TemplatesRepo> {
    return await this.TemplatesRepoModel.findOne({ _id: Object(id) }).exec();
  }
}
