import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisqusDto } from './dto/create-disqus.dto';
import { Disqus, DisqusDocument } from './schemas/disqus.schema';
import { UtilsService } from '../../utils/utils.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';

@Injectable()
export class DisqusService {
  constructor(
    @InjectModel(Disqus.name, 'SERVER_FULL')
    private readonly DisqusModel: Model<DisqusDocument>,
    private utilsService: UtilsService,
    private disquslogsService: DisquslogsService,
  ) { }

  async create(CreateDisqusDto: CreateDisqusDto): Promise<Disqus> {
    const createDisqusDto = await this.DisqusModel.create(CreateDisqusDto);
    return createDisqusDto;
  }

  async findAll(): Promise<Disqus[]> {
    return this.DisqusModel.find().exec();
  }

  async findOne(email: string): Promise<Disqus> {
    return this.DisqusModel.findOne({ email: email }).exec();
  }
  async delete(id: string) {
    const deletedCat = await this.DisqusModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async deletedicuss(request: any): Promise<any> {
    const data_discus = await this.DisqusModel.findOne({ _id: request._id }).exec();
    let param_update = null;
    let data_update = null;
    if (await this.utilsService.ceckData(data_discus)) {
      if (data_discus.email != undefined) {
        if (data_discus.email == request.email) {
          param_update = {
            _id: request._id,
            email: request.email
          }
          data_update = { $set: { "mateActive": false } }
        }
      }
      if (data_discus.mate != undefined) {
        if (data_discus.mate == request.email) {
          param_update = {
            _id: request._id,
            mate: request.email
          }
          data_update = { $set: { "emailActive": false } }
        }
      }
      this.DisqusModel.updateOne(
        param_update,
        data_update,
        function (err, docs) {
          if (err) {
            //console.log(err);
          } else {
            //console.log(docs);
          }
        });
      this.disquslogsService.updateBydiscusid(request._id, request.email);

      return {
        response_code: 202,
        messages: {
          info: ['Delete Disqus successful'],
        }
      }
    } else {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Disqus not found'],
        },
      });
    }
  }

  // async finddisqus() {
  //   const query = await this.DisqusModel.aggregate([

  //     {
  //       $lookup: {
  //         from: 'disqus',
  //         localField: 'disqus.$id',
  //         foreignField: '_id',
  //         as: 'roless',
  //       },
  //     }, {
  //       $out: {
  //         db: 'hyppe_trans_db',
  //         coll: 'disqus2'
  //       }
  //     },

  //   ]);
  //   return query;
  // }
}
