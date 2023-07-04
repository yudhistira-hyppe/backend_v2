import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateTemplatesRepoDto } from '../../../infra/templates_repo/dto/create-templatesrepo.dto';
import { TemplatesRepo, } from '../../../infra/templates_repo/schemas/templatesrepo.schema';
import { TemplatesRepoService } from '../../../infra/templates_repo/templates_repo.service';

@Injectable()
export class AdsNotificationService {
  constructor(
    private readonly TemplatesRepoService: TemplatesRepoService,
  ) {}

  async updateAdsNotification(event: string, category: string, CreateTemplatesRepoDto_: CreateTemplatesRepoDto) {
    const _CreateTemplatesRepoDto_ = await this.TemplatesRepoService.updateAdsNotification(event, category, CreateTemplatesRepoDto_);
    return _CreateTemplatesRepoDto_;
  }

  async getAdsNotification(event: string, category: string): Promise<TemplatesRepo> {
    return await this.TemplatesRepoService.getAdsNotification(event, category);
  }
}
