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

    async updateUnUserchallenge(id: string, idSubChallenge: string, score: number) {
        this.UserchallengesModel.updateOne(
            {

                _id: new Types.ObjectId(id), idSubChallenge: idSubChallenge
            },
            { $inc: { score: -score } },
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
            },
            {
                $lookup: {
                    from: 'subChallenge',
                    localField: 'idSubChallenge',
                    foreignField: '_id',
                    as: 'subChallenge_data',

                },

            },
            {
                $project: {
                    "idChallenge": 1,
                    "idSubChallenge": 1,
                    "idUser": 1,
                    "objectChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "isActive": 1,
                    "activity": 1,
                    "history": 1,
                    "session": {
                        $arrayElemAt: ["$subChallenge_data.session", 0]
                    },

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

                $sort: { score: -1, createdAt: 1 }
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

    async listUserChallenge(idChallenge: string) {
        var pipeline = [];
        pipeline.push({
            $match: {
                "idChallenge": new Types.ObjectId(idChallenge),

            }
        },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'idUser',
                    foreignField: '_id',
                    as: 'databasic',

                },

            },
            {
                $lookup: {
                    from: 'subChallenge',
                    localField: 'idSubChallenge',
                    foreignField: '_id',
                    as: 'subChallenge_data',

                },

            },
            {
                $lookup: {
                    from: 'challenge',
                    localField: 'idChallenge',
                    foreignField: '_id',
                    as: 'Challenge_data',

                },

            },
            {
                $project: {
                    "idChallenge": 1,
                    "idUser": 1,
                    "email": {
                        $arrayElemAt: ["$databasic.email", 0]
                    },
                    "idSubChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "isActive": 1,
                    "activity": 1,
                    "history": 1,
                    "session": {
                        $arrayElemAt: ["$subChallenge_data.session", 0]
                    },
                    "nameChallenge": {
                        $arrayElemAt: ["$Challenge_data.nameChallenge", 0]
                    },
                    "notifikasiPush": {
                        $arrayElemAt: ["$Challenge_data.notifikasiPush", 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'userauths',
                    localField: 'email',
                    foreignField: 'email',
                    as: 'dataauth',

                },

            },
            {
                $project: {
                    "idChallenge": 1,
                    "idUser": 1,
                    "email": 1,
                    "idSubChallenge": 1,
                    "startDatetime": 1,
                    "endDatetime": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "isActive": 1,
                    "activity": 1,
                    "history": 1,
                    "session": 1,
                    "nameChallenge": 1,
                    "notifikasiPush": 1,
                    "username": {
                        $arrayElemAt: ["$dataauth.username", 0]
                    },

                }
            },
            {
                "$group":
                {
                    _id: {
                        idChallenge: "$idChallenge",
                        idSubChallenge: "$idSubChallenge",
                        startDatetime: "$startDatetime",
                        endDatetime: "$endDatetime",
                        session: "$session",
                        nameChallenge: "$nameChallenge",
                        notifikasiPush: "$notifikasiPush"
                    },
                    userID:
                    {
                        "$push":
                        {
                            "idUser": "$idUser",
                            "email": "$email",
                            "username": "$username"
                        }
                    }
                }
            },
            {
                "$project":
                {
                    _id: 0,
                    idChallenge: "$_id.idChallenge",
                    idSubChallenge: "$_id.idSubChallenge",
                    startDatetime: "$_id.startDatetime",
                    endDatetime: "$_id.endDatetime",
                    session: "$_id.session",
                    nameChallenge: "$_id.nameChallenge",
                    notifikasiPush: "$_id.notifikasiPush",
                    userID: 1
                }
            },

        );
        var query = await this.UserchallengesModel.aggregate(pipeline);
        return query;
    }

    async checkUserjoinchallenge(challenge:string, userid:string)
    {
        var mongo = require('mongoose');
        var konvertchallenge = mongo.Types.ObjectId(challenge);
        var konvertid = mongo.Types.ObjectId(userid);

        var query = await this.UserchallengesModel.aggregate([
            {
                "$match":
                {
                    "$and":
                    [
                        {
                            "$expr":
                            {
                                "$eq":
                                [
                                    "$idChallenge", konvertchallenge
                                ]
                            }
                        },
                        {
                            "$expr":
                            {
                                "$eq":
                                [
                                    "$idUser", konvertid
                                ]
                            }
                        }, 
                    ]
                }
            },
            {
                "$limit":1
            },
        ]);

        if(query.length == 1)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}
