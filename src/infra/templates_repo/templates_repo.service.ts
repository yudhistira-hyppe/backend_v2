import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTemplatesRepoDto } from './dto/create-templatesrepo.dto';
import { TemplatesRepo, TemplatesRepoDocument } from './schemas/templatesrepo.schema';

@Injectable()
export class TemplatesRepoService {
  constructor(
    @InjectModel(TemplatesRepo.name, 'SERVER_FULL')
    private readonly TemplatesRepoModel: Model<TemplatesRepoDocument>,
  ) { }

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

  async findOneByTypeAndCategoryV5(type: string, category: string): Promise<TemplatesRepo> {
    return this.TemplatesRepoModel.findOne({
      type: type,
      category: category,
    }).exec();
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

  async findByNameAndEventCategory(name: string, event: string, type:string, category: string): Promise<TemplatesRepo> {
    return this.TemplatesRepoModel.findOne({
      name: name,
      event: event,
      type:type,
      category: category
    }).exec();
  }

  async findByNameAndEventCategoryType(name: string, event: string, category: string, type: string): Promise<TemplatesRepo> {
    return this.TemplatesRepoModel.findOne({
      name: name,
      event: event,
      type: type,
      category: category
    }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.TemplatesRepoModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async updateAdsNotification(event: string, category: string, CreateTemplatesRepoDto_: CreateTemplatesRepoDto) {
    const _CreateTemplatesRepoDto_ = this.TemplatesRepoModel.findOneAndUpdate(
      { event: event, category: category },
      CreateTemplatesRepoDto_);
    return _CreateTemplatesRepoDto_;
  }

  async getAdsNotification(event: string, category: string): Promise<TemplatesRepo> {
    return await this.TemplatesRepoModel.findOne({ event: event, category: category }).exec();
  }
}
