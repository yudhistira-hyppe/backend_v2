import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTemplatesRepoDto } from './dto/create-templatesrepo.dto';
import { TemplatesRepo, TemplatesRepoDocument } from './schemas/templatesrepo.schema';

@Injectable()
export class TemplatesRepoService {
  constructor(
    @InjectModel(TemplatesRepo.name, 'SERVER_INFRA')
    private readonly TemplatesRepoModel: Model<TemplatesRepoDocument>,
  ) {}

  async create(
    CreateTemplatesRepoDto: CreateTemplatesRepoDto,
  ): Promise<TemplatesRepo> {
    const createTemplatesRepoDto = await this.TemplatesRepoModel.create(
      CreateTemplatesRepoDto,
    );
    return createTemplatesRepoDto;
  }

  async findAll(): Promise<TemplatesRepo[]> {
    return this.TemplatesRepoModel.find().exec();
  }

  async findOne(id: string): Promise<TemplatesRepo> {
    return this.TemplatesRepoModel.findOne({ _id: id }).exec();
  }

  async findTemplateCreatePost(): Promise<TemplatesRepo> {
    let res = await this.TemplatesRepoModel.find().where('event', 'NOTIFY_POST').where('type', 'CREATE_POST').where('category', 'EMAIL').exec();
    if (res != undefined && res.length > 0) {
      return res[0];
    }
    return undefined;
  }  

  async findTemplateCreatePostPdf(): Promise<TemplatesRepo> {
    let res = await this.TemplatesRepoModel.find().where('event', 'NOTIFY_POST').where('type', 'CREATE_POST').where('category', 'EMAIL_PDF').exec();
    if (res != undefined && res.length > 0) {
      return res[0];
    }
    return undefined;
  }

  async findOneByTypeAndCategory(type: string, category: string): Promise<TemplatesRepo> {
    return this.TemplatesRepoModel.findOne({
      type: type,
      category: category,
    }).exec();
  }  

  async delete(id: string) {
    const deletedCat = await this.TemplatesRepoModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }
}
