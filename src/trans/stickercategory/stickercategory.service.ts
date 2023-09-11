import { Injectable } from '@nestjs/common';
import { CreateStickerCategoryDto } from './dto/create-stickercategory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { stickerCategory, stickerCategoryDocument } from './schemas/stickercategory.schema';
import { MediastikerService } from 'src/content/mediastiker/mediastiker.service';

@Injectable()
export class StickerCategoryService {
  constructor(
    @InjectModel(stickerCategory.name, 'SERVER_FULL')
    private readonly dataModel: Model<stickerCategoryDocument>,
    private readonly mstikService: MediastikerService
  ) { }

  async create(createStickerCategoryDto: CreateStickerCategoryDto) {
    const data = await this.dataModel.create(createStickerCategoryDto);
    return data;
  }

  async findAll(tipesticker:string, page: number, limit: number) {
    var pipeline = [];
    pipeline.push(
        {
            "$match":
            {
                "$and":
                [
                    {
                        type:tipesticker
                    },
                    {
                        active:true
                    }
                ]
            }
        },
        {
            "$sort":
            {
                createdAt:-1
            }
        }
    );

    if (page > 0) {
        pipeline.push({
            "$skip": limit * page
        });
    }

    if (limit > 0) {
        pipeline.push({
            "$limit": limit
        });
    }

    var data = await this.dataModel.aggregate(pipeline);
    return data;
  }

  async findOne(id: string, tipe:string, target: string) {
    var pipeline = [];

    pipeline.push(
        {
            "$match":
            {
                type:tipe
            }
        }
    )

    if(target == "id")
    {
        pipeline.push(
            { 
                "$match":
                {
                    _id: new Types.ObjectId(id)
                } 
            },
        );
    }
    else if(target == "name")
    {
        pipeline.push(
            { 
                "$match":
                {
                    name: id
                } 
            },
        );
    }

    pipeline.push({
      "$lookup":
      {
          from:"mediaStiker",
          as:"stiker_data",
          let:
          {
              fk_id:"$name",
              fk_type:"$type"
          },
          pipeline:
          [
            {
                "$match":
                {
                    "$and":
                    [
                        {
                            "type":"$$fk_type"
                        },
                        {
                            "$expr":
                            {
                                "$eq":
                                [
                                    "$kategori", "$$fk_id"
                                ]
                            }
                        },
                        {
                            isDelete:false
                        },
                        {
                            status:true
                        }
                    ]
                }
            },
            {
                "$sort":
                {
                    index:1
                }
            }
          ]
      }          
  })

    var data = await this.dataModel.aggregate(pipeline);

    return data[0];
  }

  async update(id: string, updateStickerCategoryDto: CreateStickerCategoryDto, updatechild: boolean) {
    let data = await this.dataModel.findByIdAndUpdate(id, updateStickerCategoryDto, { new: true });
    if (!data) {
      throw new Error('Data is not found!');
    }

    if(updatechild == true)
    {
        var convert = updateStickerCategoryDto.name;
        var converttipe = updateStickerCategoryDto.type;
        var olddata = await this.findOne(convert.toString(), converttipe.toString(), "name");
        await this.mstikService.updatedatabasedonkategori(olddata.name, convert.toString(), converttipe.toString());
    }
    return data;
  }

  async remove(id: number) {
    return `This action removes a #${id} stickerCategory`;
  }
}
