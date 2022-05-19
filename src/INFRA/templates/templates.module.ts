import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesService } from './Templates.service';
import { TemplatesController } from './Templates.controller';
import { ConfigModule } from '@nestjs/config';
import { Templates, TemplatesSchema } from './schemas/Templates.schema';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Templates.name, schema: TemplatesSchema }],'SERVER_INFRA')
    ],
    controllers: [TemplatesController],
    providers: [TemplatesService],
    exports: [TemplatesService],
})
export class TemplatesModule {}
