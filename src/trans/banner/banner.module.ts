import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { UtilsModule } from '../../utils/utils.module';
import { OssModule } from 'src/stream/oss/oss.module';


@Module({


    imports: [
        OssModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }], 'SERVER_FULL')
    ],
    controllers: [BannerController],
    providers: [BannerService],
    exports: [BannerService],
})
export class BannerModule { }
