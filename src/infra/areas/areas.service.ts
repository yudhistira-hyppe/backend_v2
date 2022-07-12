import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAreasDto } from './dto/create-areas.dto';
import { Areas, AreasDocument } from './schemas/areas.schema';

@Injectable()
export class AreasService {
  constructor(
    @InjectModel(Areas.name, 'SERVER_INFRA')
    private readonly areasModel: Model<AreasDocument>,
  ) {}

  async create(CreateAreasDto: CreateAreasDto): Promise<Areas> {
    const createAreasDto = await this.areasModel.create(CreateAreasDto);
    return createAreasDto;
  }

  async findAll(): Promise<Areas[]> {
    return this.areasModel.find().exec();
  }

  //  async findOne(id: string): Promise<Areas> {
  //   return this.areasModel.findOne({ _id: id }).exec();
  // }

  async findCriteria(countryID:string,pageNumber:number,pageRow:number,search:string) {
    var perPage = pageRow
  , page = Math.max(0, pageNumber);
    var where = {};
    if(countryID!=undefined){
      where['countryID'] = countryID;
    }
    if(search!=undefined){
      where['stateName'] = {$regex: search,  $options: "i"};
    }
    const query = await this.areasModel.find(where).limit(perPage).skip(perPage * page).sort({ stateName: 'asc' });
    return query;
  }

  async findOneName(stateName: string): Promise<Areas> {
    return this.areasModel.findOne({ stateName: stateName }).exec();
  }
  async findOne(countryID: String): Promise<Areas> {
    return this.areasModel.findOne({ countryID: countryID }).exec();
  }
  async delete(id: string) {
    const deletedCat = await this.areasModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
  async findarea(){
    const query =await this.areasModel.aggregate([
  
      {
        $lookup: {
          from: 'areas',
          localField: 'areas.$id',
          foreignField: '_id',
          as: 'roless',
        },
      },{
        $out:{
          db:'hyppe_trans_db',
          coll:'areas2'
        }
      },
     
    ]);
    return query;
  }

}
