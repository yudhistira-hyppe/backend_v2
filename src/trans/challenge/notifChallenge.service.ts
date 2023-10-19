import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { notifChallenge, notifChallengeDocument } from './schemas/notifChallenge.schema';


@Injectable()
export class notifChallengeService {
    constructor(
        @InjectModel(notifChallenge.name, 'SERVER_FULL')
        private readonly notifChallengeModel: Model<notifChallengeDocument>,
    ) { }

    async create(notifChallenge_: notifChallenge) {
        const result = await this.notifChallengeModel.create(notifChallenge_);
        return result;
    }

    async findOne(id: string): Promise<notifChallenge> {
        return this.notifChallengeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async findChild(id: string): Promise<notifChallenge[]> {
        return this.notifChallengeModel.find({ challengeID: new Types.ObjectId(id) }).exec();
    }

    async find(): Promise<notifChallenge[]> {
        return this.notifChallengeModel.find().exec();
    }

    async update(id: string, notifChallenge_: notifChallenge): Promise<notifChallenge> {
        let data = await this.notifChallengeModel.findByIdAndUpdate(id, notifChallenge_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const data = await this.notifChallengeModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }

    async updateStatussend(id: string) {
        let data = await this.notifChallengeModel.updateOne({ "_id": id },
            {
                $set: {
                    "isSend": true,
                },

            });
        return data;
    }

    async findbyid(id: string) {
        var query = await this.notifChallengeModel.aggregate([
            {

                $match: {

                    _id: new Types.ObjectId(id)
                }
            }

        ]);
        return query;
    }

    async listnotifchallenge() {
        var pipeline = [];
        pipeline.push(
            {
                $set: {
                    "timenow":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25140000
                                ]
                            }
                        }
                    },
                    "timenowplus":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25260000
                                ]
                            }
                        }
                    }
                }
            },
            {
                "$match":
                {
                    "$and":
                        [

                            {
                                $expr:
                                {
                                    $gte:
                                        [
                                            "$timenow",

                                            "$datetime",

                                        ]
                                },

                            },
                            {
                                $expr:
                                {
                                    $eq:
                                        [
                                            "$isSend",

                                            false,

                                        ]
                                },

                            },

                        ]
                }
            },
            {
                $unwind: {
                    path: '$userID',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'challenge',
                    localField: 'challengeID',
                    foreignField: '_id',
                    as: 'challengedata',

                },

            },
            {
                $project: {
                    "idUser": "$userID.idUser",
                    "email": "$userID.email",
                    "username": "$userID.username",
                    "ranking": "$userID.ranking",
                    "title": "$userID.title",
                    "notification": "$userID.notification",
                    "titleEN": "$userID.titleEN",
                    "notificationEN": "$userID.notificationEN",
                    "challengeID": 1,
                    "subChallengeID": 1,
                    "type": 1,
                    "datetime": 1,
                    "session": 1,
                    "isSend": 1,
                    "all": 1,
                    "typeChallenge": {
                        $arrayElemAt: ['$challengedata.objectChallenge', 0]
                    },
                    timenowplus: '$timenowplus',
                    timenow: '$timenow',
                    "titleAsli": "$title",
                    "description": 1,
                }
            }
        );
        var query = await this.notifChallengeModel.aggregate(pipeline);
        return query;
    }

    async listnotifchallengeByid(id: string) {
        var pipeline = [];
        pipeline.push(
            {
                $set: {
                    "timenow":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25140000
                                ]
                            }
                        }
                    },
                    "timenowplus":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25260000
                                ]
                            }
                        }
                    }
                }
            },
            {
                "$match":
                {
                    "$and":
                        [

                            {
                                $expr:
                                {
                                    $gte:
                                        [
                                            "$timenow",

                                            "$datetime",

                                        ]
                                },

                            },
                            {
                                $expr:
                                {
                                    $eq:
                                        [
                                            "$isSend",

                                            false,

                                        ]
                                },

                            },

                        ]
                }
            },
            {
                $unwind: {
                    path: '$userID',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'challenge',
                    localField: 'challengeID',
                    foreignField: '_id',
                    as: 'challengedata',

                },

            },
            {
                $project: {
                    "idUser": "$userID.idUser",
                    "email": "$userID.email",
                    "username": "$userID.username",
                    "ranking": "$userID.ranking",
                    "title": "$userID.title",
                    "notification": "$userID.notification",
                    "titleEN": "$userID.titleEN",
                    "notificationEN": "$userID.notificationEN",
                    "challengeID": 1,
                    "subChallengeID": 1,
                    "type": 1,
                    "datetime": 1,
                    "session": 1,
                    "isSend": 1,
                    "all": 1,
                    "typeChallenge": {
                        $arrayElemAt: ['$challengedata.objectChallenge', 0]
                    },
                    timenowplus: '$timenowplus',
                    timenow: '$timenow',
                    "titleAsli": "$title",
                    "description": 1,
                }
            },
            { $match: { "_id": new Types.ObjectId(id) } }
        );
        var query = await this.notifChallengeModel.aggregate(pipeline);
        return query;
    }

    async findbyChallengeandSub(idchallenge: string, subchallenge: string) {
        var mongo = require('mongoose');
        var result = await this.notifChallengeModel.aggregate([
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                "challengeID": mongo.Types.ObjectId(idchallenge)
                            },
                            {
                                "subChallengeID": mongo.Types.ObjectId(subchallenge)
                            },
                            {
                                "isSend": false
                            },
                            {
                                "all": 1
                            },
                            {
                                "$or":
                                    [
                                        {
                                            "type": "akanDatang"
                                        },
                                        {
                                            "type": "challengeDimulai"
                                        }
                                    ]
                            }
                        ]
                }
            },
            {
                "$sort":
                {
                    "datetime": 1
                }
            },
            {
                "$limit": 2
            }
        ]);

        return result;
    }
}
