import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuidelineService } from './guideline.service';
import { ConfigModule } from '@nestjs/config';
import { Guideline, GuidelineSchema } from './schemas/guideline.schema';
import { GuidelineController } from './guideline.controller';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';

@Module({
    imports: [
        ConfigModule.forRoot(), UserbasicnewModule,

        MongooseModule.forFeature([{ name: Guideline.name, schema: GuidelineSchema }], 'SERVER_FULL'),

    ],
    controllers: [GuidelineController],
    exports: [GuidelineService],
    providers: [GuidelineService],
})
export class GuidelineModule { }