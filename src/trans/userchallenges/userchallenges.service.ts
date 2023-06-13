import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Userchallenges, UserchallengesDocument } from './schemas/userchallenges.schema';

@Injectable()
export class UserchallengesService {

    constructor(
        @InjectModel(Userchallenges.name, 'SERVER_FULL')
        private readonly UserchallengesModel: Model<UserchallengesDocument>,
    ) { }

    async create(Userchallenges_: Userchallenges): Promise<Userchallenges> {
        const _Userchallenges_ = this.UserchallengesModel.create(Userchallenges_);
        return _Userchallenges_;
    }

    async findOne(id: string): Promise<Userchallenges> {
        return this.UserchallengesModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async find(): Promise<Userchallenges[]> {
        return this.UserchallengesModel.find().exec();
    }

    async update(id: string, Userchallenges_: Userchallenges): Promise<Userchallenges> {
        let data = await this.UserchallengesModel.findByIdAndUpdate(id, Userchallenges_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }
    async updateActionChallenge(id: string, data: {}) {
        let result = await this.UserchallengesModel.updateOne({ _id: new Types.ObjectId(id) }, { $push: { activity: data } }).exec();
        return result;
    }
    async updateUserchallenge(id: string, idSubChallenge: string, score: number) {
        this.UserchallengesModel.updateOne(
            {

                _id: new Types.ObjectId(id), idSubChallenge: idSubChallenge
            },
            { $inc: { score: score } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async delete(id: string) {
        const data = await this.UserchallengesModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }

    async userChallengebyIdChall(iduser: string, idchallenge: string) {
        var query = await this.UserchallengesModel.aggregate([

            {
                $match: {
                    "idChallenge": new Types.ObjectId(idchallenge),
                    "idUser": new Types.ObjectId(iduser),
                    "isActive": true
                }
            }
        ]);
        return query;
    }

    async datauserchall() {
        var query = await this.UserchallengesModel.aggregate([

            {
                $match: {
                    "isActive": true
                }
            },
            {

                $sort: { score: -1, createdAt: -1 }
            }
        ]);
        return query;
    }

    async datauserchallbyidchall(idchall: string, idSubChallenge: string) {
        var query = await this.UserchallengesModel.aggregate([

            {
                $match: {
                    "isActive": true,
                    "idChallenge": new Types.ObjectId(idchall),
                    "idSubChallenge": new Types.ObjectId(idSubChallenge),

                }
            },
            {

                $sort: { score: -1, createdAt: -1 }
            }
        ]);
        return query;
    }

    async updateRangking(id: string, rangking: number, updatedAt: string) {
        let data = await this.UserchallengesModel.updateOne({ "_id": new Types.ObjectId(id) },
            { $set: { "ranking": rangking, "updatedAt": updatedAt, } });
        return data;
    }

    async updateActivity(id: string, activity: any[], updatedAt: string) {
        let data = await this.UserchallengesModel.updateOne({ "_id": new Types.ObjectId(id) },
            { $set: { "activity": activity, "updatedAt": updatedAt, } });
        return data;
    }

    async updateHistory(id: string, idSubChallenge: string, data: {}) {
        let result = await this.UserchallengesModel.updateOne({ _id: new Types.ObjectId(id), idSubChallenge: new Types.ObjectId(idSubChallenge) }, { $push: { history: data } }).exec();
        return result;
    }
}
