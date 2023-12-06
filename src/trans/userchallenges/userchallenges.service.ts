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

    async findData(userchallenges: Userchallenges): Promise<Userchallenges[]> {
        return this.UserchallengesModel.find(userchallenges).exec();
    }

    async updateByUSer(id: string, idSubChallenge: string, userchallenges: Userchallenges) {
        let result = await this.UserchallengesModel.updateOne({ _id: new Types.ObjectId(id), idSubChallenge: new Types.ObjectId(idSubChallenge) }, userchallenges).exec();
        return result;
    }

    async findOne(id: string): Promise<Userchallenges> {
        return this.UserchallengesModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async findOneByid(id: string, idSubChallenge: string): Promise<Userchallenges> {
        return this.UserchallengesModel.findOne({ _id: new Types.ObjectId(id), idSubChallenge: new Types.ObjectId(idSubChallenge) }).exec();
    }

    async findByChallengeandUser(challenge: string, user: string) {
        var mongo = require('mongoose');
        var data = await this.UserchallengesModel.aggregate([
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                "idChallenge": new mongo.Types.ObjectId(challenge),
                            },
                            {
                                "idUser": new mongo.Types.ObjectId(user),
                            },
                            {
                                "isActive": true
                            }
                        ]
                }
            }
        ]);

        return data;
    }

    async findByChallengeandUser2(challenge: string, user: string, idSubChallenge: string) {

        var data = await this.UserchallengesModel.aggregate([
            {
                $match: {
                    "idChallenge": new Types.ObjectId(challenge),
                    "idSubChallenge": new Types.ObjectId(idSubChallenge),
                    "idUser": new Types.ObjectId(user),
                }
            }
        ]);

        return data[0];
    }

    async findByChallengeandUser3(challenge: string, user: string, idSubChallenge: string) {

        var data = await this.UserchallengesModel.aggregate([
            // {
            //     $match: {
            //         "idChallenge": new Types.ObjectId(challenge),
            //         "idSubChallenge": new Types.ObjectId(idSubChallenge),
            //         "idUser": new Types.ObjectId(user),
            //     }
            // }
            {
                $match: {
                    idSubChallenge: new Types.ObjectId(idSubChallenge),
                }
            },
            {
                $setWindowFields: {
                    //partitionBy: "$state",
                    sortBy: {
                        score: - 1
                    },
                    output: {
                        rankNew: {
                            $documentNumber: {}
                        }
                    }
                }
            },
            {
                $match: {
                    idUser: new Types.ObjectId(user),
                }
            },
            {
                $project: {
                    ranking: "$rankNew"
                }
            }
        ]);

        return data[0];
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

    async delete(userchallenge: any[], user: string, data: Userchallenges) {
        var mongo = require('mongoose');
        return await this.UserchallengesModel.updateMany(
            {
                "_id":
                {
                    "$in": userchallenge
                },
                "idUser": mongo.Types.ObjectId(user),
            },
            {
                "$set": data
            }
        );
    }

    async userChallengebyIdChall(iduser: string, idchallenge: string) {
        var query = await this.UserchallengesModel.aggregate([


            {
                $set: {
                    "timenow":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25200000
                                ]
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    "idChallenge": new Types.ObjectId(idchallenge),
                    "idUser": new Types.ObjectId(iduser),
                    "isActive": true
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
                                            "$startDatetime",

                                        ]
                                },

                            },
                            {
                                $expr:
                                {
                                    $lte:
                                        [
                                            "$timenow",
                                            "$endDatetime",

                                        ]
                                },

                            },

                        ]
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
                    "ranking": 1,
                    "score": 1,
                    "session": {
                        $arrayElemAt: ["$subChallenge_data.session", 0]
                    },
                    "timenow": 1,

                }
            },


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
                    "ranking": 1,
                    "score": 1,
                    "rejectRemark": 1,

                }
            },

        ]);
        return query;
    }

    async updateScoreNull(id: string, updatedAt: string) {
        let data = await this.UserchallengesModel.updateOne({ "_id": new Types.ObjectId(id) },
            { $set: { "score": 0, "updatedAt": updatedAt, } });
        return data;
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

    async updateScoring(id: string, idSubChallenge: string, score: number) {
        let data = await this.UserchallengesModel.updateOne({ "_id": new Types.ObjectId(id), "idSubChallenge": new Types.ObjectId(idSubChallenge) },
            { $set: { "score": score, } });
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
                    "ranking":
                    {
                        "$ifNull":
                            [
                                "$ranking",
                                0
                            ]
                    },
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
                    "ranking": 1,
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
                        notifikasiPush: "$notifikasiPush",

                    },
                    userID:
                    {
                        "$push":
                        {
                            "idUser": "$idUser",
                            "email": "$email",
                            "username": "$username",
                            "ranking": "$ranking"
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

    async checkUserjoinchallenge(challenge: string, userid: string) {
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
                            }
                        ]
                }
            },
            {
                "$limit": 1
            },
        ]);

        return query;
    }

    async checkuserstatusjoin(target: string) {
        var mongo = require('mongoose');
        var konvertid = new mongo.Types.ObjectId(target);
        var result = await this.UserchallengesModel.aggregate([
            {
                "$match":
                {
                    "idUser": konvertid
                }
            },
            {
                "$set":
                {
                    "datenow":
                    {
                        "$dateToString":
                        {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date":
                            {
                                $add: [new Date(), + 25200000]
                            }
                        }
                    }
                }
            },
            {
                "$lookup":
                {
                    from: "challenge",
                    as: "challengedata",
                    let:
                    {
                        "fk_challenge": "$idChallenge",
                        "now": "$datenow"
                    },
                    pipeline:
                        [
                            {
                                "$addFields":
                                {
                                    "setend":
                                    {
                                        "$concat":
                                            [
                                                "$endChallenge",
                                                " ",
                                                "$startTime"
                                            ]
                                    },
                                }
                            },
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
                                                            "$_id", "$$fk_challenge"
                                                        ]
                                                }
                                            },
                                            {
                                                "$expr":
                                                {
                                                    "$eq":
                                                        [
                                                            "$statusChallenge", "PUBLISH"
                                                        ]
                                                }
                                            },
                                            {
                                                "$expr":
                                                {
                                                    "$gt":
                                                        [
                                                            "$setend", "$$now"
                                                        ]
                                                }
                                            }
                                        ]
                                }
                            }
                        ]
                }
            },
            {
                "$unwind":
                {
                    path: "$challengedata"
                }
            },
            {
                "$group":
                {
                    _id: null,
                    total:
                    {
                        "$sum": 1
                    }
                }
            },
            {
                "$project":
                {
                    _id: 0,
                    join_status:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$total", 0
                                    ]
                            },
                            then: false,
                            else: true
                        }
                    }
                }
            }
        ]);

        return result[0];
    }

    async wilayahpengguna(id: string) {
        var mongo = require('mongoose');
        var data = await this.UserchallengesModel.aggregate([
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                idChallenge: new mongo.Types.ObjectId(id)
                            },
                            {
                                isActive: true
                            }
                        ]
                }
            },
            {
                "$group":
                {
                    _id: "$idUser"
                }
            },
            {
                "$lookup":
                {
                    from: 'userbasics',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'basic_data'
                },
            },
            {
                "$project":
                {
                    state:
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$basic_data.states.$id", 0
                                        ]
                                },
                                null
                            ]
                    }
                }
            },
            {
                "$lookup":
                {
                    from: 'areas',
                    localField: 'state',
                    foreignField: '_id',
                    as: 'wilayah'
                },
            },
            {
                "$project":
                {
                    stateName:
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$wilayah.stateName", 0
                                        ]
                                },
                                "Lainnya"
                            ]
                    }
                }
            },
            {
                "$group":
                {
                    _id: "$stateName",
                    total:
                    {
                        "$sum": 1
                    }
                }
            },
            {
                "$group":
                {
                    _id: null,
                    totaldata:
                    {
                        "$sum": "$total"
                    },
                    data:
                    {
                        "$push":
                        {
                            _id: "$_id",
                            total: "$total"
                        }
                    }
                }
            },
            {
                "$unwind":
                {
                    path: "$data"
                }
            },
            {
                "$sort":
                {
                    _id: 1
                }
            },
            {
                "$project":
                {
                    _id: "$data._id",
                    //total:{}"$data.total",
                    persentase:
                    {
                        "$multiply":
                            [
                                {
                                    "$divide":
                                        [
                                            "$data.total", "$totaldata"
                                        ]
                                }, 100
                            ]
                    }
                }
            },
            {
                "$group":
                {
                    _id: "$_id",
                    persentase:
                    {
                        "$first": "$persentase"
                    }
                }
            },
            {
                "$sort":
                {
                    _id: 1
                }
            }
        ]);

        return data
    }

    async cekUserjoin(iduser: string) {
        var pipeline = [];
        pipeline.push({
            $set: {
                "timenow":
                {
                    "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                            $add: [
                                new Date(),
                                25200000
                            ]
                        }
                    }
                }
            }
        },
            {
                $match: {
                    "idUser": new Types.ObjectId(iduser),

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
                                            "$startDatetime",

                                        ]
                                },

                            },
                            {
                                $expr:
                                {
                                    $lte:
                                        [
                                            "$timenow",
                                            "$endDatetime",

                                        ]
                                },

                            },
                        ]
                }
            },);
        var query = await this.UserchallengesModel.aggregate(pipeline);
        return query;
    }

    async cekUserChalactivity(iduser: string, idevent: string) {
        var pipeline = [];
        pipeline.push({
            $set: {
                "timenow":
                {
                    "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                            $add: [
                                new Date(),
                                25200000
                            ]
                        }
                    }
                }
            }
        },
            {
                $match: {
                    "idUser": new Types.ObjectId(iduser),
                    'activity.id': idevent

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
                                            "$startDatetime",

                                        ]
                                },

                            },
                            {
                                $expr:
                                {
                                    $lte:
                                        [
                                            "$timenow",
                                            "$endDatetime",

                                        ]
                                },

                            },
                        ]
                }
            },);
        var query = await this.UserchallengesModel.aggregate(pipeline);
        return query;
    }
}
