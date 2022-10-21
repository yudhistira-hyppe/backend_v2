import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisquslogsDto } from './dto/create-disquslogs.dto';
import { Disquslogs, DisquslogsDocument } from './schemas/disquslogs.schema';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';

@Injectable()
export class DisquslogsService {
  constructor(
    @InjectModel(Disquslogs.name, 'SERVER_FULL')
    private readonly DisquslogsModel: Model<DisquslogsDocument>,
    private utilsService: UtilsService,
    private errorHandler: ErrorHandler,
  ) { }

  async create(CreateDisquslogsDto: CreateDisquslogsDto): Promise<Disquslogs> {
    const createDisquslogsDto = await this.DisquslogsModel.create(
      CreateDisquslogsDto,
    );
    return createDisquslogsDto;
  }

  async findAll(): Promise<Disquslogs[]> {
    return this.DisquslogsModel.find().exec();
  }

  async findOne(id: string): Promise<Disquslogs> {
    return this.DisquslogsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.DisquslogsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async finddisquslog() {
    const query = await this.DisquslogsModel.aggregate([

      {
        $lookup: {
          from: 'disquslogs',
          localField: 'disquslogs.$id',
          foreignField: '_id',
          as: 'roless',
        },
      }, {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'disquslogs2'
        }
      },

    ]);
    return query;
  }

  async update(
    id: string,
    createDisquslogsDto: CreateDisquslogsDto,
  ): Promise<Disquslogs> {
    let data = await this.DisquslogsModel.findByIdAndUpdate(
      id,
      createDisquslogsDto,
      { new: true },
    );

    if (!data) {
      throw new Error('Todo is not found!');
    }
    return data;
  }

  async deletedicusslog(request: any): Promise<any> {
    const data_discuslog = await this.DisquslogsModel.findOne({ _id: request._id }).exec();
    if (await this.utilsService.ceckData(data_discuslog)) {
      this.DisquslogsModel.updateOne(
        { _id: request._id },
        { active: false },
        function (err, docs) {
          if (err) {
            console.log(err);
          } else {
            console.log(docs);
          }
        });

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
          info: ['Unabled to proceed, Disquslog not found'],
        },
      });
    }
  }

  async updateBydiscusid(disqusID: string, email: string) {
    if (disqusID != undefined) {
      this.DisquslogsModel.updateMany(
        {
          disqusID: disqusID,
          sender: email
        },
        { receiverActive: false }, function (err, docs) {
          if (err) {
            console.log('err' + err);
          } else {
            console.log('docs' + docs);
          }
        });
      this.DisquslogsModel.updateMany(
        {
          disqusID: disqusID,
          receiver: email
        },
        { senderActive: false }, function (err, docs) {
          if (err) {
            console.log('err' + err);
          } else {
            console.log('docs' + docs);
          }
        });
    }
  }
}
