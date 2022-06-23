import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAccountbalancesDto } from './dto/create-accountbalances.dto';
import { Accountbalances, AccountbalancesDocument } from './schemas/accountbalances.schema';

@Injectable()
export class AccountbalancesService {

    constructor(
        @InjectModel(Accountbalances.name, 'SERVER_TRANS')
        private readonly accountbalancesModel: Model<AccountbalancesDocument>,
    ) { }


    async findsaldo(iduser: object) {
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {
                    "iduser": iduser, "type": "withdraw"
                }
            },
            {
                "$project": {
                    totalsaldo: { $subtract: ["$kredit", "$debet"] },
                    totalpenarikan: "$debet"

                }
            }

        ]);
        return query;
    }
}
