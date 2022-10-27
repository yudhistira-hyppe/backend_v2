import { Injectable, NotAcceptableException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisqusDto, DisqusResponseApps } from './dto/create-disqus.dto';
import { Disqus, DisqusDocument } from './schemas/disqus.schema';
import { UtilsService } from '../../utils/utils.service'; 
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { Userbasic } from 'src/trans/userbasics/schemas/userbasic.schema';
import { DisquscontactsService } from '../disquscontacts/disquscontacts.service';
import { Disquscontacts } from '../disquscontacts/schemas/disquscontacts.schema';

@Injectable()
export class DisqusService {

  private readonly logger = new Logger(DisqusService.name);

  constructor(
    @InjectModel(Disqus.name, 'SERVER_CONTENT')
    private readonly DisqusModel: Model<DisqusDocument>, 
    private utilsService: UtilsService,
    private disquslogsService: DisquslogsService,
    private disqconService: DisquscontactsService,
    private userService: UserbasicsService,
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

  async findById(id: string): Promise<Disqus> {
    return this.DisqusModel.findOne({ id: id }).exec();
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
    }else{
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Disqus not found'],
        },
      });
    }
  }

  async finddisqus() {
    const query = await this.DisqusModel.aggregate([

      {
        $lookup: {
          from: 'disqus',
          localField: 'disqus.$id',
          foreignField: '_id',
          as: 'roless',
        },
      }, {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'disqus2'
        }
      },

    ]);
    return query;
  }

  async findDisqusByPost(postId: string, eventType: string) {
    return await this.DisqusModel.find().where('postID', postId).where('eventType', eventType).exec();
  }

  async createDisqus(body: any, headers: any): Promise<DisqusResponseApps> {

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('createDisqus >>> profile: ' + profile);

    let res = new DisqusResponseApps();
    res.response_code = 202;

    let et = body.eventType;
    if (et != 'DIRECT_MSG' && et != 'COMMENT') {
      let inf = [];
      inf.push("Unable to proceed. Only accept DM and Comment");
      res.response_code = 204;
      return res;
    }

    let qr = body.isQuery;
    if (qr == true || qr == 'true') {
      let cts = this.queryDiscuss(body, profile);

      this.logger.log(JSON.stringify(cts));
    }
    return res;
  }  

  async queryDiscuss(body: any, whoami: Userbasic) {
    let contact : Disquscontacts[] = [];
    if (body.receiverParty != undefined) {
      contact = await this.disqconService.findDisqusByEmail(body.email);
    } else {
      contact = await this.disqconService.findByEmailAndMate(body.email, body.receiverParty);
    }

    return contact;
  }

}
