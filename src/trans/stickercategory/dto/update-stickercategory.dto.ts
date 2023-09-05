import { PartialType } from '@nestjs/mapped-types';
import { CreateStickerCategoryDto } from './create-stickercategory.dto';

export class UpdateStickerCategoryDto extends PartialType(CreateStickerCategoryDto) {}
