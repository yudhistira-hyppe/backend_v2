import { Injectable } from '@nestjs/common';
import { AdsLogs, AdsLogsDocument } from './schema/adslog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdsLogsDto } from './dto/adslog.dto';

@Injectable()
export class AdslogsService {
    constructor(
        @InjectModel(AdsLogs.name, 'SERVER_FULL')
        private readonly AdsLogsModel: Model<AdsLogsDocument>,
    ) { }

    async create(AdsLogsDto_: AdsLogsDto): Promise<AdsLogs> {
        const _AdsLogsDto_ = await this.AdsLogsModel.create(AdsLogsDto_);
        return _AdsLogsDto_;
    }

    async getLog(Activitas: string): Promise<any> {
        let query = await this.AdsLogsModel.aggregate([
            {
                $match:
                {
                    "nameActivitas": { $in: [Activitas]}
                }
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "iduser",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            },
            { 
                $sort: { dateTime: -1 } },
            {
                $limit: 1
            },
        ]);
        return query;
    }
}
