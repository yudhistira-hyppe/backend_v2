import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesRepoService } from './templates_repo.service';
import { TemplatesRepoController } from './templates_repo.controller';
import { ConfigModule } from '@nestjs/config';
import { TemplatesRepo, TemplatesRepoSchema } from './schemas/templatesrepo.schema';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: TemplatesRepo.name, schema: TemplatesRepoSchema }], 'SERVER_FULL')
    ],
    controllers: [TemplatesRepoController],
    providers: [TemplatesRepoService],
    exports: [TemplatesRepoService],
})
export class TemplatesRepoModule { }
