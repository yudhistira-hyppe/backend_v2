import { Module } from '@nestjs/common';
import { StickerCategoryService } from './stickercategory.service';
import { StickerCategoryController } from './stickercategory.controller';
import { stickerCategory, stickerCategorySchema } from './schemas/stickercategory.schema';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from 'src/utils/utils.module'; 
import { OssModule } from 'src/stream/oss/oss.module';
import { MediastikerModule } from 'src/content/mediastiker/mediastiker.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UtilsModule,
    OssModule,
    MediastikerModule,
    MongooseModule.forFeature([
      { name:stickerCategory.name, schema:stickerCategorySchema }
    ], 'SERVER_FULL')
  ],
  controllers: [StickerCategoryController],
  providers: [StickerCategoryService],
  exports: [StickerCategoryService]
})
export class StickerCategoryModule {}
