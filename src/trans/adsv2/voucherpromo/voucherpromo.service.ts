
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { VoucherPromoDto } from './dto/voucherpromo.dto';
import { VoucherPromo, VoucherPromoDocument } from './schemas/voucherpromo.schema';
import { UtilsService } from '../../../utils/utils.service';

@Injectable()
export class VoucherpromoService {
    constructor(
        @InjectModel(VoucherPromo.name, 'SERVER_FULL')
        private readonly voucherpromoModel: Model<VoucherPromoDocument>,
        private readonly utilsService: UtilsService,
    ) { }

    async create(VoucherPromoDto_: VoucherPromoDto): Promise<VoucherPromo> {
        const _VoucherPromoDto_ = await this.voucherpromoModel.create(VoucherPromoDto_);
        return _VoucherPromoDto_;
    }

    async update(_id: string, VoucherPromoDto_: VoucherPromoDto) {
        let data = await this.voucherpromoModel.findByIdAndUpdate(
            _id,
            VoucherPromoDto_,
            { new: true });
        return data;
    }

    async updateQuantity(_id: string) {
        this.voucherpromoModel.updateOne(
            {
                _id: new mongoose.Types.ObjectId(_id),
            },
            { $inc: { quantity: -1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async findOne(id: string): Promise<VoucherPromo> {
        return await this.voucherpromoModel.findOne({ _id: Object(id) }).exec();
    }

    async delete(id: string) {
        this.voucherpromoModel.deleteOne({ _id: Object(id) }).exec();
    }

    async filAll(): Promise<VoucherPromo[]> {
        return await this.voucherpromoModel.find().exec();
    }

    async find(VoucherPromoDto_: VoucherPromoDto): Promise<VoucherPromo[]> {
        return await this.voucherpromoModel.find(VoucherPromoDto_).exec();
    }

    async findByKode(VoucherPromoDto_: VoucherPromoDto): Promise<VoucherPromo> {
        return await this.voucherpromoModel.findOne(VoucherPromoDto_).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string): Promise<VoucherPromo[]> {
        var current_date = await this.utilsService.getDateTimeString();
        var perPage = pageRow, page = Math.max(0, pageNumber);
        var where = {
            $and: []
        };
        var where_and = {};
        var where_name = {};
        if (search != undefined) {
            where_name['nameVoucher'] = { $regex: search, $options: "i" };
            where['$or'].push(where_name);
        }
        where_and['status'] = true;
        where_and['quantity'] = { $gt: 0 };
        where_and['dateStart'] = { $lte: current_date };
        where_and['dateEnd'] = { $gte: current_date };
        where.$and.push(where_and);
        const query = await this.voucherpromoModel.find(where).limit(perPage).skip(perPage * page);
        return query;
    }

    async findOneActive(id: string): Promise<VoucherPromo> {
        var current_date = await this.utilsService.getDateTimeString();
        return await this.voucherpromoModel.findOne({ _id: Object(id), status: true, quantity: { $gt: 0 }, dateStart: { $lte: current_date }, dateEnd: { $gte: current_date } }).exec();
    }
}
