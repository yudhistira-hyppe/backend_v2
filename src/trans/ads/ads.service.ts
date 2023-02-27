import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { CreateAdsDto } from './dto/create-ads.dto';
import { Ads, AdsDocument } from './schemas/ads.schema';
import { UtilsService } from '../../utils/utils.service';
import { PostsService } from '../../content/posts/posts.service';
import { PostContentService } from '../../content/posts/postcontent.service';
import { ObjectID } from 'bson';
@Injectable()
export class AdsService {
    private readonly logger = new Logger(AdsService.name);
    constructor(
        @InjectModel(Ads.name, 'SERVER_FULL')
        private readonly adsModel: Model<AdsDocument>,
        private utilService: UtilsService,
        private readonly postsService: PostsService,
        private readonly postContentService: PostContentService,
    ) { }

    async create(CreateAdsDto: CreateAdsDto): Promise<Ads> {
        let data = await this.adsModel.create(CreateAdsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
    async getapsaraDatabaseAds(obj: object, startdate: string, enddate: string) {
        let idapsara = null;
        let apsara = null;
        let apsaradefine = null;
        let idapsaradefine = null;
        let pict = null;

        var lengage = null;
        var sumage = null;
        var dataSum = [];
        var age = [];
        var wilayah = [];
        var lengwilayah = null;
        var sumwilayah = null;
        var dataSumwilayah = [];
        var datasumview = [];
        var lengview = null;
        var arrdata = [];

        var datasumclick = [];
        var lengclick = null;
        var arrdataclick = [];

        var datasumdetailgender = [];
        var lengdetailgender = null;
        var arrdatadetailgender = [];


        var date1 = new Date(startdate);
        var date2 = new Date(enddate);

        //calculate time difference  
        var time_difference = date2.getTime() - date1.getTime();

        //calculate days difference by dividing total milliseconds in a day  
        var resultTime = time_difference / (1000 * 60 * 60 * 24);
        console.log(resultTime);

        try {
            idapsara = obj[0].idApsara;
        } catch (e) {
            idapsara = "";
        }
        try {
            apsara = obj[0].apsara;
        } catch (e) {
            apsara = false;
        }
        try {
            wilayah = obj[0].wilayah;
            lengwilayah = wilayah.length;
        } catch (e) {
            wilayah = [];
            lengwilayah = 0;
        }

        try {
            datasumview = obj[0].sumview;
            lengview = datasumview.length;
        } catch (e) {
            datasumview = [];
            lengview = 0;
        }
        try {
            datasumdetailgender = obj[0].detailgender;
            lengdetailgender = datasumdetailgender.length;
        } catch (e) {
            datasumdetailgender = [];
            lengdetailgender = 0;
        }

        try {
            datasumclick = obj[0].sumclick;
            lengclick = datasumclick.length;
        } catch (e) {
            datasumclick = [];
            lengclick = 0;
        }

        try {
            age = obj[0].age;
            lengage = age.length;
        } catch (e) {
            age = [];
            lengage = 0;
        }
        if (lengage > 0) {

            for (let i = 0; i < lengage; i++) {
                sumage += age[i].count;

            }

        } else {
            sumage = 0;
        }

        if (lengage > 0) {

            for (let i = 0; i < lengage; i++) {
                let count = age[i].count;
                let id = age[i]._id;

                let persen = count * 100 / sumage;
                var objcoun = {
                    _id: id,
                    count: count,
                    persen: persen.toFixed(2)
                }
                dataSum.push(objcoun);
            }

        } else {
            dataSum = [];
        }

        if (lengwilayah > 0) {

            for (let i = 0; i < lengwilayah; i++) {
                sumwilayah += wilayah[i].count;

            }

        } else {
            sumwilayah = 0;
        }

        if (lengwilayah > 0) {

            for (let i = 0; i < lengwilayah; i++) {
                let count = wilayah[i].count;
                let id = wilayah[i]._id;

                let persen = count * 100 / sumwilayah;
                var objcounwilayah = {
                    _id: id,
                    count: count,
                    persen: persen.toFixed(2)
                }
                dataSumwilayah.push(objcounwilayah);
            }

        } else {
            dataSumwilayah = [];
        }

        if (resultTime > 0) {
            for (var i = 0; i < resultTime + 1; i++) {
                var dt = new Date(startdate);
                dt.setDate(dt.getDate() + i);
                var splitdt = dt.toISOString();
                var dts = splitdt.split('T');
                var stdt = dts[0].toString();
                var count = 0;
                for (var j = 0; j < lengview; j++) {
                    if (datasumview[j].date == stdt) {
                        count = datasumview[j].total;
                        break;
                    }
                }
                arrdata.push({
                    'date': stdt,
                    'count': count
                });

            }

        }

        if (resultTime > 0) {
            for (var i = 0; i < resultTime + 1; i++) {
                var dt = new Date(startdate);
                dt.setDate(dt.getDate() + i);
                var splitdt = dt.toISOString();
                var dts = splitdt.split('T');
                var stdt = dts[0].toString();
                var count = 0;
                for (var j = 0; j < lengclick; j++) {
                    if (datasumclick[j].date == stdt) {
                        count = datasumclick[j].total;
                        break;
                    }
                }
                arrdataclick.push({
                    'date': stdt,
                    'count': count
                });

            }

        }

        if (idapsara === undefined || idapsara === "" || idapsara === null) {
            idapsaradefine = "";
            apsaradefine = false
        } else {
            idapsaradefine = idapsara;
            apsaradefine = true
        }
        var type = obj[0].type;
        pict = [idapsara];

        if (idapsara === "") {

        } else {
            if (type === "images") {

                try {
                    obj[0].apsaraId = idapsaradefine;
                    obj[0].apsara = apsaradefine;
                    obj[0].age = dataSum;
                    obj[0].wilayah = dataSumwilayah;
                    obj[0].sumview = arrdata;
                    obj[0].sumclick = arrdataclick;

                    obj[0].media = await this.postContentService.getImageApsara(pict);
                } catch (e) {
                    obj[0].media = {};
                }
            }
            else if (type === "video") {
                try {
                    obj[0].apsaraId = idapsaradefine;
                    obj[0].apsara = apsaradefine;
                    obj[0].age = dataSum;
                    obj[0].wilayah = dataSumwilayah;
                    obj[0].sumview = arrdata;
                    obj[0].sumclick = arrdataclick;

                    obj[0].media = await this.postContentService.getVideoApsara(pict);
                } catch (e) {
                    obj[0].media = {};
                }

            }

        }

        return obj;
    }

    async getapsaraDatabaseAdsNew(obj: object, n: number) {
        let idapsara = null;
        let apsara = null;
        let apsaradefine = null;
        let idapsaradefine = null;
        let pict = null;

        try {
            idapsara = obj[n].idApsara;
        } catch (e) {
            idapsara = "";
        }
        try {
            apsara = obj[n].apsara;
        } catch (e) {
            apsara = false;
        }

        if (idapsara === undefined || idapsara === "" || idapsara === null) {
            idapsaradefine = "";
            apsaradefine = false
        } else {
            idapsaradefine = idapsara;
            apsaradefine = true
        }
        var type = obj[n].type;
        pict = [idapsara];

        if (idapsara === "") {

        } else {
            if (type === "images" || type === "image") {

                try {
                    obj[n].apsaraId = idapsaradefine;
                    obj[n].apsara = apsaradefine;
                    obj[n].media = await this.postContentService.getImageApsara(pict);
                } catch (e) {
                    obj[n].media = {};
                }
            }
            else if (type === "video" || type === "videos") {
                try {
                    obj[n].apsaraId = idapsaradefine;
                    obj[n].apsara = apsaradefine;
                    obj[n].media = await this.postContentService.getVideoApsara(pict);
                } catch (e) {
                    obj[n].media = {};
                }

            }

        }

        return obj;
    }
    async findAll(): Promise<Ads[]> {
        return this.adsModel.find().exec();

    }

    async findAllActive(): Promise<Ads[]> {
        return this.adsModel.find({ isActive: true }).exec();
    }

    async findOneActive(id: string): Promise<Ads> {
        return this.adsModel.findOne({ _id: id, isActive: true }).exec();
    }

    async findOne(id: string): Promise<Ads> {
        return this.adsModel.findOne({ _id: id }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.adsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async getAdsLanding(email: string) {
        var query = await this.adsModel.aggregate([
            {
                $set:
                {
                    email: email
                }
            },
            {
                $set:
                {
                    tay:
                    {
                        $ifNull: ['$tayang', 0]
                    }
                }
            },
            {
                $set:
                {
                    co: ["MALE", " MALE", "Laki-laki", "Pria"]
                }
            },
            {
                $set:
                {
                    ce: ["FEMALE", " FEMALE", "Perempuan", "Wanita"]
                }
            },
            {
                $set: {
                    "testDate":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [new Date(), 25200000]
                            }
                        }
                    }
                }
            },
            {
                $set: {
                    "tayang": {
                        $concat: [
                            "$liveAt",
                            " 00:00:00"
                        ]
                    }
                }
            },
            {
                "$lookup": {
                    from: "userbasics",
                    as: "userBasic",
                    let: {
                        localID: '$email'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $eq: ['$email', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                "email": 1,
                                "userInterests": 1,
                                "states": ["$states"],
                                "gender": ["$gender"],
                                "age":
                                {
                                    $cond: {
                                        if: {
                                            $and: ['$dob', {
                                                $ne: ["$dob", ""]
                                            }]
                                        },
                                        then: {
                                            $toInt: {
                                                $divide: [{
                                                    $subtract: [new Date(), {
                                                        $toDate: "$dob"
                                                    }]
                                                }, (365 * 24 * 60 * 60 * 1000)]
                                            }
                                        },
                                        else: 0
                                    }
                                },

                            }
                        }
                    ],

                }
            },
            {
                "$lookup": {
                    from: "adsplaces",
                    as: "places",
                    let: {
                        localID: '$placingID'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $eq: ['$_id', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                namePlace: 1,

                            }
                        }
                    ],

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "adsUser",
                    let: {
                        localID: '$userBasic._id'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $in: ['$userID', '$$localID']
                                        }
                                    },
                                    {
                                        "statusView": true
                                    },
                                    // {
                                    //     "isActive": false
                                    // },
                                ]
                            },

                        },
                        {
                            $project: {
                                adsID: "$adsID",
                                dodol: {
                                    $toString: "$adsID"
                                },
                                userID: 1,
                            }
                        },

                    ],

                }
            },
            {
                $addFields: {
                    "isValid": {
                        "$in": [
                            "$_id",
                            "$adsUser.adsID"
                        ]
                    }
                }
            },
            {
                $match:
                {
                    $and: [
                        {
                            "status": "APPROVE"
                        },
                        {
                            $expr: {
                                $lt: ["$totalView", "$tay"]
                            }
                        },
                        {
                            "_id": {
                                $not: {
                                    $in: ["$adsUser.adsID"]
                                }
                            }
                        },
                        {
                            isValid: false
                        },

                    ]
                }
            },
            {
                $project: {
                    isValid: 1,
                    userBasic: 1,
                    email: "$_id",
                    userAds: "$adsUser.adsID",
                    ads: [{
                        _id: "$_id",
                        ageStart: "$startAge",
                        ageEnd: "$endAge",
                        liveTypeAds: "$liveTypeAds",
                        timestamps: "$timestamp",
                        placingID: "$placingID",
                        placingName:
                        {
                            //$arrayElemAt [ "$places.namePlace",0]
                            $arrayElemAt: ['$places.namePlace', 0]
                        },
                        demografisID:
                        {
                            $cond: {
                                if: {
                                    $isArray: "$view"
                                },
                                then: "$demografisID",
                                else: ["$demografisID"],

                            }
                        },
                        interestID: "$interestID",
                        gender: "$gender",
                        liveAt: "$liveTypeAds",
                        liveTypeuserads: "$liveTypeAds",
                        typeAdsID: "$typeAdsID",
                        kelamin:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$gender', "L"]
                                },
                                then: "$co",
                                else: "$ce"
                            }
                        },

                    }]
                }
            },
            {
                "$lookup": {
                    from: "adstypes",
                    as: "types",
                    let: {
                        localID: '$ads.typeAdsID'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $in: ['$_id', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                "nameType": 1,

                            }
                        }
                    ],

                }
            },
            {
                $unwind: {
                    path: "$ads",

                }
            },
            {
                $unwind: {
                    path: "$userBasic",

                }
            },
            {
                $unwind: {
                    path: "$types",

                }
            },
            {
                $project: {
                    adsId: "$ads._id",
                    userID: "$userBasic._id",
                    liveAt: "$ads.liveAt",
                    liveTypeuserads: "$ads.liveTypeAds",
                    nameType: "$types.nameType",
                    timestamps: "$ads.timestamps",
                    placingID: "$ads.placingID",
                    placingName: "$ads.placingName",
                    createdAt:
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [new Date(), 25200000]
                            }
                        }
                    },
                    kelaminku:
                    {
                        $cond: {
                            if: {
                                $gt: [{
                                    $size: {
                                        $setIntersection: ["$ads.kelamin", "$userBasic.gender"]
                                    }
                                }, 0]
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    minat:
                    {
                        $cond: {
                            if: {
                                $gt: [{
                                    $size: {
                                        $setIntersection: ["$ads.interestID.$id", "$userBasic.userInterests.$id"]
                                    }
                                }, 0]
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    lapak:
                    {
                        $cond: {
                            if: {
                                $gt: [{
                                    $size: {
                                        $setIntersection: ["$ads.demografisID.$id", "$userBasic.states.$id"]
                                    }
                                }, 0]
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    umur:
                    {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $gte: ["$userBasic.age", "$ads.ageStart"]
                                    },
                                    {
                                        $lte: ["$userBasic.age", "$ads.ageEnd"]
                                    }
                                ]
                            },
                            then: 1,
                            else: 0,

                        }
                    },

                }
            },
            {
                $project: {

                    placingID: 1,
                    placingName: 1,
                    timestamps: 1,
                    adsId: 1,
                    userID: 1,
                    liveAt: 1,
                    liveTypeuserads: 1,
                    nameType: 1,
                    createdAt: 1,
                    kelaminku: 1,
                    minat: 1,
                    lapak: 1,
                    umur: 1,
                    priority:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHEST"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOWEST"
                                },

                            ],
                            "default": "LOWEST"
                        }
                    },
                    priorityNumber:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 6
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 2
                                },

                            ],
                            "default": 2
                        }
                    },

                }
            },
            {
                $sort: {
                    priorityNumber: - 1,
                    timestamps: 1,

                }
            },
            {
                $facet: {
                    "Content Ads": [
                        {
                            $match:
                            {
                                "nameType": "Content Ads",

                            }
                        },
                        {
                            $skip: 0
                        },
                        {
                            $limit: 1
                        },

                    ],
                    "Sponsor Ads": [
                        {
                            $match:
                            {
                                "nameType": "Sponsor Ads",

                            }
                        },
                        {
                            $skip: 0
                        },
                        {
                            $limit: 1
                        },

                    ],
                    "In App Ads": [
                        {
                            $match:
                            {
                                "nameType": "In App Ads",

                            }
                        },
                        {
                            $skip: 0
                        },
                        {
                            $limit: 1
                        },

                    ],

                }
            }
        ]);
        return query;
    }

    async findAds(email: string, nameType: string) {
        // var query = await this.adsModel.aggregate([
        //     {
        //         $set:
        //         {
        //             email: email
        //         }
        //     },
        //     {
        //         $set:
        //         {
        //             tay:
        //             {
        //                 $ifNull: ['$tayang', 0]
        //             }
        //         }
        //     },
        //     {
        //         $set: {
        //             "testDate":
        //             {
        //                 "$dateToString": {
        //                     "format": "%Y-%m-%d %H:%M:%S",
        //                     "date": {
        //                         $add: [new Date(), 25200000]
        //                     }
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $set: {
        //             "tayang": {
        //                 $concat: [
        //                     "$liveAt",
        //                     " 00:00:00"
        //                 ]
        //             }
        //         }
        //     },
        //     {
        //         $set:
        //         {
        //             co: ["MALE", " MALE", "Laki-laki", "Pria"]
        //         }
        //     },
        //     {
        //         $set:
        //         {
        //             ce: ["FEMALE", " FEMALE", "Perempuan", "Wanita"]
        //         }
        //     },
        //     {
        //         "$lookup": {
        //             from: "userbasics",
        //             as: "userBasic",
        //             let: {
        //                 localID: '$email'
        //             },
        //             pipeline: [
        //                 {
        //                     $match:
        //                     {
        //                         $expr: {
        //                             $eq: ['$email', '$$localID']
        //                         }
        //                     }
        //                 },
        //                 {
        //                     $project: {
        //                         "email": 1,
        //                         "userInterests": 1,
        //                         "states": ["$states"],
        //                         "gender": ["$gender"],
        //                         "age":
        //                         {
        //                             $cond: {
        //                                 if: {
        //                                     $and: ['$dob', {
        //                                         $ne: ["$dob", ""]
        //                                     }]
        //                                 },
        //                                 then: {
        //                                     $toInt: {
        //                                         $divide: [{
        //                                             $subtract: [new Date(), {
        //                                                 $toDate: "$dob"
        //                                             }]
        //                                         }, (365 * 24 * 60 * 60 * 1000)]
        //                                     }
        //                                 },
        //                                 else: 0
        //                             }
        //                         },

        //                     }
        //                 }
        //             ],

        //         }
        //     },
        //     {
        //         "$lookup": {
        //             from: "adsplaces",
        //             as: "places",
        //             let: {
        //                 localID: '$placingID'
        //             },
        //             pipeline: [
        //                 {
        //                     $match:
        //                     {
        //                         $expr: {
        //                             $eq: ['$_id', '$$localID']
        //                         }
        //                     }
        //                 },
        //                 {
        //                     $project: {
        //                         namePlace: 1,

        //                     }
        //                 }
        //             ],

        //         }
        //     },
        //     {
        //         "$lookup": {
        //             from: "userads",
        //             as: "adsUser",
        //             let: {
        //                 localID: '$userBasic._id'
        //             },
        //             pipeline: [
        //                 {
        //                     $match:
        //                     {
        //                         $and: [
        //                             {
        //                                 $expr: {
        //                                     $in: ['$userID', '$$localID']
        //                                 }
        //                             },
        //                             //{
        //                             //    "statusView": false
        //                             //},
        //                             {
        //                                 $or: [
        //                                     {
        //                                         "liveTypeuserads": false
        //                                     },
        //                                     //{
        //                                     //		"liveTypeAds": null
        //                                     //},
        //                                 ]
        //                             }
        //                         ]
        //                     },

        //                 },
        //                 {
        //                     $project: {
        //                         adsID: "$adsID",
        //                         dodol: {
        //                             $toString: "$adsID"
        //                         },
        //                         userID: 1,
        //                         viewed: "$viewed",

        //                     }
        //                 },

        //             ],

        //         }
        //     },
        //     {
        //         "$lookup": {
        //             from: "userads",
        //             as: "adsUser2",
        //             let: {
        //                 localID: '$userBasic._id'
        //             },
        //             pipeline: [
        //                 {
        //                     $match:
        //                     {
        //                         $and: [
        //                             {
        //                                 $expr: {
        //                                     $in: ['$userID', '$$localID']
        //                                 }
        //                             },
        //                             //{
        //                             //    "statusView": false
        //                             //},
        //                             {
        //                                 "isActive": true
        //                             },
        //                             {
        //                                 $or: [
        //                                     {
        //                                         "liveTypeuserads": true
        //                                     },
        //                                     //{
        //                                     //		"liveTypeAds": null
        //                                     //},
        //                                 ]
        //                             }
        //                         ]
        //                     },

        //                 },
        //                 {
        //                     $project: {
        //                         adsID: "$adsID",
        //                         dodol: {
        //                             $toString: "$adsID"
        //                         },
        //                         userID: 1,
        //                         viewed: "$viewed",

        //                     }
        //                 },

        //             ],

        //         }
        //     },
        //     {
        //         $addFields: {
        //             "isValid": {
        //                 "$in": [
        //                     "$_id",
        //                     "$adsUser.adsID"
        //                 ]
        //             }
        //         }
        //     },
        //     {
        //         $match:
        //         {
        //             $and: [
        //                 {
        //                     "status": "APPROVE"
        //                 },
        //                 {
        //                     $expr: {
        //                         $lt: ["$totalView", "$tay"]
        //                     }
        //                 },
        //                 {
        //                     $expr: {
        //                         $lt: ["$tayang", "$testDate"]
        //                     }
        //                 },
        //                 {
        //                     "_id": {
        //                         $not: {
        //                             $in: ["$adsUser.adsID"]
        //                         }
        //                     }
        //                 },
        //                 {
        //                     isValid: false
        //                 },
        //                 {
        //                     "isActive": true,
        //                 },

        //                 {
        //                     "reportedUser":
        //                     {
        //                         $ne: "$email"
        //                     }
        //                 },
        //             ]
        //         }
        //     },
        //     {
        //         $project: {
        //             isValid: 1,
        //             userBasic: 1,
        //             email: "$email",
        //             viewed:
        //             {
        //                 $cond: {
        //                     if: {
        //                         $in: ["$_id", "$adsUser2.adsID"]
        //                     },
        //                     then:
        //                     {
        //                         $arrayElemAt: ['$adsUser2.viewed', {
        //                             $indexOfArray: [
        //                                 "$adsUser2.adsID",
        //                                 "$_id"
        //                             ]
        //                         }]
        //                     },
        //                     else: 0
        //                 }
        //             },
        //             userAds: "$adsUser2",
        //             ads: [{
        //                 _id: "$_id",
        //                 description: "$description",
        //                 testDate: "$testDate",
        //                 tayang: "$tayang",
        //                 ageStart: "$startAge",
        //                 ageEnd: "$endAge",
        //                 placingID: "$placingID",
        //                 liveTypeAds: "$liveTypeAds",
        //                 adsUserId: "$userID",
        //                 timestamps: "$timestamp",
        //                 type: "$type",
        //                 idApsara: "$idApsara",
        //                 duration: "$duration",
        //                 urlLink: "$urlLink",
        //                 placingName:
        //                 {
        //                     $arrayElemAt: ['$places.namePlace', 0]
        //                 },
        //                 demografisID:
        //                 {
        //                     $cond: {
        //                         if: {
        //                             $isArray: "$view"
        //                         },
        //                         then: "$demografisID",
        //                         else: ["$demografisID"],

        //                     }
        //                 },
        //                 interestID: "$interestID",
        //                 gender: "$gender",
        //                 liveAt: "$liveTypeAds",
        //                 liveTypeuserads: "$liveTypeAds",
        //                 typeAdsID: "$typeAdsID",
        //                 kelamin:
        //                 {
        //                     $cond: {
        //                         if: {
        //                             $eq: ['$gender', "L"]
        //                         },
        //                         then: "$co",
        //                         else: "$ce"
        //                     }
        //                 },

        //             }]
        //         }
        //     },
        //     {
        //         "$lookup": {
        //             from: "adstypes",
        //             as: "types",
        //             let: {
        //                 localID: '$ads.typeAdsID'
        //             },
        //             pipeline: [
        //                 {
        //                     $match:
        //                     {
        //                         $expr: {
        //                             $in: ['$_id', '$$localID']
        //                         }
        //                     }
        //                 },
        //                 {
        //                     $project: {
        //                         "nameType": 1,

        //                     }
        //                 }
        //             ],

        //         }
        //     },
        //     {
        //         $unwind: {
        //             path: "$ads",

        //         }
        //     },
        //     {
        //         $unwind: {
        //             path: "$userBasic",

        //         }
        //     },
        //     {
        //         $unwind: {
        //             path: "$types",

        //         }
        //     },
        //     {
        //         $project: {
        //             viewed: "$viewed",
        //             adsId: "$ads._id",
        //             userID: "$userBasic._id",
        //             liveAt: "$ads.liveAt",
        //             description: "$ads.description",
        //             liveTypeAds: "$ads.liveTypeAds",
        //             nameType: "$types.nameType",
        //             timestamps: "$ads.timestamps",
        //             typeAdsID: "$ads.typeAdsID",
        //             adsUserId: "$ads.adsUserId",
        //             placingID: "$ads.placingID",
        //             type: "$ads.type",
        //             placingName: "$ads.placingName",
        //             idApsara: "$ads.idApsara",
        //             duration: "$ads.duration",
        //             urlLink: "$ads.urlLink",
        //             testDate: "$ads.testDate",
        //             tayang: "$ads.tayang",
        //             createdAt:
        //             {
        //                 "$dateToString": {
        //                     "format": "%Y-%m-%d %H:%M:%S",
        //                     "date": {
        //                         $add: [new Date(), 25200000]
        //                     }
        //                 }
        //             },
        //             kelaminku:
        //             {
        //                 $cond: {
        //                     if: {
        //                         $gt: [{
        //                             $size: {
        //                                 $setIntersection: ["$ads.kelamin", "$userBasic.gender"]
        //                             }
        //                         }, 0]
        //                     },
        //                     then: 1,
        //                     else: 0
        //                 }
        //             },
        //             minat:
        //             {
        //                 $cond: {
        //                     if: {
        //                         $gt: [{
        //                             $size: {
        //                                 $setIntersection: ["$ads.interestID.$id", "$userBasic.userInterests.$id"]
        //                             }
        //                         }, 0]
        //                     },
        //                     then: 1,
        //                     else: 0
        //                 }
        //             },
        //             lapak:
        //             {
        //                 $cond: {
        //                     if: {
        //                         $gt: [{
        //                             $size: {
        //                                 $setIntersection: ["$ads.demografisID.$id", "$userBasic.states.$id"]
        //                             }
        //                         }, 0]
        //                     },
        //                     then: 1,
        //                     else: 0
        //                 }
        //             },
        //             umur:
        //             {
        //                 $cond: {
        //                     if: {
        //                         $and: [
        //                             {
        //                                 $gte: ["$userBasic.age", "$ads.ageStart"]
        //                             },
        //                             {
        //                                 $lte: ["$userBasic.age", "$ads.ageEnd"]
        //                             }
        //                         ]
        //                     },
        //                     then: 1,
        //                     else: 0,

        //                 }
        //             },

        //         }
        //     },
        //     {
        //         $project: {
        //             viewed: 1,
        //             placingID: 1,
        //             placingName: 1,
        //             timestamps: 1,
        //             adsId: 1,
        //             userID: 1,
        //             liveAt: 1,
        //             liveTypeuserads: 1,
        //             nameType: 1,
        //             createdAt: 1,
        //             kelaminku: 1,
        //             minat: 1,
        //             lapak: 1,
        //             umur: 1,
        //             testDate: 1,
        //             tayang: 1,
        //             adsUserId: 1,
        //             liveTypeAds: 1,
        //             typeAdsID: 1,
        //             description: 1,
        //             type: 1,
        //             idApsara: 1,
        //             duration: 1,
        //             urlLink: 1,
        //             priority:
        //             {
        //                 $switch: {
        //                     branches: [
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "HIGHEST"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "HIGHT"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "HIGHT"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "HIGHT"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "HIGHT"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "MEDIUM"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "MEDIUM"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "MEDIUM"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "MEDIUM"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "LOW"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "LOW"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "LOW"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "LOW"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: "LOWEST"
        //                         },

        //                     ],
        //                     "default": "LOWEST"
        //                 }
        //             },
        //             priorityNumber:
        //             {
        //                 $switch: {
        //                     branches: [
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 6
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 5
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 5
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 5
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 5
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 4
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 4
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 4
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 4
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 3
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $gte: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 3
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $gte: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 3
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $gte: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 3
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $lt: ["$kelaminku", 1]
        //                                 }, {
        //                                     $lt: ["$minat", 1]
        //                                 }, {
        //                                     $lt: ["$lapak", 1]
        //                                 }, {
        //                                     $lt: ["$umur", 1]
        //                                 },]
        //                             },
        //                             then: 2
        //                         },

        //                     ],
        //                     "default": 2
        //                 }
        //             },

        //         }
        //     },
        //     {
        //         $match:
        //         {
        //             "nameType": nameType,

        //         }
        //     },
        //     {
        //         $sort: {
        //             viewed: 1,
        //             priorityNumber: - 1,
        //             timestamps: 1,

        //         }
        //     },
        //     {
        //         $skip: 0
        //     },
        //     {
        //         $limit: 1
        //     },

        // ]);
        var query = await this.adsModel.aggregate([
            {
                $set:
                {
                    email: email
                }
            },
            {
                $set:
                {
                    tay:
                    {
                        $ifNull: ['$tayang', 0]
                    }
                }
            },
            {
                $set:
                {
                    tayView:
                    {
                        $ifNull: ['$totalView', 0]
                    }
                }
            },
            {
                $set: {
                    "testDate":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [new Date(), 25200000]
                            }
                        }
                    }
                }
            },
            {
                $set: {
                    "tayang": {
                        $concat: [
                            "$liveAt",
                            " 00:00:00"
                        ]
                    }
                }
            },
            {
                $set:
                {
                    co: ["MALE", " MALE", "Laki-laki", "Pria"]
                },

            },
            {
                $set:
                {
                    ce: ["FEMALE", " FEMALE", "Perempuan", "Wanita"]
                }
            },
            {
                $set:
                {
                    all: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceOther: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "Other"]
                }
            },
            {
                $set:
                {
                    coOther: ["MALE", " MALE", "Laki-laki", "Pria", "Other"]
                }
            },
            {
                $set:
                {
                    ceCo: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria"]
                }
            },
            {
                $set:
                {
                    other: ["Other"]
                }
            },
            {
                "$lookup": {
                    from: "userbasics",
                    as: "userBasic",
                    let: {
                        localID: '$email'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $eq: ['$email', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                "email": 1,
                                "userInterests": 1,
                                "states": ["$states"],
                                "gender": ["$gender"],
                                "age":
                                {
                                    $cond: {
                                        if: {
                                            $and: ['$dob', {
                                                $ne: ["$dob", ""]
                                            }]
                                        },
                                        then: {
                                            $toInt: {
                                                $divide: [{
                                                    $subtract: [new Date(), {
                                                        $toDate: "$dob"
                                                    }]
                                                }, (365 * 24 * 60 * 60 * 1000)]
                                            }
                                        },
                                        else: 0
                                    }
                                },

                            }
                        }
                    ],

                }
            },
            {
                "$lookup": {
                    from: "adsplaces",
                    as: "places",
                    let: {
                        localID: '$placingID'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $eq: ['$_id', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                namePlace: 1,

                            }
                        }
                    ],

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "adsUser",
                    let: {
                        localID: '$userBasic._id'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $in: ['$userID', '$$localID']
                                        }
                                    },
                                    {
                                        "statusView": true
                                    },
                                    {
                                        $or: [
                                            {
                                                "liveTypeuserads": false
                                            },

                                        ]
                                    }
                                ]
                            },

                        },
                        {
                            $project: {
                                adsID: "$adsID",
                                dodol: {
                                    $toString: "$adsID"
                                },
                                userID: 1,
                                viewed: "$viewed",

                            }
                        },

                    ],

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "adsUser2",
                    let: {
                        localID: '$userBasic._id'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $in: ['$userID', '$$localID']
                                        }
                                    },
                                    //{
                                    //    "statusView": false
                                    //},
                                    {
                                        "isActive": true
                                    },
                                    {
                                        $or: [
                                            {
                                                "liveTypeuserads": true
                                            },
                                            //{
                                            //		"liveTypeAds": null
                                            //},
                                        ]
                                    }
                                ]
                            },

                        },
                        {
                            $project: {
                                adsID: "$adsID",
                                dodol: {
                                    $toString: "$adsID"
                                },
                                userID: 1,
                                viewed: "$viewed",

                            }
                        },

                    ],

                }
            },
            {
                $addFields: {
                    "isValid": {
                        "$in": [
                            "$_id",
                            "$adsUser.adsID"
                        ]
                    }
                }
            },
            {
                $match:
                {
                    $and: [
                        {
                            "status": "APPROVE"
                        },
                        {
                            $expr: {
                                $lt: ["$tayView", "$tay"]
                            }
                        },
                        {
                            $expr: {
                                $lt: ["$tayang", "$testDate"]
                            }
                        },
                        {
                            "_id": {
                                $not: {
                                    $in: ["$adsUser.adsID"]
                                }
                            }
                        },
                        {
                            isValid: false
                        },
                        {
                            "isActive": true,

                        },
                        {
                            "reportedUser":
                            {
                                $ne: "$email"
                            }
                        },

                    ]
                }
            },
            {
                $project: {
                    isValid: 1,
                    userBasic: 1,
                    email: "$email",
                    viewed:
                    {
                        $cond: {
                            if: {
                                $in: ["$_id", "$adsUser2.adsID"]
                            },
                            then:
                            {
                                $arrayElemAt: ['$adsUser2.viewed', {
                                    $indexOfArray: [
                                        "$adsUser2.adsID",
                                        "$_id"
                                    ]
                                }]
                            },
                            else: 0
                        }
                    },
                    userAds: "$adsUser2",
                    kel: "$gender",
                    ads: [{
                        _id: "$_id",
                        description: "$description",
                        testDate: "$testDate",
                        tayang: "$tayang",
                        ageStart: "$startAge",
                        ageEnd: "$endAge",
                        placingID: "$placingID",
                        liveTypeAds: "$liveTypeAds",
                        adsUserId: "$userID",
                        timestamps: "$timestamp",
                        type: "$type",
                        idApsara: "$idApsara",
                        duration: "$duration",
                        urlLink: "$urlLink",
                        placingName:
                        {
                            $arrayElemAt: ['$places.namePlace', 0]
                        },
                        demografisID:
                        {
                            $cond: {
                                if: {
                                    $isArray: "$view"
                                },
                                then: "$demografisID",
                                else: ["$demografisID"],

                            }
                        },
                        interestID: "$interestID",
                        gender: "$gender",
                        liveAt: "$liveTypeAds",
                        liveTypeuserads: "$liveTypeAds",
                        typeAdsID: "$typeAdsID",
                        kelamin:
                        {
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: ["$gender", ["P"]]
                                        },
                                        then: "$ce"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L"]]
                                        },
                                        then: "$co"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O"]]
                                        },
                                        then: "$other"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "P"]]
                                        },
                                        then: "$ceCo"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "L"]]
                                        },
                                        then: "$ceCo"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "L"]]
                                        },
                                        then: "$coOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "O"]]
                                        },
                                        then: "$coOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "O"]]
                                        },
                                        then: "$ceOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "P"]]
                                        },
                                        then: "$ceOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "P", "O"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "O", "P"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "P", "L"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "L", "P"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "L", "O"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "O", "L"]]
                                        },
                                        then: "$all"
                                    },
                                ],
                                default: "kancut"
                            }
                        },
                    }]
                }
            },
            {
                "$lookup": {
                    from: "adstypes",
                    as: "types",
                    let: {
                        localID: '$ads.typeAdsID'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $in: ['$_id', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                "nameType": 1,

                            }
                        }
                    ],
                }
            },
            {
                $unwind: {
                    path: "$ads",

                }
            },
            {
                $unwind: {
                    path: "$userBasic",

                }
            },
            {
                $unwind: {
                    path: "$types",

                }
            },
            {
                $project: {
                    viewed: "$viewed",
                    adsId: "$ads._id",
                    userID: "$userBasic._id",
                    liveAt: "$ads.liveAt",
                    description: "$ads.description",
                    liveTypeAds: "$ads.liveTypeAds",
                    nameType: "$types.nameType",
                    timestamps: "$ads.timestamps",
                    typeAdsID: "$ads.typeAdsID",
                    adsUserId: "$ads.adsUserId",
                    placingID: "$ads.placingID",
                    type: "$ads.type",
                    placingName: "$ads.placingName",
                    idApsara: "$ads.idApsara",
                    duration: "$ads.duration",
                    urlLink: "$ads.urlLink",
                    testDate: "$ads.testDate",
                    tayang: "$ads.tayang",
                    createdAt:
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [new Date(), 25200000]
                            }
                        }
                    },
                    kelaminku:
                    {
                        $cond: {
                            if: {
                                $gt: [{
                                    $size: {
                                        $setIntersection: ["$ads.kelamin", "$userBasic.gender"]
                                    }
                                }, 0]
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    minat:
                    {
                        $cond: {
                            if: {
                                $gt: [{
                                    $size: {
                                        $setIntersection: ["$ads.interestID.$id", "$userBasic.userInterests.$id"]
                                    }
                                }, 0]
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    lapak:
                    {
                        $cond: {
                            if: {
                                $gt: [{
                                    $size: {
                                        $setIntersection: ["$ads.demografisID.$id", "$userBasic.states.$id"]
                                    }
                                }, 0]
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    umur:
                    {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $gte: ["$userBasic.age", "$ads.ageStart"]
                                    },
                                    {
                                        $lte: ["$userBasic.age", "$ads.ageEnd"]
                                    }
                                ]
                            },
                            then: 1,
                            else: 0,
                        }
                    },

                }
            },
            {
                $project: {
                    viewed: 1,
                    placingID: 1,
                    placingName: 1,
                    timestamps: 1,
                    adsId: 1,
                    userID: 1,
                    liveAt: 1,
                    liveTypeuserads: 1,
                    nameType: 1,
                    createdAt: 1,
                    kelaminku: 1,
                    minat: 1,
                    lapak: 1,
                    umur: 1,
                    testDate: 1,
                    tayang: 1,
                    adsUserId: 1,
                    liveTypeAds: 1,
                    typeAdsID: 1,
                    description: 1,
                    type: 1,
                    idApsara: 1,
                    duration: 1,
                    urlLink: 1,
                    priority:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHEST"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "HIGHT"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "MEDIUM"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOW"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: "LOWEST"
                                },

                            ],
                            "default": "LOWEST"
                        }
                    },
                    priorityNumber:
                    {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 6
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 5
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 4
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $gte: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $gte: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $gte: ["$umur", 1]
                                        },]
                                    },
                                    then: 3
                                },
                                {
                                    case: {
                                        $and: [{
                                            $lt: ["$kelaminku", 1]
                                        }, {
                                            $lt: ["$minat", 1]
                                        }, {
                                            $lt: ["$lapak", 1]
                                        }, {
                                            $lt: ["$umur", 1]
                                        },]
                                    },
                                    then: 2
                                },

                            ],
                            "default": 2
                        }
                    },
                }
            },
            {
                $match:
                {
                    "nameType": nameType,
                }
            },
            {
                $sort: {
                    viewed: 1,
                    priorityNumber: - 1,
                    timestamps: 1,

                }
            },
            {
                $skip: 0
            },
            {
                $limit: 1
            },

        ]);
        return query;
    }

    async update(
        id: string,
        createAdsDto: CreateAdsDto,
    ): Promise<Ads> {
        let data = await this.adsModel.findByIdAndUpdate(
            id,
            createAdsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updateStatusView(id: Types.ObjectId, totalView: number): Promise<Object> {
        let data = await this.adsModel.updateOne({ "_id": id },
            { $set: { "totalView": totalView } });
        return data;
    }

    async updateStatusClick(id: Types.ObjectId, totalClick: number): Promise<Object> {
        let data = await this.adsModel.updateOne({ "_id": id },
            { $set: { "totalClick": totalClick } });
        return data;
    }
    async updatemediaAds(id: Types.ObjectId, mediaAds: Types.ObjectId): Promise<Object> {
        let data = await this.adsModel.updateOne({ "_id": id },
            { $set: { "mediaAds": mediaAds } });
        return data;
    }

    async updateReportuser(id: Types.ObjectId, reportedStatus: string, reportedUserCount: number, reportedUser: any[], contentModeration: boolean, contentModerationResponse: string, reportedUserHandle: any[]): Promise<Object> {
        let data = await this.adsModel.updateOne({ "_id": id },
            { $set: { "reportedStatus": reportedStatus, "reportedUserCount": reportedUserCount, "reportedUser": reportedUser, "contentModeration": contentModeration, "contentModerationResponse": contentModerationResponse, "reportedUserHandle": reportedUserHandle } });
        return data;
    }
    async adsdata(userid: Types.ObjectId, startdate: string, enddate: string, skip: number, limit: number) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        if (startdate !== undefined && enddate !== undefined) {
            const query = await this.adsModel.aggregate([


                {
                    $match: {
                        userID: userid,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                }, {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: 'mediavideosads',
                        localField: 'mediaAds',
                        foreignField: '_id',
                        as: 'mediavideos_data',

                    },

                }, {
                    $lookup: {
                        from: 'mediaimageads',
                        localField: 'mediaAds',
                        foreignField: '_id',
                        as: 'mediaimages_data',

                    },

                }, {
                    $project: {
                        mediavideos: {
                            $arrayElemAt: ['$mediavideos_data', 0]
                        },
                        mediaimages: {
                            $arrayElemAt: ['$mediaimages_data', 0]
                        },
                        user: {
                            $arrayElemAt: ['$userbasics_data', 0]
                        },
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        type: "$type",

                    }
                }, {
                    $addFields: {


                        concatmediapict: '/mediaadsfile',
                        media_pict: {
                            $replaceOne: {
                                input: "$mediaimages.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                        concatmediavideo: '/mediaadsfile/vid/',
                        concatthumbvideo: '/mediaadsfile/thumb',
                        media_video: '$mediavideos.mediaUri'
                    },

                }, {
                    $project: {

                        mediaBasePath: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaBasePath'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaBasePath'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaUri: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaUri'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaUri'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaType: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaType'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaType'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaThumbUri: {
                            $switch: {
                                branches: [

                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaThumb'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaThumb'
                                    },
                                ],
                                default: ''
                            }
                        },
                        mediaThumbEndpoint: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaThumb'
                                    },

                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': {
                                            $concat: ["$concatthumbvideo", "/", "$media_video"]
                                        },

                                    }
                                ],
                                default: ''
                            }
                        },
                        mediaEndpoint: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': {
                                            $concat: ["$concatmediapict", "/", "$media_pict"]
                                        },

                                    },

                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': {
                                            $concat: ["$concatmediavideo", "/", "$media_video"]
                                        },

                                    }
                                ],
                                default: ''
                            }
                        },
                        fullName: '$user.fullName',
                        email: '$user.email',
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',

                    }
                },
                { $sort: { timestamp: -1 }, },
                { $skip: skip },
                { $limit: limit }
            ]);
            return query;
        }

        else if (startdate === undefined && enddate === undefined) {
            const query = await this.adsModel.aggregate([


                {
                    $match: {
                        userID: userid
                    }
                }, {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $lookup: {
                        from: 'mediavideosads',
                        localField: 'mediaAds',
                        foreignField: '_id',
                        as: 'mediavideos_data',

                    },

                }, {
                    $lookup: {
                        from: 'mediaimageads',
                        localField: 'mediaAds',
                        foreignField: '_id',
                        as: 'mediaimages_data',

                    },

                }, {
                    $project: {
                        mediavideos: {
                            $arrayElemAt: ['$mediavideos_data', 0]
                        },
                        mediaimages: {
                            $arrayElemAt: ['$mediaimages_data', 0]
                        },
                        user: {
                            $arrayElemAt: ['$userbasics_data', 0]
                        },
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        type: "$type",

                    }
                }, {
                    $addFields: {


                        concatmediapict: '/mediaadsfile',
                        media_pict: {
                            $replaceOne: {
                                input: "$mediaimages.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                        concatmediavideo: '/mediaadsfile/vid/',
                        concatthumbvideo: '/mediaadsfile/thumb',
                        media_video: '$mediavideos.mediaUri'
                    },

                }, {
                    $project: {

                        mediaBasePath: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaBasePath'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaBasePath'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaUri: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaUri'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaUri'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaType: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaType'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaType'
                                    },

                                ],
                                default: ''
                            }
                        },
                        mediaThumbUri: {
                            $switch: {
                                branches: [

                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaThumb'
                                    },
                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': '$mediavideos.mediaThumb'
                                    },
                                ],
                                default: ''
                            }
                        },
                        mediaThumbEndpoint: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': '$mediaimages.mediaThumb'
                                    },

                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': {
                                            $concat: ["$concatthumbvideo", "/", "$media_video"]
                                        },

                                    }
                                ],
                                default: ''
                            }
                        },
                        mediaEndpoint: {
                            $switch: {
                                branches: [
                                    {
                                        'case': {
                                            '$eq': ['$type', 'image']
                                        },
                                        'then': {
                                            $concat: ["$concatmediapict", "/", "$media_pict"]
                                        },

                                    },

                                    {
                                        'case': {
                                            '$eq': ['$type', 'video']
                                        },
                                        'then': {
                                            $concat: ["$concatmediavideo", "/", "$media_video"]
                                        },

                                    }
                                ],
                                default: ''
                            }
                        },
                        fullName: '$user.fullName',
                        email: '$user.email',
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',

                    }
                },
                { $sort: { timestamp: -1 }, },
                { $skip: skip },
                { $limit: limit }
            ]);
            return query;
        }

    }

    async adsdatabyid(id: Types.ObjectId) {

        const query = await this.adsModel.aggregate([


            {
                $match: {
                    _id: id,

                }
            }, {
                $lookup: {
                    from: "userbasics",
                    localField: "userID",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
                $lookup: {
                    from: 'mediavideosads',
                    localField: 'mediaAds',
                    foreignField: '_id',
                    as: 'mediavideos_data',

                },

            }, {
                $lookup: {
                    from: 'mediaimageads',
                    localField: 'mediaAds',
                    foreignField: '_id',
                    as: 'mediaimages_data',

                },

            }, {
                $project: {
                    mediavideos: {
                        $arrayElemAt: ['$mediavideos_data', 0]
                    },
                    mediaimages: {
                        $arrayElemAt: ['$mediaimages_data', 0]
                    },
                    user: {
                        $arrayElemAt: ['$userbasics_data', 0]
                    },
                    timestamp: '$timestamp',
                    expiredAt: '$expiredAt',
                    gender: '$gender',
                    liveAt: '$liveAt',
                    name: '$name',
                    objectifitas: '$objectifitas',
                    status: '$status',
                    totalClick: '$totalClick',
                    totalUsedCredit: '$totalUsedCredit',
                    totalView: '$totalView',
                    urlLink: '$urlLink',
                    isActive: '$isActive',
                    type: "$type",

                }
            }, {
                $addFields: {


                    concatmediapict: '/mediaadsfile',
                    media_pict: {
                        $replaceOne: {
                            input: "$mediaimages.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },

                    concatmediavideo: '/mediaadsfile/vid/',
                    concatthumbvideo: '/mediaadsfile/thumb',
                    media_video: '$mediavideos.mediaUri'
                },

            }, {
                $project: {

                    mediaBasePath: {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': '$mediaimages.mediaBasePath'
                                },
                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': '$mediavideos.mediaBasePath'
                                },

                            ],
                            default: ''
                        }
                    },
                    mediaUri: {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': '$mediaimages.mediaUri'
                                },
                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': '$mediavideos.mediaUri'
                                },

                            ],
                            default: ''
                        }
                    },
                    mediaType: {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': '$mediaimages.mediaType'
                                },
                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': '$mediavideos.mediaType'
                                },

                            ],
                            default: ''
                        }
                    },
                    mediaThumbUri: {
                        $switch: {
                            branches: [

                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': '$mediaimages.mediaThumb'
                                },
                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': '$mediavideos.mediaThumb'
                                },
                            ],
                            default: ''
                        }
                    },
                    mediaThumbEndpoint: {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': '$mediaimages.mediaThumb'
                                },

                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': {
                                        $concat: ["$concatthumbvideo", "/", "$media_video"]
                                    },

                                }
                            ],
                            default: ''
                        }
                    },
                    mediaEndpoint: {
                        $switch: {
                            branches: [
                                {
                                    'case': {
                                        '$eq': ['$type', 'image']
                                    },
                                    'then': {
                                        $concat: ["$concatmediapict", "/", "$media_pict"]
                                    },

                                },

                                {
                                    'case': {
                                        '$eq': ['$type', 'video']
                                    },
                                    'then': {
                                        $concat: ["$concatmediavideo", "/", "$media_video"]
                                    },

                                }
                            ],
                            default: ''
                        }
                    },
                    fullName: '$user.fullName',
                    email: '$user.email',
                    timestamp: '$timestamp',
                    expiredAt: '$expiredAt',
                    gender: '$gender',
                    liveAt: '$liveAt',
                    name: '$name',
                    objectifitas: '$objectifitas',
                    status: '$status',
                    totalClick: '$totalClick',
                    totalUsedCredit: '$totalUsedCredit',
                    totalView: '$totalView',
                    urlLink: '$urlLink',
                    isActive: '$isActive',

                }
            },
        ]);
        return query;
    }


    async list(userid: ObjectID, search: string, startdate: string, enddate: string, skip: number, limit: number) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }
        var pipeline = [];
        if (userid && userid !== undefined) {
            pipeline.push({ $match: { userID: userid } });
        }
        pipeline.push(
            {
                $lookup: {
                    from: "adsplaces",
                    localField: "placingID",
                    foreignField: "_id",
                    as: "placeData"
                }
            },
            {
                $lookup: {
                    from: "adstypes",
                    localField: "typeAdsID",
                    foreignField: "_id",
                    as: "typesData"
                }
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "userID",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            },
            {
                $project: {
                    userID: 1,
                    fullName: '$user.fullName',
                    email: '$user.email',
                    timestamp: 1,
                    expiredAt: 1,
                    gender: 1,
                    liveAt: 1,
                    name: 1,
                    description: 1,
                    objectifitas: 1,
                    status: 1,
                    totalClick: 1,
                    totalUsedCredit: 1,
                    totalView: 1,
                    urlLink: 1,
                    isActive: 1,
                    namePlace: {
                        $arrayElemAt: ['$placeData.namePlace', 0]
                    },
                    nameType: {
                        $arrayElemAt: ['$typesData.nameType', 0]
                    },
                    idApsara: 1,
                    duration: 1,
                    tayang: 1,
                    type: 1
                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "view",
                    let: {
                        local_id: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                "statusClick": 1,
                                "statusView": 1,

                            }
                        },
                        {
                            $match: {


                                statusView: true
                            }
                        },
                        {
                            $group: {
                                _id: "$adsID",
                                myCount: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $project: {
                                _id: "$_id",
                                "totalView": "$myCount",

                            }
                        }
                    ],

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "click",
                    let: {
                        local_id: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                "statusClick": 1,
                                "statusView": 1,

                            }
                        },
                        {
                            $match: {


                                statusClick: true
                            }
                        },
                        {
                            $group: {
                                _id: "$adsID",
                                myCount: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $project: {
                                _id: "$_id",
                                "totalClick": "$myCount",

                            }
                        }
                    ],

                }
            },
            {
                $project: {
                    userID: 1,
                    fullName: 1,
                    email: 1,
                    timestamp: 1,
                    expiredAt: 1,
                    gender: 1,
                    liveAt: 1,
                    name: 1,
                    description: 1,
                    objectifitas: 1,
                    status: 1,
                    totalUsedCredit: 1,
                    urlLink: 1,
                    isActive: 1,
                    namePlace: 1,
                    nameType: 1,
                    idApsara: 1,
                    duration: 1,
                    tayang: 1,
                    type: 1,
                    totalView: {
                        $arrayElemAt: ['$view.totalView', 0]
                    },
                    totalClick: {
                        $arrayElemAt: ['$click.totalClick', 0]
                    },
                }
            },
        );
        pipeline.push({ $sort: { timestamp: -1 } });
        if (search && search !== undefined && search != "") {
            pipeline.push({
                $match: {
                    $or: [{
                        name: {
                            $regex: search,
                            $options: 'i'
                        },

                    }, {
                        description: {
                            $regex: search,
                            $options: 'i'
                        },

                    }],
                }
            });
        }
        if (startdate && startdate !== undefined) {
            pipeline.push({ $match: { timestamp: { $gte: startdate } } });
        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { timestamp: { $lte: dateend } } });
        }
        if (skip > 0) {
            pipeline.push({ $skip: (skip * limit) });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }

        // const util = require('util');
        // console.log(util.inspect(pipeline, false, null, true));

        let query = await this.adsModel.aggregate(pipeline);
        var data = null;
        var arrdata = [];
        let pict: String[] = [];
        var objk = {};
        var type = null;
        var idapsara = null;
        var tview = null;
        var tclick = null;
        var view = null;
        var click = null;
        for (var i = 0; i < query.length; i++) {
            try {
                idapsara = query[i].idApsara;
            } catch (e) {
                idapsara = "";
            }
            try {
                tview = query[i].totalView;
            } catch (e) {
                tview = 0;
            }
            try {
                tclick = query[i].totalClick;
            } catch (e) {
                tclick = 0;
            }

            if (tview !== undefined) {
                view = tview;
            } else {
                view = 0;
            }

            if (tclick !== undefined) {
                click = tclick;
            } else {
                click = 0;
            }


            var type = query[i].type;
            pict = [idapsara];

            if (idapsara === "") {
                data = [];
            } else {
                if (type === "image" || type === "images") {

                    try {
                        data = await this.postContentService.getImageApsara(pict);
                    } catch (e) {
                        data = [];
                    }
                }
                else if (type === "video") {
                    try {
                        data = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        data = [];
                    }

                }

            }
            objk = {
                _id: query[i]._id,
                fullName: query[i].fullName,
                email: query[i].email,
                timestamp: query[i].timestamp,
                expiredAt: query[i].expiredAt,
                gender: query[i].gender,
                liveAt: query[i].liveAt,
                name: query[i].name,
                objectifitas: query[i].objectifitas,
                status: query[i].status,
                totalClick: click,
                totalView: view,
                totalUsedCredit: query[i].totalUsedCredit,
                urlLink: query[i].urlLink,
                isActive: query[i].isActive,
                namePlace: query[i].namePlace,
                idApsara: query[i].idApsara,
                duration: query[i].duration,
                tayang: query[i].tayang,
                nameType: query[i].nameType,
                media: data
            };

            arrdata.push(objk);
        }
        return arrdata;
    }


    async listusercount(userid: ObjectID, search: string, startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }
        var pipeline = [];
        if (userid && userid !== undefined) {
            pipeline.push({ $match: { userID: userid } });
        }
        pipeline.push(

            {
                $lookup: {
                    from: "userbasics",
                    localField: "userID",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            },
            {
                $project: {
                    userID: 1,
                    fullName: '$user.fullName',
                    email: '$user.email',
                    timestamp: 1,

                }
            },


        );

        if (search && search !== undefined && search != "") {
            pipeline.push({
                $match: {
                    $or: [{
                        name: {
                            $regex: search,
                            $options: 'i'
                        },

                    }, {
                        description: {
                            $regex: search,
                            $options: 'i'
                        },

                    }],
                }
            });
        }
        if (startdate && startdate !== undefined) {
            pipeline.push({ $match: { timestamp: { $gte: startdate } } });
        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { timestamp: { $lte: dateend } } });
        }
        pipeline.push({
            "$group": {
                "_id": null,
                "count": {
                    "$sum": 1
                }
            }
        });
        let query = await this.adsModel.aggregate(pipeline);


        return query;
    }


    async listcount(userid: ObjectID, search: string, startdate: string, enddate: string): Promise<Ads[]> {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        if (search !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                        $or: [{
                            name: {
                                $regex: search,
                                $options: 'i'
                            },

                        }, {
                            description: {
                                $regex: search,
                                $options: 'i'
                            },

                        }],
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
                        },
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        type: "$type",
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


                        fullName: '$user.fullName',
                        email: '$user.email',
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },


            ]).exec();
            return query;
        }
        else if (search === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
                        },
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        type: "$type",
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


                        fullName: '$user.fullName',
                        email: '$user.email',
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },


            ]).exec();
            return query;
        }
        else if (search !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                        $or: [{
                            name: {
                                $regex: search,
                                $options: 'i'
                            },

                        }, {
                            description: {
                                $regex: search,
                                $options: 'i'
                            },

                        }],
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
                        },
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        type: "$type",
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


                        fullName: '$user.fullName',
                        email: '$user.email',
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },


            ]).exec();
            return query;
        }
        else {
            let query = await this.adsModel.aggregate([
                {
                    $match: {
                        userID: userid,
                    }
                },
                {
                    $lookup: {
                        from: "adsplaces",
                        localField: "placingID",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "userID",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                },

                {
                    $project: {

                        place: {
                            $arrayElemAt: ['$placeData', 0]
                        },
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        type: "$type",
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },

                {
                    $project: {


                        fullName: '$user.fullName',
                        email: '$user.email',
                        timestamp: '$timestamp',
                        expiredAt: '$expiredAt',
                        gender: '$gender',
                        liveAt: '$liveAt',
                        name: '$name',
                        objectifitas: '$objectifitas',
                        status: '$status',
                        totalClick: '$totalClick',
                        totalUsedCredit: '$totalUsedCredit',
                        totalView: '$totalView',
                        urlLink: '$urlLink',
                        isActive: '$isActive',
                        namePlace: '$place.namePlace',
                        idApsara: '$idApsara',
                        duration: '$duration',
                        tayang: '$tayang'
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },


            ]).exec();
            return query;
        }

    }

    async listusevoucher(userid: ObjectID, status: any[], startdate: string, enddate: string, page: number, limit: number, descending: boolean): Promise<Ads[]> {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }
        var order = null;

        if (descending === true) {
            order = -1;
        } else {
            order = 1;
        }
        if (userid !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        status: {
                            $in: status
                        },
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {

                        status: {
                            $in: status
                        },

                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        status: {
                            $in: status
                        },
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        status: {
                            $in: status
                        },
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid
                    }
                },
                {
                    $sort: {
                        timestamp: order
                    },

                },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
    }

    async listusevouchercount(userid: ObjectID, status: string, startdate: string, enddate: string): Promise<Ads[]> {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        if (userid !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        status: {
                            $in: status
                        },
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {

                        status: {
                            $in: status
                        },

                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status !== undefined && startdate === undefined && enddate === undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        status: {
                            $in: status
                        },
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid !== undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else if (userid === undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        status: {
                            $in: status
                        },
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
        else {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        "userID": userid
                    }
                },
                {
                    $sort: {
                        timestamp: - 1
                    },

                },

                {
                    $lookup: {
                        from: 'adstypes',
                        localField: 'typeAdsID',
                        foreignField: '_id',
                        as: 'tipeads',

                    },

                },
                {
                    "$lookup": {
                        from: "uservouchers",
                        as: "uservoucher",
                        let: {
                            local_id: '$userVoucherID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$_id', '$$local_id']
                                            }
                                        },

                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "vouchers",
                                    "let": {
                                        "voucherid": "$voucherID",

                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [

                                                        "$$voucherid",
                                                        "$_id"
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "voucher"
                                },

                            },

                        ],

                    }
                },
                {
                    $project: {
                        tipeads: {
                            $arrayElemAt: ['$tipeads', 0]
                        },
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        uservoucher: '$uservoucher.voucher'
                    }
                },
                {

                    $project: {
                        userID: '$userID',
                        name: '$name',
                        "status": "$status",
                        "timestamp": "$timestamp",
                        "totalUsedCredit": "$totalUsedCredit",
                        "tayang": '$tayang',
                        "usedCredit": '$usedCredit',
                        "usedCreditFree": '$usedCreditFree',
                        "creditFree": '$creditFree',
                        "creditValue": '$creditValue',
                        "totalCredit": '$totalCredit',
                        tipeads: '$tipeads.nameType',
                        uservoucher: '$uservoucher'
                    }
                },

            ]);
            return query;
        }
    }
    async updatedata(
        id: string,
        CreateAdsDto: CreateAdsDto,
    ): Promise<Ads> {
        let data = await this.adsModel.findByIdAndUpdate(
            id,
            CreateAdsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAdsIDsByEmail(email: String) {
        var pipeline = [
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'basic'
                }
            },
            {
                $match: {
                    'basic.email': email
                }
            },
            {
                $project: {
                    _id: 1
                }
            }
        ];
        // const util = require('util');
        // console.log(util.inspect(pipeline, false, null, true /* enable colors */))
        const query = await this.adsModel.aggregate(pipeline);
        var adsIds = [];
        for (var i = 0; i < query.length; i++) {
            adsIds.push(query[i]._id);
        }
        return adsIds;
    }

    async findreportads(keys: string, postType: string, startdate: string, enddate: string, page: number, limit: number, startreport: number, endreport: number, status: any[], reason: any[], descending: boolean, reasonAppeal: any[], username: string, jenis: string, email: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }
        var order = null;

        if (descending === true) {
            order = -1;
        } else {
            order = 1;
        }
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var pipeline = [];
        pipeline = [

            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'basicdata',

                }
            },
            {
                $addFields: {

                    'profilepictid': {
                        $arrayElemAt: ['$basicdata.profilePict.$id', 0]
                    },
                    'userAuth_id': { $arrayElemAt: ['$basicdata.userAuth.$id', 0] }
                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilepictid',
                    foreignField: '_id',
                    as: 'avatardata',

                }
            },
            {
                $lookup: {
                    from: 'userauths',
                    localField: 'userAuth_id',
                    foreignField: '_id',
                    as: 'userAuth_data',
                },
            },
            {
                $addFields: {
                    'avatar': {
                        $arrayElemAt: ['$avatardata', 0]
                    },
                    'basic': {
                        $arrayElemAt: ['$basicdata', 0]
                    },
                    'auth': {
                        $arrayElemAt: ['$userAuth_data', 0]
                    },

                }
            },
            {
                $lookup: {
                    from: 'adsplaces',
                    localField: 'placingID',
                    foreignField: '_id',
                    as: 'places',

                },

            },
            {
                $lookup: {
                    from: 'adstypes',
                    localField: 'typeAdsID',
                    foreignField: '_id',
                    as: 'tipeads',

                },

            },
            {
                $project: {
                    tipeads: {
                        $arrayElemAt: ['$tipeads', 0]
                    },
                    place: {
                        $arrayElemAt: ['$places', 0]
                    },
                    userID: 1,
                    email: '$basic.email',
                    fullName: '$basic.fullName',
                    username: '$auth.username',
                    idApsara: 1,
                    name: 1,
                    type: 1,
                    status: 1,
                    isActive: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUserCount: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportReasonIdLast: {
                        $last: "$reportedUser.reportReasonId"
                    },
                    reasonLast: {
                        $last: "$reportedUser.description"
                    },
                    createdAtReportLast: {
                        $last: "$reportedUser.createdAt"
                    },
                    createdAtAppealLast: {
                        $last: "$reportedUserHandle.createdAt"
                    },
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: '$avatar.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$avatar.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },

                }
            },
            {
                $addFields: {

                    concat: '/profilepict',
                    pict: {
                        $replaceOne: {
                            input: "$avatar.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },

                },

            },
            {

                $project: {
                    userID: 1,
                    email: 1,
                    fullName: 1,
                    username: 1,
                    idApsara: 1,
                    name: 1,
                    nameType: '$tipeads.nameType',
                    type: 1,
                    status: 1,
                    isActive: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUserCount: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportReasonIdLast: 1,
                    reasonLast: 1,
                    createdAtReportLast: 1,
                    createdAtAppealLast: 1,
                    place: '$place.namePlace',
                    avatar: {
                        mediaBasePath: '$profilpict.mediaBasePath',
                        mediaUri: '$profilpict.mediaUri',
                        mediaType: '$profilpict.mediaType',
                        mediaEndpoint: {
                            $concat: ["$concat", "/", "$pict"]
                        },

                    },
                    lastAppeal: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUserHandle", null]
                                }, {
                                    $eq: ["$reportedUserHandle", ""]
                                }, {
                                    $eq: ["$reportedUserHandle", []]
                                }, {
                                    $eq: ["$reportedUserHandle", "Lainnya"]
                                }]
                            },
                            then: "Lainnya",
                            else: {
                                $last: "$reportedUserHandle.reason"
                            }
                        },

                    },
                    statusLast: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUserHandle", null]
                                }, {
                                    $eq: ["$reportedUserHandle", ""]
                                }, {
                                    $eq: ["$reportedUserHandle", []]
                                }]
                            },
                            then: "BARU",
                            else: {
                                $last: "$reportedUserHandle.status"
                            }
                        },

                    },

                }
            },
            {

                $project: {
                    userID: 1,
                    email: 1,
                    fullName: 1,
                    username: 1,
                    idApsara: 1,
                    name: 1,
                    nameType: 1,
                    type: 1,
                    status: 1,
                    isActive: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUserCount: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportReasonIdLast: 1,
                    reasonLast: 1,
                    createdAtReportLast: 1,
                    createdAtAppealLast: 1,
                    place: 1,
                    avatar: 1,
                    statusLast: 1,
                    lastAppeal: 1,
                    reasonLastAppeal: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$lastAppeal", null]
                                }, {
                                    $eq: ["$lastAppeal", ""]
                                }, {
                                    $eq: ["$lastAppeal", "Lainnya"]
                                }]
                            },
                            then: "Lainnya",
                            else: {
                                $last: "$reportedUserHandle.reason"
                            }
                        },

                    },
                    reportStatusLast: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$statusLast", null]
                                }, {
                                    $eq: ["$statusLast", ""]
                                }, {
                                    $eq: ["$statusLast", []]
                                }, {
                                    $eq: ["$statusLast", "BARU"]
                                }]
                            },
                            then: "BARU",
                            else: {
                                $last: "$reportedUserHandle.status"
                            }
                        },

                    },

                }
            },

        ];
        if (jenis === "report") {
            pipeline.push(
                {
                    $match: {
                        $and: [
                            {
                                reportedUser: {
                                    $ne: null
                                }, isActive: true
                            },
                            {
                                reportedUser: {
                                    $ne: []
                                }, isActive: true
                            },

                        ]
                    }
                },

            );
        } else if (jenis === "appeal") {
            pipeline.push({
                $match: {
                    $and: [
                        {
                            reportedUserHandle: {
                                $ne: null
                            }, isActive: true
                        },
                        {
                            reportedUserHandle: {
                                $ne: []
                            }, isActive: true
                        },

                    ]
                }
            },);
        }
        if (email && email !== undefined) {
            pipeline.push({ $match: { email: email } });
        }

        if (keys && keys !== undefined) {

            pipeline.push({
                $match: {
                    name: {
                        $regex: keys,
                        $options: 'i'
                    },

                }
            },);

        }
        if (username && username !== undefined) {

            pipeline.push({
                $match: {
                    username: {
                        $regex: username,
                        $options: 'i'
                    },

                }
            },);

        }
        if (postType && postType !== undefined) {
            pipeline.push({
                $match: {
                    tipeads: {
                        $regex: postType,
                        $options: 'i'
                    },

                }
            });
        }
        if (startdate && startdate !== undefined) {
            if (jenis === "report") {
                pipeline.push({ $match: { createdAtReportLast: { "$gte": startdate } } });
            }
            else if (jenis === "appeal") {
                pipeline.push({ $match: { createdAtAppealLast: { "$gte": startdate } } });
            }
        }
        if (enddate && enddate !== undefined) {


            if (jenis === "report") {
                pipeline.push({ $match: { createdAtReportLast: { "$lte": dateend } } });
            }
            else if (jenis === "appeal") {
                pipeline.push({ $match: { createdAtAppealLast: { "$lte": dateend } } });
            }
        }
        if (startreport && startreport !== undefined) {
            pipeline.push({ $match: { reportedUserCount: { "$gte": startreport } } });
        }
        if (endreport && endreport !== undefined) {
            pipeline.push({ $match: { reportedUserCount: { "$lte": endreport } } });
        }
        if (status && status !== undefined) {

            pipeline.push(
                {
                    $match: {
                        $or: [
                            {
                                reportStatusLast: {
                                    $in: status
                                }
                            },

                        ]
                    }
                },
            );

        }
        if (reason && reason !== undefined) {

            let reasonsleng = reason.length;
            let arrayReason = [];
            for (var i = 0; i < reasonsleng; i++) {
                var id = reason[i];
                var idreason = mongoose.Types.ObjectId(id);
                arrayReason.push(idreason);
            }
            pipeline.push(
                {
                    $match: {
                        $or: [
                            {
                                reportReasonIdLast: {
                                    $in: arrayReason
                                }
                            },

                        ]
                    }
                });

        }
        if (reasonAppeal && reasonAppeal !== undefined) {

            pipeline.push(
                {
                    $match: {
                        $or: [
                            {
                                reasonLastAppeal: {
                                    $in: reasonAppeal
                                }
                            },

                        ]
                    }
                });

        }
        if (jenis === "report") {
            pipeline.push({
                $sort: {
                    createdAtReportLast: order
                },

            });
        }
        else if (jenis === "appeal") {
            pipeline.push({
                $sort: {
                    createdAtAppealLast: order
                },

            });
        }
        if (page > 0) {
            pipeline.push({ $skip: (page * limit) });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        const query = await this.adsModel.aggregate(pipeline);

        return query;
    }
    async countReason(id: Object) {
        let query = await this.adsModel.aggregate([
            {
                $match: {

                    _id: id
                }
            },
            {
                $unwind: "$reportedUser"
            },
            {
                $match: {

                    'reportedUser.active': true
                }
            },
            {
                $group: {
                    _id: "$reportedUser.description",

                    myCount: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    "myCount": "$myCount",

                }
            }

        ]);
        return query;
    }

    async detailadsreport(adsID: Object) {
        let query = await this.adsModel.aggregate([

            {
                $match: {
                    _id: adsID

                }
            },
            {
                $lookup: {
                    from: 'adsplaces',
                    localField: 'placingID',
                    foreignField: '_id',
                    as: 'places',

                },

            },
            {
                $lookup: {
                    from: "userbasics",
                    as: "basicdata",
                    let: {
                        local_id: '$userID'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$_id', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                fullName: '$fullName',
                                email: '$email',
                                isIdVerified: '$isIdVerified',
                                profilepictid: '$profilePict.$id',
                                proofpictid: '$proofPict.$id'
                            }
                        }
                    ],

                }
            },
            {
                $lookup: {
                    from: 'adstypes',
                    localField: 'typeAdsID',
                    foreignField: '_id',
                    as: 'tipeads',

                },

            },
            {
                $lookup: {
                    from: "interests_repo",
                    as: "interest",
                    let: {
                        local_id: '$interestID.$id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $in: ['$_id', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                interestName: '$interestName'
                            }
                        }
                    ],

                }
            },
            {
                $project: {
                    tipeads: {
                        $arrayElemAt: ['$tipeads', 0]
                    },
                    place: {
                        $arrayElemAt: ['$places', 0]
                    },
                    basic: {
                        $arrayElemAt: ['$basicdata', 0]
                    },
                    userID: 1,
                    idApsara: 1,
                    name: 1,
                    type: 1,
                    status: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUserCount: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    interest: 1,
                    createdAtReportLast: {
                        $last: "$reportedUser.createdAt"
                    },
                    createdAtAppealLast: {
                        $last: "$reportedUserHandle.createdAt"
                    },
                    reportReasonIdLast: {
                        $last: "$reportedUser.reportReasonId"
                    },
                    reasonLast: {
                        $last: "$reportedUser.description"
                    },

                }
            },
            {

                $project: {

                    userID: 1,
                    idApsara: 1,
                    name: 1,
                    nameType: '$tipeads.nameType',
                    type: 1,
                    status: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportedUserCount: 1,
                    place: '$place.namePlace',
                    lastReasonReport: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUser", null]
                                }, {
                                    $eq: ["$reportedUser", ""]
                                }, {
                                    $eq: ["$reportedUser", []]
                                },]
                            },
                            then: "Lainnya",
                            else: {
                                $last: "$reportedUser.description"
                            }
                        },

                    },
                    lastAppeal: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUserHandle", null]
                                }, {
                                    $eq: ["$reportedUserHandle", ""]
                                }, {
                                    $eq: ["$reportedUserHandle", []]
                                },]
                            },
                            then: "Lainnya",
                            else: {
                                $last: "$reportedUserHandle.reason"
                            }
                        },

                    },
                    lastAppealAdmin: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUserHandle", null]
                                }, {
                                    $eq: ["$reportedUserHandle", ""]
                                }, {
                                    $eq: ["$reportedUserHandle", []]
                                },]
                            },
                            then: "Lainnya",
                            else: {
                                $last: "$reportedUserHandle.reasonAdmin"
                            }
                        },

                    },
                    createdAtReportLast: 1,
                    createdAtAppealLast: 1,
                    statusLast: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUserHandle", null]
                                }, {
                                    $eq: ["$reportedUserHandle", ""]
                                }, {
                                    $eq: ["$reportedUserHandle", []]
                                }]
                            },
                            then: "BARU",
                            else: {
                                $last: "$reportedUserHandle.status"
                            }
                        },

                    },
                    interest: 1,
                    fullName: '$basic.fullName',
                    email: '$basic.email',
                    isIdVerified: '$basic.isIdVerified',
                    profilepictid: '$basic.profilepictid',
                    proofpictid: '$basic.proofpictid',

                }
            },
            {
                $lookup: {
                    from: 'mediaprofilepicts',
                    localField: 'profilepictid',
                    foreignField: '_id',
                    as: 'avatardata',

                }
            },
            {
                "$lookup": {
                    from: "mediaproofpicts",
                    as: "proofpict",
                    let: {
                        local_id: '$proofpictid'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$_id', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                createdAt: '$createdAt',
                                nama: '$nama'
                            }
                        }
                    ],

                }
            },
            {

                $project: {

                    userID: 1,
                    idApsara: 1,
                    name: 1,
                    nameType: 1,
                    type: 1,
                    status: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportedUserCount: 1,
                    place: 1,
                    statusLast: 1,
                    createdAtReportLast: 1,
                    createdAtAppealLast: 1,
                    lastAppeal: 1,
                    lastAppealAdmin: 1,
                    lastReasonReport: 1,
                    reasonLastReport: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$lastReasonReport", null]
                                }, {
                                    $eq: ["$lastReasonReport", ""]
                                }, {
                                    $eq: ["$lastReasonReport", "Lainnya"]
                                }]
                            },
                            then: "Lainnya",
                            else: {
                                $last: "$reportedUser.description"
                            }
                        },

                    },
                    reasonLastAppeal: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$lastAppeal", null]
                                }, {
                                    $eq: ["$lastAppeal", ""]
                                }, {
                                    $eq: ["$lastAppeal", "Lainnya"]
                                }]
                            },
                            then: "Lainnya",
                            else: {
                                $last: "$reportedUserHandle.reason"
                            }
                        },

                    },
                    reasonLastAppealAdmin: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$lastAppealAdmin", null]
                                }, {
                                    $eq: ["$lastAppealAdmin", ""]
                                }, {
                                    $eq: ["$lastAppealAdmin", "Lainnya"]
                                }]
                            },
                            then: "Lainnya",
                            else: {
                                $last: "$reportedUserHandle.reasonAdmin"
                            }
                        },

                    },
                    reportStatusLast: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$statusLast", null]
                                }, {
                                    $eq: ["$statusLast", ""]
                                }, {
                                    $eq: ["$statusLast", []]
                                }, {
                                    $eq: ["$statusLast", "BARU"]
                                }]
                            },
                            then: "BARU",
                            else: {
                                $last: "$reportedUserHandle.status"
                            }
                        },

                    },

                    interest: 1,
                    fullName: 1,
                    email: 1,
                    isIdVerified: 1,
                    avatardata: 1,
                    proofpict: 1,

                }
            },
            {
                $addFields: {
                    avatar: {
                        $arrayElemAt: ['$avatardata', 0]
                    },
                    pathavatar: '/profilepict',

                }
            },
            {

                $project: {

                    userID: 1,
                    idApsara: 1,
                    name: 1,
                    nameType: 1,
                    type: 1,
                    status: 1,
                    timestamp: 1,
                    totalUsedCredit: 1,
                    tayang: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    contentModeration: 1,
                    contentModerationResponse: 1,
                    reportedStatus: 1,
                    reportedUser: 1,
                    reportedUserHandle: 1,
                    reportedUserCount: 1,
                    place: 1,
                    reportStatusLast: 1,
                    reasonLastReport: 1,
                    reasonLastAppeal: 1,
                    reasonLastAppealAdmin: 1,
                    createdAtReportLast: 1,
                    createdAtAppealLast: 1,
                    interest: 1,
                    fullName: 1,
                    statusUser:
                    {
                        $cond: {
                            if: {
                                $eq: ["$isIdVerified", true]
                            },
                            then: "PREMIUM",
                            else: "BASIC"
                        }
                    },
                    email: 1,
                    avatar: {
                        mediaBasePath: '$avatar.mediaBasePath',
                        mediaUri: '$avatar.mediaUri',
                        mediaType: '$avatar.mediaType',
                        mediaEndpoint: '$avatar.fsTargetUri',
                        medreplace: {
                            $replaceOne: {
                                input: "$avatar.mediaUri",
                                find: "_0001.jpeg",
                                replacement: ""
                            }
                        },

                    },
                    proofpict: 1,

                }
            },
        ]);
        return query;
    }

    async updateDitangguhkan(id: ObjectID, reason: string, updatedAt: string, reasonId: ObjectID) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "OWNED", "updatedAt": updatedAt, "reportedUserHandle.$[].reasonId": reasonId, "reportedUserHandle.$[].reasonAdmin": reason, "reportedUserHandle.$[].status": "DITANGGUHKAN", "reportedUserHandle.$[].updatedAt": updatedAt } });
        return data;
    }

    async updateDitangguhkanEmpty(id: ObjectID, updatedAt: string, reportedUserHandle: any[]) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "OWNED", "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
        return data;
    }
    async updateFlaging(id: ObjectID, updatedAt: string) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "BLURRED", "updatedAt": updatedAt, "reportedUserCount": 0, "reportedUserHandle.$[].status": "FLAGING", "reportedUserHandle.$[].updatedAt": updatedAt } });
        return data;
    }
    async updateFlagingEmpty(id: ObjectID, updatedAt: string, reportedUserHandle: any[]) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "BLURRED", "updatedAt": updatedAt, "reportedUserCount": 0, "reportedUserHandle": reportedUserHandle } });
        return data;
    }
    async updateTidakditangguhkan(id: ObjectID, updatedAt: string) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "ALL", "updatedAt": updatedAt, "reportedUserCount": 0, "reportedUserHandle.$[].status": "TIDAK DITANGGUHKAN", "reportedUserHandle.$[].updatedAt": updatedAt } });
        return data;
    }
    async updateTidakditangguhkanEmpty(id: ObjectID, updatedAt: string, reportedUserHandle: any[]) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "ALL", "updatedAt": updatedAt, "reportedUserCount": 0, "reportedUserHandle": reportedUserHandle } });
        return data;
    }
    async nonactive(id: ObjectID, updatedAt: string) {
        let data = await this.adsModel.updateMany({ "_id": id },
            {
                $set: {
                    "reportedUser.$[].active": false, "reportedUser.$[].updatedAt": updatedAt
                }


            });
        return data;
    }

    async updateActive(id: ObjectID, updatedAt: string, remark: string) {
        let data = await this.adsModel.updateMany({ "_id": id },

            { $set: { "isActive": false, "updatedAt": updatedAt, "reportedUserHandle.$[].remark": remark, "reportedUserHandle.$[].status": "DELETE", "reportedUserHandle.$[].updatedAt": updatedAt } });
        return data;
    }

    async updateActiveEmpty(id: ObjectID, updatedAt: string, reportedUserHandle: any[]) {
        let data = await this.adsModel.updateMany({ "_id": id },

            { $set: { "isActive": false, "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
        return data;
    }

    async updateStatusOwned(id: ObjectID, updatedAt: string) {
        let data = await this.adsModel.updateMany({ "_id": id },
            { $set: { "reportedStatus": "OWNED", "updatedAt": updatedAt, "reportedUserHandle.$[].status": "DITANGGUHKAN", "reportedUserHandle.$[].updatedAt": updatedAt } });
        return data;
    }


    async find200(): Promise<Ads[]> {
        return this.adsModel.find({ reportedUserCount: { $gte: 200 } }).exec();
    }
    async countReportStatus(startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        var pipeline = [];


        if (startdate === undefined && enddate === undefined) {

            pipeline.push({
                $addFields: {

                    statusLast: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUserHandle", null]
                                }, {
                                    $eq: ["$reportedUserHandle", ""]
                                }, {
                                    $eq: ["$reportedUserHandle", []]
                                }]
                            },
                            then: "BARU",
                            else: {
                                $last: "$reportedUserHandle.status"
                            }
                        },

                    },

                }
            },
                {
                    $facet: {
                        "moderation": [
                            {
                                $addFields: {
                                    createdAtReportLast: "$createdAt",

                                    reportStatusLast: {
                                        $cond: {
                                            if: {
                                                $or: [{
                                                    $eq: ["$statusLast", null]
                                                }, {
                                                    $eq: ["$statusLast", ""]
                                                }, {
                                                    $eq: ["$statusLast", []]
                                                }, {
                                                    $eq: ["$statusLast", "BARU"]
                                                }]
                                            },
                                            then: "BARU",
                                            else: {
                                                $last: "$reportedUserHandle.status"
                                            }
                                        },

                                    },

                                }
                            },
                            {
                                $match: {


                                    isActive: true,
                                    contentModeration: true
                                }
                            },

                            {
                                $group: {
                                    _id: "$reportStatusLast",
                                    myCount: {
                                        $sum: 1
                                    },

                                }
                            },

                        ],

                        "report": [
                            {
                                $addFields: {
                                    createdAtReportLast: {
                                        $last: "$reportedUser.createdAt"
                                    },
                                    reportStatusLast: {
                                        $cond: {
                                            if: {
                                                $or: [{
                                                    $eq: ["$statusLast", null]
                                                }, {
                                                    $eq: ["$statusLast", ""]
                                                }, {
                                                    $eq: ["$statusLast", []]
                                                }, {
                                                    $eq: ["$statusLast", "BARU"]
                                                }]
                                            },
                                            then: "BARU",
                                            else: {
                                                $last: "$reportedUserHandle.status"
                                            }
                                        },

                                    },

                                }
                            },
                            {
                                $match: {

                                    reportedUser: {
                                        $ne: null
                                    },
                                    isActive: true,
                                    contentModeration: false
                                }
                            },
                            {
                                $match: {
                                    reportedUser: {
                                        $ne: []
                                    },
                                    isActive: true,
                                    contentModeration: false
                                }
                            },

                            {
                                $group: {
                                    _id: "$reportStatusLast",
                                    myCount: {
                                        $sum: 1
                                    },

                                }
                            },

                        ],
                        "appeal": [
                            {
                                $addFields: {
                                    createdAtReportLast: {
                                        $last: "$reportedUserHandle.createdAt"
                                    },
                                    reportStatusLast: {
                                        $cond: {
                                            if: {
                                                $or: [{
                                                    $eq: ["$statusLast", null]
                                                }, {
                                                    $eq: ["$statusLast", ""]
                                                }, {
                                                    $eq: ["$statusLast", []]
                                                }, {
                                                    $eq: ["$statusLast", "BARU"]
                                                }]
                                            },
                                            then: "BARU",
                                            else: {
                                                $last: "$reportedUserHandle.status"
                                            }
                                        },

                                    },

                                }
                            },
                            {
                                $match: {

                                    reportedUserHandle: {
                                        $ne: null
                                    },
                                    isActive: true,
                                    contentModeration: false
                                }
                            },
                            {
                                $match: {
                                    reportedUserHandle: {
                                        $ne: []
                                    },
                                    isActive: true,
                                    contentModeration: false
                                }
                            },

                            {
                                $group: {
                                    _id: "$reportStatusLast",
                                    myCount: {
                                        $sum: 1
                                    }
                                }
                            },

                        ]
                    },

                });

        }
        else if (startdate !== undefined && enddate !== undefined) {
            pipeline.push({
                $addFields: {

                    statusLast: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$reportedUserHandle", null]
                                }, {
                                    $eq: ["$reportedUserHandle", ""]
                                }, {
                                    $eq: ["$reportedUserHandle", []]
                                }]
                            },
                            then: "BARU",
                            else: {
                                $last: "$reportedUserHandle.status"
                            }
                        },

                    },

                }
            },
                {
                    $facet: {
                        "moderation": [
                            {
                                $addFields: {
                                    createdAtReportLast: "$createdAt",

                                    reportStatusLast: {
                                        $cond: {
                                            if: {
                                                $or: [{
                                                    $eq: ["$statusLast", null]
                                                }, {
                                                    $eq: ["$statusLast", ""]
                                                }, {
                                                    $eq: ["$statusLast", []]
                                                }, {
                                                    $eq: ["$statusLast", "BARU"]
                                                }]
                                            },
                                            then: "BARU",
                                            else: {
                                                $last: "$reportedUserHandle.status"
                                            }
                                        },

                                    },

                                }
                            },
                            {
                                $match: {


                                    isActive: true,
                                    contentModeration: true
                                }
                            },
                            { $match: { createdAtReportLast: { "$gte": startdate, "$lte": dateend } } },
                            {
                                $group: {
                                    _id: "$reportStatusLast",
                                    myCount: {
                                        $sum: 1
                                    },

                                }
                            },

                        ],

                        "report": [
                            {
                                $addFields: {
                                    createdAtReportLast: {
                                        $last: "$reportedUser.createdAt"
                                    },
                                    reportStatusLast: {
                                        $cond: {
                                            if: {
                                                $or: [{
                                                    $eq: ["$statusLast", null]
                                                }, {
                                                    $eq: ["$statusLast", ""]
                                                }, {
                                                    $eq: ["$statusLast", []]
                                                }, {
                                                    $eq: ["$statusLast", "BARU"]
                                                }]
                                            },
                                            then: "BARU",
                                            else: {
                                                $last: "$reportedUserHandle.status"
                                            }
                                        },

                                    },

                                }
                            },
                            {
                                $match: {

                                    reportedUser: {
                                        $ne: null
                                    },
                                    isActive: true,
                                    contentModeration: false
                                }
                            },
                            {
                                $match: {
                                    reportedUser: {
                                        $ne: []
                                    },
                                    isActive: true,
                                    contentModeration: false
                                }
                            },
                            { $match: { createdAtReportLast: { "$gte": startdate, "$lte": dateend } } },
                            {
                                $group: {
                                    _id: "$reportStatusLast",
                                    myCount: {
                                        $sum: 1
                                    },

                                }
                            },

                        ],
                        "appeal": [
                            {
                                $addFields: {
                                    createdAtReportLast: {
                                        $last: "$reportedUserHandle.createdAt"
                                    },
                                    reportStatusLast: {
                                        $cond: {
                                            if: {
                                                $or: [{
                                                    $eq: ["$statusLast", null]
                                                }, {
                                                    $eq: ["$statusLast", ""]
                                                }, {
                                                    $eq: ["$statusLast", []]
                                                }, {
                                                    $eq: ["$statusLast", "BARU"]
                                                }]
                                            },
                                            then: "BARU",
                                            else: {
                                                $last: "$reportedUserHandle.status"
                                            }
                                        },

                                    },

                                }
                            },
                            {
                                $match: {

                                    reportedUserHandle: {
                                        $ne: null
                                    },
                                    isActive: true,
                                    contentModeration: false
                                }
                            },
                            {
                                $match: {
                                    reportedUserHandle: {
                                        $ne: []
                                    },
                                    isActive: true,
                                    contentModeration: false
                                }
                            },
                            { $match: { createdAtReportLast: { "$gte": startdate, "$lte": dateend } } },
                            {
                                $group: {
                                    _id: "$reportStatusLast",
                                    myCount: {
                                        $sum: 1
                                    }
                                }
                            },

                        ]
                    },

                });
        }

        let query = await this.adsModel.aggregate(pipeline);

        return query;
    }

    async countViewClick(iduser: ObjectID, startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        if (startdate !== undefined && enddate !== undefined) {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        userID: iduser
                    }
                },
                {
                    $facet: {
                        "view": [
                            {
                                "$lookup": {
                                    from: "userads",
                                    as: "userad",
                                    let: {
                                        localID: '$_id'
                                    },
                                    pipeline: [
                                        {
                                            $match:
                                            {


                                                $expr: {
                                                    $eq: ['$adsID', '$$localID']
                                                }
                                            }
                                        },
                                        {
                                            $match:
                                            {
                                                'statusView': true,
                                                'createdAt': { $gte: startdate, $lte: dateend }
                                            }
                                        },
                                        {
                                            $group: {
                                                _id: "$statusView",
                                                myCount: {
                                                    $sum: 1
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: "$statusView",
                                                "myCount": "$myCount",

                                            }
                                        }
                                    ],

                                },

                            },
                            {
                                $unwind: "$userad"
                            },
                            {
                                $project: {

                                    "_id": 1,
                                    "totalView": '$userad.myCount',

                                }
                            },
                        ],
                        "click": [
                            {
                                "$lookup": {
                                    from: "userads",
                                    as: "userad",
                                    let: {
                                        localID: '$_id'
                                    },
                                    pipeline: [
                                        {
                                            $match:
                                            {


                                                $expr: {
                                                    $eq: ['$adsID', '$$localID']
                                                }
                                            }
                                        },
                                        {
                                            $match:
                                            {
                                                'statusClick': true,
                                                'clickAt': { $gte: startdate, $lte: dateend }
                                            }
                                        },
                                        {
                                            $group: {
                                                _id: "$statusClick",
                                                myCount: {
                                                    $sum: 1
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: "$statusClick",
                                                "myCount": "$myCount",

                                            }
                                        }
                                    ],

                                },

                            },
                            {
                                $unwind: "$userad"
                            },
                            {
                                $project: {

                                    "_id": 1,
                                    "totalClick": '$userad.myCount',

                                }
                            },
                        ]

                    }
                }

            ]);
            return query;
        }
        else {
            let query = await this.adsModel.aggregate([

                {
                    $match: {
                        userID: iduser
                    }
                },
                {
                    $facet: {
                        "view": [
                            {
                                "$lookup": {
                                    from: "userads",
                                    as: "userad",
                                    let: {
                                        localID: '$_id'
                                    },
                                    pipeline: [
                                        {
                                            $match:
                                            {


                                                $expr: {
                                                    $eq: ['$adsID', '$$localID']
                                                }
                                            }
                                        },
                                        {
                                            $match:
                                            {
                                                'statusView': true,

                                            }
                                        },
                                        {
                                            $group: {
                                                _id: "$statusView",
                                                myCount: {
                                                    $sum: 1
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: "$statusView",
                                                "myCount": "$myCount",

                                            }
                                        }
                                    ],

                                },

                            },
                            {
                                $unwind: "$userad"
                            },
                            {
                                $project: {

                                    "_id": 1,
                                    "totalView": '$userad.myCount',

                                }
                            },
                        ],
                        "click": [
                            {
                                "$lookup": {
                                    from: "userads",
                                    as: "userad",
                                    let: {
                                        localID: '$_id'
                                    },
                                    pipeline: [
                                        {
                                            $match:
                                            {


                                                $expr: {
                                                    $eq: ['$adsID', '$$localID']
                                                }
                                            }
                                        },
                                        {
                                            $match:
                                            {
                                                'statusClick': true,

                                            }
                                        },
                                        {
                                            $group: {
                                                _id: "$statusClick",
                                                myCount: {
                                                    $sum: 1
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: "$statusClick",
                                                "myCount": "$myCount",

                                            }
                                        }
                                    ],

                                },

                            },
                            {
                                $unwind: "$userad"
                            },
                            {
                                $project: {

                                    "_id": 1,
                                    "totalClick": '$userad.myCount',

                                }
                            },
                        ]

                    }
                }

            ]);
            return query;
        }


    }

    async detailAds(id: ObjectID, startdate: string, enddate: string) {
        var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

        var dateend = currentdate.toISOString();


        var n1 = new Date(new Date().setDate(new Date().getDate() - 6));
        var dt1 = n1.toISOString();
        var splitdt1 = dt1.split('T');
        var dateend1 = splitdt1[0].toString();

        var n2 = new Date(new Date().setDate(new Date().getDate() - 5));
        var dt2 = n2.toISOString();
        var splitdt2 = dt2.split('T');
        var dateend2 = splitdt2[0].toString();

        var n3 = new Date(new Date().setDate(new Date().getDate() - 4));
        var dt3 = n3.toISOString();
        var splitdt3 = dt3.split('T');
        var dateend3 = splitdt3[0].toString();


        var n4 = new Date(new Date().setDate(new Date().getDate() - 3));
        var dt4 = n4.toISOString();
        var splitdt4 = dt4.split('T');
        var dateend4 = splitdt4[0].toString();

        var n5 = new Date(new Date().setDate(new Date().getDate() - 2));
        var dt5 = n5.toISOString();
        var splitdt5 = dt5.split('T');
        var dateend5 = splitdt5[0].toString();

        var n6 = new Date(new Date().setDate(new Date().getDate() - 1));
        var dt6 = n6.toISOString();
        var splitdt6 = dt6.split('T');
        var dateend6 = splitdt6[0].toString();

        var n7 = new Date();
        var dt7 = n7.toISOString();
        var splitdt7 = dt7.split('T');
        var dateend7 = splitdt7[0].toString();

        var query = await this.adsModel.aggregate([
            {
                $match: {
                    _id: id,

                }
            },

            {
                $lookup: {
                    from: "adsplaces",
                    localField: "placingID",
                    foreignField: "_id",
                    as: "placeData"
                }
            },
            {
                $lookup: {
                    from: "adstypes",
                    localField: "typeAdsID",
                    foreignField: "_id",
                    as: "typesData"
                }
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "userID",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            },
            {
                $project: {
                    userID: 1,
                    fullName: '$user.fullName',
                    email: '$user.email',
                    timestamp: 1,
                    expiredAt: 1,
                    liveAt: 1,
                    name: 1,
                    description: 1,
                    objectifitas: 1,
                    status: 1,
                    totalClick: 1,
                    totalUsedCredit: 1,
                    totalView: 1,
                    urlLink: 1,
                    isActive: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    timeStart: 1,
                    timeEnd: 1,
                    namePlace: {
                        $arrayElemAt: ['$placeData.namePlace', 0]
                    },
                    nameType: {
                        $arrayElemAt: ['$typesData.nameType', 0]
                    },
                    idApsara: 1,
                    duration: 1,
                    tayang: 1,
                    type: 1
                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "view",
                    let: {
                        local_id: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                "statusClick": 1,
                                "statusView": 1,

                            }
                        },
                        {
                            $match: {


                                statusView: true
                            }
                        },
                        {
                            $group: {
                                _id: "$adsID",
                                myCount: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $project: {
                                _id: "$_id",
                                "totalView": "$myCount",

                            }
                        }
                    ],

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "click",
                    let: {
                        local_id: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                "statusClick": 1,
                                "statusView": 1,

                            }
                        },
                        {
                            $match: {


                                statusClick: true
                            }
                        },
                        {
                            $group: {
                                _id: "$adsID",
                                myCount: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $project: {
                                _id: "$_id",
                                "totalClick": "$myCount",

                            }
                        }
                    ],

                }
            },
            {
                $project: {
                    userID: 1,
                    fullName: 1,
                    email: 1,
                    timestamp: 1,
                    expiredAt: 1,
                    liveAt: 1,
                    name: 1,
                    description: 1,
                    objectifitas: 1,
                    status: 1,
                    totalUsedCredit: 1,
                    urlLink: 1,
                    isActive: 1,
                    namePlace: 1,
                    nameType: 1,
                    idApsara: 1,
                    duration: 1,
                    tayang: 1,
                    type: 1,
                    timeStart: 1,
                    timeEnd: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    totalView: {
                        $arrayElemAt: ['$view.totalView', 0]
                    },
                    totalClick: {
                        $arrayElemAt: ['$click.totalClick', 0]
                    },

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "viewrange",
                    let: {
                        local_id: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                "statusClick": 1,
                                "statusView": 1,
                                "createdAt": 1
                            }
                        },
                        {
                            $match: {


                                statusView: true,
                                createdAt: {
                                    $gte: startdate,
                                    $lte: dateend,

                                }
                            }
                        },

                    ],

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "clickrange",
                    let: {
                        local_id: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                "statusClick": 1,
                                "statusView": 1,
                                "createdAt": 1
                            }
                        },
                        {
                            $match: {


                                statusClick: true,
                                createdAt: {
                                    $gte: startdate,
                                    $lte: dateend,

                                }
                            }
                        },

                    ],

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "sumview",
                    let: {
                        local_id: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                "statusClick": 1,
                                "statusView": 1,
                                "createdAt": 1
                            }
                        },
                        {
                            $match: {


                                statusView: true,
                                createdAt: {
                                    $gte: startdate,
                                    $lte: dateend,

                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    tanggal: {
                                        $substrCP: [
                                            "$createdAt",
                                            0,
                                            10
                                        ]
                                    }
                                },
                                total: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                date: "$_id.tanggal",
                                total: 1,

                            }
                        },
                        {
                            $sort: {
                                date: 1
                            }
                        },

                    ],

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "sumclick",
                    let: {
                        local_id: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                "statusClick": 1,
                                "statusView": 1,
                                "createdAt": 1
                            }
                        },
                        {
                            $match: {


                                statusClick: true,
                                createdAt: {
                                    $gte: startdate,
                                    $lte: dateend,

                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    tanggal: {
                                        $substrCP: [
                                            "$createdAt",
                                            0,
                                            10
                                        ]
                                    }
                                },
                                total: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                date: "$_id.tanggal",
                                total: 1,

                            }
                        },
                        {
                            $sort: {
                                date: 1
                            }
                        },

                    ],

                }
            },
            {
                $addFields:
                {
                    view:
                    {
                        $size: "$viewrange"
                    },
                    click:
                    {
                        $size: "$clickrange"
                    },
                    tview: {
                        $cmp: ["$totalView", 0]
                    },
                    tclick: {
                        $cmp: ["$totalClick", 0]
                    }
                }
            },
            {
                $project: {
                    userID: 1,
                    fullName: 1,
                    email: 1,
                    timestamp: 1,
                    expiredAt: 1,
                    liveAt: 1,
                    name: 1,
                    description: 1,
                    objectifitas: 1,
                    status: 1,
                    totalUsedCredit: 1,
                    urlLink: 1,
                    isActive: 1,
                    namePlace: 1,
                    nameType: 1,
                    idApsara: 1,
                    duration: 1,
                    tayang: 1,
                    type: 1,
                    timeStart: 1,
                    timeEnd: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    totalView: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$tview", - 1]
                                }, {
                                    $eq: ["$tview", 0]
                                },]
                            },
                            then: 0,
                            else: "$totalView"
                        },

                    },
                    totalClick: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$tclick", - 1]
                                }, {
                                    $eq: ["$tclick", 0]
                                },]
                            },
                            then: 0,
                            else: "$totalClick"
                        },

                    },
                    view: 1,
                    click: 1,
                    sumview: 1,
                    sumclick: 1
                }
            },
            {
                "$lookup": {
                    from: "accountbalances",
                    as: "reward",
                    let: {
                        local_id: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$idtrans', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                "type": 1,
                                "kredit": 1,
                                "timestamp": 1
                            }
                        },
                        {
                            $match: {

                                "type": "rewards",
                                "timestamp": {
                                    $gte: "2023-01-12",
                                    $lte: "2023-01-13",

                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalbiaya: {
                                    $sum: "$kredit"
                                }
                            }
                        },

                    ],

                }
            },
            {
                "$lookup": {
                    from: "userads",
                    as: "clickrange",
                    let: {
                        local_id: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                "statusClick": 1,
                                "statusView": 1,
                                "createdAt": 1
                            }
                        },
                        {
                            $match: {


                                statusClick: true,
                                createdAt: {
                                    $gte: startdate,
                                    $lte: dateend,

                                }
                            }
                        },

                    ],

                }
            },
            {
                $project: {
                    userID: 1,
                    fullName: 1,
                    email: 1,
                    timestamp: 1,
                    expiredAt: 1,
                    liveAt: 1,
                    name: 1,
                    description: 1,
                    objectifitas: 1,
                    status: 1,
                    totalUsedCredit: 1,
                    urlLink: 1,
                    timeStart: 1,
                    timeEnd: 1,
                    isActive: 1,
                    namePlace: 1,
                    nameType: 1,
                    idApsara: 1,
                    duration: 1,
                    tayang: 1,
                    type: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    totalView: 1,
                    totalClick: 1,
                    view: 1,
                    click: 1,
                    totalbiaya: {
                        $arrayElemAt: ['$reward.totalbiaya', 0]
                    },
                    sumview: 1,
                    sumclick: 1
                }
            },
            {
                $addFields:
                {

                    tbiaya: {
                        $cmp: ["$totalbiaya", 0]
                    }
                }
            },
            {
                $project: {
                    userID: 1,
                    fullName: 1,
                    email: 1,
                    timestamp: 1,
                    expiredAt: 1,
                    liveAt: 1,
                    name: 1,
                    description: 1,
                    objectifitas: 1,
                    status: 1,
                    totalUsedCredit: 1,
                    urlLink: 1,
                    isActive: 1,
                    namePlace: 1,
                    nameType: 1,
                    idApsara: 1,
                    duration: 1,
                    tayang: 1,
                    type: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    totalView: 1,
                    totalClick: 1,
                    timeStart: 1,
                    timeEnd: 1,
                    view: 1,
                    click: 1,
                    totalbiaya: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$tbiaya", - 1]
                                }, {
                                    $eq: ["$tbiaya", 0]
                                },]
                            },
                            then: 0,
                            else: "$totalbiaya"
                        },

                    },
                    sumview: 1,
                    sumclick: 1
                }
            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "wilayah",
                    "let": {
                        "local_id": "$_id",

                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match: {
                                statusView: true
                            }
                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },

                            }
                        },
                        {
                            $project: {

                                states: '$ubasic.states',

                            }
                        },
                        {
                            $project: {

                                states: 1,

                            }
                        },
                        {
                            $lookup: {
                                from: 'areas',
                                localField: 'states.$id',
                                foreignField: '_id',
                                as: 'areas_data',

                            },

                        },
                        {
                            $unwind: {
                                path: "$areas_data",

                            }
                        },
                        {
                            $project: {

                                stateName: '$areas_data.stateName'
                            }
                        },
                        {
                            "$group": {
                                "_id": "$stateName",
                                "count": {
                                    "$sum": 1
                                }
                            }
                        }
                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "age",
                    "let": {
                        "local_id": "$_id",

                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match: {
                                statusView: true
                            }
                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },

                            }
                        },
                        {
                            $project: {
                                dob: '$ubasic.dob',

                            }
                        },
                        {
                            $project: {

                                age: {
                                    $cond: {
                                        if: {
                                            $and: [
                                                '$dob',
                                                {
                                                    $ne: ["$dob", ""]
                                                }
                                            ]
                                        },
                                        then: {
                                            $toInt: {
                                                $divide: [{
                                                    $subtract: [new Date(), {
                                                        $toDate: "$dob"
                                                    }]
                                                }, (365 * 24 * 60 * 60 * 1000)]
                                            }
                                        },
                                        else: 0
                                    }
                                },

                            }
                        },
                        {
                            $project: {

                                ageQualication: {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $gt: ["$age", 44]
                                                },
                                                then: "< 44 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: ["$age", 36]
                                                    }, {
                                                        $lte: ["$age", 44]
                                                    }]
                                                },
                                                then: "35-44 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: ["$age", 25]
                                                    }, {
                                                        $lte: ["$age", 35]
                                                    }]
                                                },
                                                then: "24-35 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: ["$age", 14]
                                                    }, {
                                                        $lte: ["$age", 24]
                                                    }]
                                                },
                                                then: "14-24 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: ["$age", 1]
                                                    }, {
                                                        $lt: ["$age", 14]
                                                    }]
                                                },
                                                then: "< 14 Tahun"
                                            }
                                        ],
                                        "default": "other"
                                    }
                                },

                            }
                        },
                        {
                            "$group": {
                                "_id": "$ageQualication",
                                "count": {
                                    "$sum": 1
                                }
                            }
                        }
                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "gender",
                    "let": {
                        "local_id": "$_id",

                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match: {
                                statusView: true,
                                createdAt: {
                                    $gte: startdate,
                                    $lte: dateend,

                                }
                            }
                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },

                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',

                            }
                        },
                        {
                            $project: {

                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            "$group": {
                                "_id": "$gender",
                                "count": {
                                    "$sum": 1
                                }
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "male",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend7,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "MALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "female",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend7,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "FEMALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "other",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend7,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "OTHER"
                            }
                        },

                    ],

                },

            },
            {
                $project: {
                    userID: 1,
                    fullName: 1,
                    email: 1,
                    timestamp: 1,
                    expiredAt: 1,
                    liveAt: 1,
                    name: 1,
                    description: 1,
                    objectifitas: 1,
                    status: 1,
                    totalUsedCredit: 1,
                    urlLink: 1,
                    isActive: 1,
                    namePlace: 1,
                    nameType: 1,
                    idApsara: 1,
                    duration: 1,
                    tayang: 1,
                    type: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    totalView: 1,
                    totalClick: 1,
                    view: 1,
                    click: 1,
                    totalbiaya: 1,
                    wilayah: 1,
                    age: 1,
                    gender: 1,
                    sumview: 1,
                    sumclick: 1,
                    male: 1,
                    female: 1,
                    Day7: {
                        "_id": "Day7",
                        "date": dateend7,
                        "male": {
                            $cond: {
                                if: {
                                    $isArray: "$male"
                                },
                                then: {
                                    $size: "$male"
                                },
                                else: 0
                            }
                        },
                        "female": {
                            $cond: {
                                if: {
                                    $isArray: "$female"
                                },
                                then: {
                                    $size: "$female"
                                },
                                else: 0
                            }
                        },
                        "other": {
                            $cond: {
                                if: {
                                    $isArray: "$other"
                                },
                                then: {
                                    $size: "$other"
                                },
                                else: 0
                            }
                        },

                    }
                },

            },

            {
                "$lookup": {
                    "from": "userads",
                    "as": "male2",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend6,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "MALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "female2",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend6,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "FEMALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "other2",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend6,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "OTHER"
                            }
                        },

                    ],

                },

            },

            {
                "$lookup": {
                    "from": "userads",
                    "as": "male3",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend5,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "MALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "female3",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend5,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "FEMALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "other3",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend5,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "OTHER"
                            }
                        },

                    ],

                },

            },

            {
                "$lookup": {
                    "from": "userads",
                    "as": "male4",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend4,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "MALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "female4",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend4,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "FEMALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "other4",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend4,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "OTHER"
                            }
                        },

                    ],

                },

            },

            {
                "$lookup": {
                    "from": "userads",
                    "as": "male5",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend3,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "MALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "female5",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend3,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "FEMALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "other5",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend3,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "OTHER"
                            }
                        },

                    ],

                },

            },

            {
                "$lookup": {
                    "from": "userads",
                    "as": "male6",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend2,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "MALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "female6",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend2,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "FEMALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "other6",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend2,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "OTHER"
                            }
                        },

                    ],

                },

            },

            {
                "$lookup": {
                    "from": "userads",
                    "as": "male7",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend1,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "MALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "female7",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend1,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "FEMALE"
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    "from": "userads",
                    "as": "other7",
                    "let": {
                        "local_id": '$_id'
                    },
                    "pipeline": [
                        {
                            $match:
                            {


                                $expr: {
                                    $eq: ['$adsID', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {

                                userID: 1,
                                createdAt: 1,
                                statusClick: 1,
                                statusView: 1,

                            }
                        },
                        {
                            $match:
                            {
                                statusView: true,

                                createdAt: {
                                    $regex: dateend1,
                                    $options: 'i'
                                },
                            },

                        },
                        {
                            "$lookup": {
                                "from": "userbasics",
                                "as": "ubasic",
                                "let": {
                                    "local_id": "$userID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$local_id"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        },
                        {
                            $project: {
                                ubasic: {
                                    $arrayElemAt: ['$ubasic', 0]
                                },
                                createdAt: 1
                            }
                        },
                        {
                            $project: {

                                gender: '$ubasic.gender',
                                createdAt: 1
                            }
                        },
                        {
                            $project: {
                                createdAt: 1,
                                gender: {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },

                            }
                        },
                        {
                            $match: {
                                gender: "OTHER"
                            }
                        },

                    ],

                },

            },
            {
                $project: {
                    userID: 1,
                    fullName: 1,
                    email: 1,
                    timestamp: 1,
                    expiredAt: 1,
                    liveAt: 1,
                    name: 1,
                    description: 1,
                    objectifitas: 1,
                    status: 1,
                    totalUsedCredit: 1,
                    urlLink: 1,
                    isActive: 1,
                    namePlace: 1,
                    nameType: 1,
                    idApsara: 1,
                    duration: 1,
                    tayang: 1,
                    type: 1,
                    usedCredit: 1,
                    usedCreditFree: 1,
                    creditFree: 1,
                    creditValue: 1,
                    totalCredit: 1,
                    totalView: 1,
                    totalClick: 1,
                    view: 1,
                    click: 1,
                    totalbiaya: 1,
                    wilayah: 1,
                    age: 1,
                    gender: 1,
                    sumview: 1,
                    sumclick: 1,
                    Day7: 1,
                    Day6: {
                        "_id": "Day6",
                        "date": dateend6,
                        "male": {
                            $cond: {
                                if: {
                                    $isArray: "$male2"
                                },
                                then: {
                                    $size: "$male2"
                                },
                                else: 0
                            }
                        },
                        "female": {
                            $cond: {
                                if: {
                                    $isArray: "$female2"
                                },
                                then: {
                                    $size: "$female2"
                                },
                                else: 0
                            }
                        },
                        "other": {
                            $cond: {
                                if: {
                                    $isArray: "$other2"
                                },
                                then: {
                                    $size: "$other2"
                                },
                                else: 0
                            }
                        },

                    },
                    Day5: {
                        "_id": "Day5",
                        "date": dateend5,
                        "male": {
                            $cond: {
                                if: {
                                    $isArray: "$male3"
                                },
                                then: {
                                    $size: "$male3"
                                },
                                else: 0
                            }
                        },
                        "female": {
                            $cond: {
                                if: {
                                    $isArray: "$female3"
                                },
                                then: {
                                    $size: "$female3"
                                },
                                else: 0
                            }
                        },
                        "other": {
                            $cond: {
                                if: {
                                    $isArray: "$other3"
                                },
                                then: {
                                    $size: "$other3"
                                },
                                else: 0
                            }
                        },

                    },
                    Day4: {
                        "_id": "Day4",
                        "date": dateend4,
                        "male": {
                            $cond: {
                                if: {
                                    $isArray: "$male4"
                                },
                                then: {
                                    $size: "$male4"
                                },
                                else: 0
                            }
                        },
                        "female": {
                            $cond: {
                                if: {
                                    $isArray: "$female4"
                                },
                                then: {
                                    $size: "$female4"
                                },
                                else: 0
                            }
                        },
                        "other": {
                            $cond: {
                                if: {
                                    $isArray: "$other4"
                                },
                                then: {
                                    $size: "$other4"
                                },
                                else: 0
                            }
                        },

                    },
                    Day3: {
                        "_id": "Day3",
                        "date": dateend3,
                        "end": "$timeEnd5",
                        "male": {
                            $cond: {
                                if: {
                                    $isArray: "$male5"
                                },
                                then: {
                                    $size: "$male5"
                                },
                                else: 0
                            }
                        },
                        "female": {
                            $cond: {
                                if: {
                                    $isArray: "$female5"
                                },
                                then: {
                                    $size: "$female5"
                                },
                                else: 0
                            }
                        },
                        "other": {
                            $cond: {
                                if: {
                                    $isArray: "$other5"
                                },
                                then: {
                                    $size: "$other5"
                                },
                                else: 0
                            }
                        },

                    },
                    Day2: {
                        "_id": "Day2",
                        "date": dateend2,
                        "male": {
                            $cond: {
                                if: {
                                    $isArray: "$male6"
                                },
                                then: {
                                    $size: "$male6"
                                },
                                else: 0
                            }
                        },
                        "female": {
                            $cond: {
                                if: {
                                    $isArray: "$female6"
                                },
                                then: {
                                    $size: "$female6"
                                },
                                else: 0
                            }
                        },
                        "other": {
                            $cond: {
                                if: {
                                    $isArray: "$other6"
                                },
                                then: {
                                    $size: "$other6"
                                },
                                else: 0
                            }
                        },

                    },
                    Day1: {
                        "_id": "Day1",
                        "date": dateend1,
                        "male": {
                            $cond: {
                                if: {
                                    $isArray: "$male7"
                                },
                                then: {
                                    $size: "$male7"
                                },
                                else: 0
                            }
                        },
                        "female": {
                            $cond: {
                                if: {
                                    $isArray: "$female7"
                                },
                                then: {
                                    $size: "$female7"
                                },
                                else: 0
                            }
                        },
                        "other": {
                            $cond: {
                                if: {
                                    $isArray: "$other7"
                                },
                                then: {
                                    $size: "$other7"
                                },
                                else: 0
                            }
                        },

                    }
                },

            },
        ]);
        var arrayData = [];
        let data = await this.getapsaraDatabaseAds(query, startdate, enddate);
        arrayData.push(data[0])
        return arrayData;
    }

    async getgraphadsanalytics(userid: Types.ObjectId) {


        const query = await this.adsModel.aggregate([
            {
                $match:
                {
                    $and: [
                        {
                            "userID": userid
                        },
                        {
                            "status": "APPROVE"
                        },
                        //{
                        //    $expr: {
                        //        $gt: ["$liveAt", "$timeStart"]
                        //    }
                        //},
                        //{
                        //    $expr: {
                        //        $lt: ["$liveAt", "$timeEnd"]
                        //    }
                        //},
                    ]
                },

            },
            {
                $lookup: {
                    from: 'userads',
                    as: 'view',
                    let: {
                        localID: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$adsID', '$$localID']
                                        }
                                    },
                                    {
                                        "statusView": true,

                                    },

                                ]
                            }
                        },

                    ],

                },

            },
            {
                $lookup: {
                    from: 'userads',
                    as: 'click',
                    let: {
                        localID: '$_id'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$adsID', '$$localID']
                                        }
                                    },
                                    {
                                        "statusClick": true,

                                    },

                                ]
                            }
                        },

                    ],

                },

            },
            {
                "$lookup": {
                    from: "userbasics",
                    as: "userView",
                    let: {
                        localID: '$view.userID'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $in: ['$_id', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                "_id": 1,
                                "gender": {

                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $eq: ['$gender', 'FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' FEMALE']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Perempuan']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Wanita']
                                                },
                                                then: 'FEMALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', ' MALE']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Laki-laki']
                                                },
                                                then: 'MALE',

                                            },
                                            {
                                                case: {
                                                    $eq: ['$gender', 'Pria']
                                                },
                                                then: 'MALE',

                                            },

                                        ],
                                        default: "OTHER",

                                    },

                                },
                                "cities": 1,
                                "dob":
                                {
                                    $cond: {
                                        if: {
                                            $and: ['$dob', {
                                                $ne: ["$dob", ""]
                                            }]
                                        },
                                        then: {
                                            $toInt: {
                                                $divide: [{
                                                    $subtract: [new Date(), {
                                                        $toDate: "$dob"
                                                    }]
                                                }, (365 * 24 * 60 * 60 * 1000)]
                                            }
                                        },
                                        else: 0
                                    }
                                },

                            }
                        },
                        {
                            $project: {
                                "_id": 1,
                                "gender": 1,
                                "cities": 1,
                                "dob":
                                {
                                    $switch: {
                                        branches: [
                                            {
                                                case: {
                                                    $gt: ["$dob", 44]
                                                },
                                                then: "< 44 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: ["$dob", 36]
                                                    }, {
                                                        $lte: ["$dob", 44]
                                                    }]
                                                },
                                                then: "35-44 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: ["$dob", 25]
                                                    }, {
                                                        $lte: ["$dob", 35]
                                                    }]
                                                },
                                                then: "24-35 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: ["$dob", 14]
                                                    }, {
                                                        $lte: ["$dob", 24]
                                                    }]
                                                },
                                                then: "14-24 Tahun"
                                            },
                                            {
                                                case: {
                                                    $and: [{
                                                        $gte: ["$dob", 1]
                                                    }, {
                                                        $lt: ["$dob", 14]
                                                    }]
                                                },
                                                then: "< 14 Tahun"
                                            }
                                        ],
                                        "default": "other"
                                    }
                                },

                            }
                        }
                    ],

                }
            },
            {
                $lookup: {
                    from: 'cities',
                    localField: 'userView.cities.$id',
                    foreignField: '_id',
                    as: 'citiesView',

                },

            },
            {
                $lookup: {
                    from: 'areas',
                    localField: 'citiesView.stateID',
                    foreignField: 'stateID',
                    as: 'areasView',

                },

            },
            {
                $project: {
                    "start": "$timeStart",
                    "end": "$timeEnd",
                    "_id": 1,
                    "userID": "$userID",
                    "areaView": "$areasView.stateName",
                    "genderView": "$userView.gender",
                    "dobView": "$userView.dob",
                    "dobClick": "$userView.dob",
                    "view": {
                        $cond: {
                            if: {
                                $isArray: "$view"
                            },
                            then: {
                                $size: "$view"
                            },
                            else: 0
                        }
                    },
                    "click": {
                        $cond: {
                            if: {
                                $isArray: "$click"
                            },
                            then: {
                                $size: "$click"
                            },
                            else: 0
                        }
                    },

                }
            },
            {
                $facet: {
                    "view": [
                        {
                            $group: {
                                _id: "allView",
                                view: {
                                    $sum: "$view"
                                },

                            }

                        }
                    ],
                    "click": [
                        {
                            $group: {
                                _id: "allClick",
                                click: {

                                    $sum: "$click"
                                },

                            }

                        }
                    ],
                    "totalarea": [
                        {
                            $unwind: {
                                path: "$areaView",

                            }
                        },
                        {
                            $group:
                            {
                                _id: "totalarea",
                                total:
                                {
                                    $sum: 1
                                },
                                //totaldata:total
                            }
                        },
                        {
                            $project: {
                                total: 1,

                            }
                        }
                    ],
                    "areas": [
                        {
                            $unwind: {
                                path: "$areaView",

                            }
                        },
                        {
                            $project: {
                                "area": "$areaView"
                            }
                        },
                        {
                            $group: {
                                _id: '$area',
                                count: {
                                    $sum: 1
                                }
                            }
                        }
                    ],
                    "totalage": [
                        {
                            $unwind: {
                                path: "$dobView",

                            }
                        },
                        {
                            $group:
                            {
                                _id: "$kancut",
                                total:
                                {
                                    $sum: 1
                                },
                                //totaldata:total
                            }
                        },
                        {
                            $project: {
                                total: 1,

                            }
                        }
                    ],
                    "age": [
                        {
                            $unwind: {
                                path: "$dobView",

                            }
                        },
                        {
                            $group: {
                                _id: '$dobView',
                                age: {
                                    $sum: 1
                                },

                            }
                        },

                    ],
                    "gender": [
                        {
                            $unwind: {
                                path: "$genderView",

                            }
                        },
                        {
                            $project: {
                                "gender": "$genderView"
                            }
                        },
                        {
                            $group: {
                                _id: '$gender',
                                count: {
                                    $sum: 1
                                }
                            }
                        }
                    ],
                    "totalGender": [
                        {
                            $unwind: {
                                path: "$genderView",

                            }
                        },
                        {
                            $group:
                            {
                                _id: "$kancut",
                                total:
                                {
                                    $sum: 1
                                },
                                //totaldata:total
                            }
                        },
                        {
                            $project: {
                                total: 1,

                            }
                        }
                    ],
                    "day7": [
                        {
                            $set: {
                                "timeStart":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 61200000] // 1 hari 61200000
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $set: {
                                "timeEnd":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), 25200000]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'ads',
                                as: 'dodol',
                                let: {
                                    localID: userid
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$userID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "status": "APPROVE"
                                                },
                                                {
                                                    $expr: {
                                                        $gt: ["$liveAt", "$timeStart"]
                                                    }
                                                },
                                                {
                                                    $expr: {
                                                        $lt: ["$liveAt", "$timeEnd"]
                                                    }
                                                },

                                            ]
                                        },

                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'view',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusView": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'click',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusClick": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $project: {
                                "start": "$timeStart",
                                "end": "$timeEnd",
                                "view": {
                                    $cond: {
                                        if: {
                                            $isArray: "$view"
                                        },
                                        then: {
                                            $size: "$view"
                                        },
                                        else: 0
                                    }
                                },
                                "click": {
                                    $cond: {
                                        if: {
                                            $isArray: "$click"
                                        },
                                        then: {
                                            $size: "$click"
                                        },
                                        else: 0
                                    }
                                },

                            }
                        },
                        {
                            $group: {
                                _id: "Day7",
                                view: {
                                    $sum: "$view"
                                },
                                click: {
                                    $sum: "$click"
                                },
                                timeStart: {
                                    $first: "$start"
                                },
                                timeEndt: {
                                    $first: "$end"
                                },

                            }

                        }
                    ],
                    "day6": [
                        {
                            $set: {
                                "timeStart":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 147600000] // 1 hari 61200000
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $set: {
                                "timeEnd":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 61200000]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'ads',
                                as: 'dodol',
                                let: {
                                    localID: userid
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$userID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "status": "APPROVE"
                                                },
                                                {
                                                    $expr: {
                                                        $gt: ["$liveAt", "$timeStart"]
                                                    }
                                                },
                                                {
                                                    $expr: {
                                                        $lt: ["$liveAt", "$timeEnd"]
                                                    }
                                                },

                                            ]
                                        },

                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'view',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusView": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'click',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusClick": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $project: {
                                "start": "$timeStart",
                                "end": "$timeEnd",
                                "view": {
                                    $cond: {
                                        if: {
                                            $isArray: "$view"
                                        },
                                        then: {
                                            $size: "$view"
                                        },
                                        else: 0
                                    }
                                },
                                "click": {
                                    $cond: {
                                        if: {
                                            $isArray: "$click"
                                        },
                                        then: {
                                            $size: "$click"
                                        },
                                        else: 0
                                    }
                                },

                            }
                        },
                        {
                            $group: {
                                _id: "Day6",
                                view: {
                                    $sum: "$view"
                                },
                                click: {
                                    $sum: "$click"
                                },
                                timeStart: {
                                    $first: "$start"
                                },
                                timeEndt: {
                                    $first: "$end"
                                },


                            }

                        }
                    ],
                    "day5": [
                        {
                            $set: {
                                "timeStart":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 234000000] // 1 hari 61200000
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $set: {
                                "timeEnd":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 147600000]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'ads',
                                as: 'dodol',
                                let: {
                                    localID: userid
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$userID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "status": "APPROVE"
                                                },
                                                {
                                                    $expr: {
                                                        $gt: ["$liveAt", "$timeStart"]
                                                    }
                                                },
                                                {
                                                    $expr: {
                                                        $lt: ["$liveAt", "$timeEnd"]
                                                    }
                                                },

                                            ]
                                        },

                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'view',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusView": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'click',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusClick": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $project: {
                                "start": "$timeStart",
                                "end": "$timeEnd",
                                "view": {
                                    $cond: {
                                        if: {
                                            $isArray: "$view"
                                        },
                                        then: {
                                            $size: "$view"
                                        },
                                        else: 0
                                    }
                                },
                                "click": {
                                    $cond: {
                                        if: {
                                            $isArray: "$click"
                                        },
                                        then: {
                                            $size: "$click"
                                        },
                                        else: 0
                                    }
                                },

                            }
                        },
                        {
                            $group: {
                                _id: "Day5",
                                view: {
                                    $sum: "$view"
                                },
                                click: {
                                    $sum: "$click"
                                },
                                timeStart: {
                                    $first: "$start"
                                },
                                timeEndt: {
                                    $first: "$end"
                                },


                            }

                        }
                    ],
                    "day4": [
                        {
                            $set: {
                                "timeStart":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 320400000] // 1 hari 61200000
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $set: {
                                "timeEnd":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 234000000]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'ads',
                                as: 'dodol',
                                let: {
                                    localID: userid
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$userID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "status": "APPROVE"
                                                },
                                                {
                                                    $expr: {
                                                        $gt: ["$liveAt", "$timeStart"]
                                                    }
                                                },
                                                {
                                                    $expr: {
                                                        $lt: ["$liveAt", "$timeEnd"]
                                                    }
                                                },

                                            ]
                                        },

                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'view',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusView": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'click',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusClick": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $project: {
                                "start": "$timeStart",
                                "end": "$timeEnd",
                                "view": {
                                    $cond: {
                                        if: {
                                            $isArray: "$view"
                                        },
                                        then: {
                                            $size: "$view"
                                        },
                                        else: 0
                                    }
                                },
                                "click": {
                                    $cond: {
                                        if: {
                                            $isArray: "$click"
                                        },
                                        then: {
                                            $size: "$click"
                                        },
                                        else: 0
                                    }
                                },

                            }
                        },
                        {
                            $group: {
                                _id: "Day4",
                                view: {
                                    $sum: "$view"
                                },
                                click: {
                                    $sum: "$click"
                                },
                                timeStart: {
                                    $first: "$start"
                                },
                                timeEndt: {
                                    $first: "$end"
                                },


                            }

                        }
                    ],
                    "day3": [
                        {
                            $set: {
                                "timeStart":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 406800000] // 1 hari 61200000
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $set: {
                                "timeEnd":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 320400000]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'ads',
                                as: 'dodol',
                                let: {
                                    localID: userid
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$userID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "status": "APPROVE"
                                                },
                                                {
                                                    $expr: {
                                                        $gt: ["$liveAt", "$timeStart"]
                                                    }
                                                },
                                                {
                                                    $expr: {
                                                        $lt: ["$liveAt", "$timeEnd"]
                                                    }
                                                },

                                            ]
                                        },

                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'view',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusView": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'click',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusClick": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $project: {
                                "start": "$timeStart",
                                "end": "$timeEnd",
                                "view": {
                                    $cond: {
                                        if: {
                                            $isArray: "$view"
                                        },
                                        then: {
                                            $size: "$view"
                                        },
                                        else: 0
                                    }
                                },
                                "click": {
                                    $cond: {
                                        if: {
                                            $isArray: "$click"
                                        },
                                        then: {
                                            $size: "$click"
                                        },
                                        else: 0
                                    }
                                },

                            }
                        },
                        {
                            $group: {
                                _id: "Day3",
                                view: {
                                    $sum: "$view"
                                },
                                click: {
                                    $sum: "$click"
                                },
                                timeStart: {
                                    $first: "$start"
                                },
                                timeEndt: {
                                    $first: "$end"
                                },


                            }

                        }
                    ],
                    "day2": [
                        {
                            $set: {
                                "timeStart":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 493200000] // 1 hari 61200000
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $set: {
                                "timeEnd":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 406800000]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'ads',
                                as: 'dodol',
                                let: {
                                    localID: userid
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$userID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "status": "APPROVE"
                                                },
                                                {
                                                    $expr: {
                                                        $gt: ["$liveAt", "$timeStart"]
                                                    }
                                                },
                                                {
                                                    $expr: {
                                                        $lt: ["$liveAt", "$timeEnd"]
                                                    }
                                                },

                                            ]
                                        },

                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'view',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusView": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'click',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusClick": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $project: {
                                "start": "$timeStart",
                                "end": "$timeEnd",
                                "view": {
                                    $cond: {
                                        if: {
                                            $isArray: "$view"
                                        },
                                        then: {
                                            $size: "$view"
                                        },
                                        else: 0
                                    }
                                },
                                "click": {
                                    $cond: {
                                        if: {
                                            $isArray: "$click"
                                        },
                                        then: {
                                            $size: "$click"
                                        },
                                        else: 0
                                    }
                                },

                            }
                        },
                        {
                            $group: {
                                _id: "Day2",
                                view: {
                                    $sum: "$view"
                                },
                                click: {
                                    $sum: "$click"
                                },
                                timeStart: {
                                    $first: "$start"
                                },
                                timeEndt: {
                                    $first: "$end"
                                },


                            }

                        }
                    ],
                    "day1": [
                        {
                            $set: {
                                "timeStart":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 579600000] // 1 hari 61200000
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $set: {
                                "timeEnd":
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d %H:%M:%S",
                                        "date": {
                                            $add: [new Date(), - 493200000]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'ads',
                                as: 'dodol',
                                let: {
                                    localID: userid
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$userID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "status": "APPROVE"
                                                },
                                                {
                                                    $expr: {
                                                        $gt: ["$liveAt", "$timeStart"]
                                                    }
                                                },
                                                {
                                                    $expr: {
                                                        $lt: ["$liveAt", "$timeEnd"]
                                                    }
                                                },

                                            ]
                                        },

                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'view',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusView": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'userads',
                                as: 'click',
                                let: {
                                    localID: '$dodol._id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $eq: ['$adsID', '$$localID']
                                                    }
                                                },
                                                {
                                                    "statusClick": true,

                                                },

                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $project: {
                                "start": "$timeStart",
                                "end": "$timeEnd",
                                "view": {
                                    $cond: {
                                        if: {
                                            $isArray: "$view"
                                        },
                                        then: {
                                            $size: "$view"
                                        },
                                        else: 0
                                    }
                                },
                                "click": {
                                    $cond: {
                                        if: {
                                            $isArray: "$click"
                                        },
                                        then: {
                                            $size: "$click"
                                        },
                                        else: 0
                                    }
                                },

                            }
                        },
                        {
                            $group: {
                                _id: "Day1",
                                view: {
                                    $sum: "$view"
                                },
                                click: {
                                    $sum: "$click"
                                },
                                timeStart: {
                                    $first: "$start"
                                },
                                timeEndt: {
                                    $first: "$end"
                                },

                            }

                        },

                    ],

                }
            },
            {
                $facet: {
                    genders: [
                        {
                            $unwind: {
                                path: "$totaGender",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $unwind: {
                                path: "$gender",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                remark: "$gender._id",
                                range: "$gender.count",
                                percent:
                                {
                                    $multiply:
                                        [
                                            {
                                                $divide:
                                                    [
                                                        "$gender.count",
                                                        {
                                                            $arrayElemAt: ["$totalGender.total", 0]
                                                        }
                                                    ]
                                            },
                                            100
                                        ]
                                },

                            }
                        }
                    ],
                    area: [
                        {
                            $unwind: {
                                path: "$areas",
                                preserveNullAndEmptyArrays: true,

                            }
                        },
                        {
                            $project: {
                                remark: "$areas._id",
                                range: "$areas.count",
                                percent:
                                {
                                    $multiply:
                                        [
                                            {
                                                $divide:
                                                    [
                                                        "$areas.count",
                                                        {
                                                            $arrayElemAt: ["$totalarea.total", 0]
                                                        }
                                                    ]
                                            },
                                            100
                                        ]
                                }
                            }
                        }
                    ],
                    age: [
                        {
                            $unwind: {
                                path: "$age",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                remark: "$age._id",
                                range: "$age.age",
                                percent:
                                {
                                    $multiply:
                                        [
                                            {
                                                $divide:
                                                    [
                                                        "$age.age",
                                                        {
                                                            $arrayElemAt: ["$totalage.total", 0]
                                                        }
                                                    ]
                                            },
                                            100
                                        ]
                                }
                            }
                        }
                    ],
                    all: [
                        {
                            $unwind: {
                                path: "$view",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $unwind: {
                                path: "$click",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                view: "$view.view",
                                click: "$click.click",

                            }
                        }
                    ],
                    day: [

                        {
                            $project: {
                                day1: 1,
                                day2: 1,
                                day3: 1,
                                day4: 1,
                                day5: 1,
                                day6: 1,
                                day7: 1,

                            },

                        },

                    ]
                }
            },
            {
                $project: {
                    genders:
                    {
                        $cond: {
                            if: {
                                $gt: ['$genders.percecnt', 0]
                            },
                            then: "$genders",
                            else: '$kancut'
                        }
                    },
                    all: "$all",
                    area:
                    {
                        $cond: {
                            if: {
                                $gt: ['$area.percent', 0]
                            },
                            then: "$area",
                            else: '$kancut'
                        }
                    },
                    age:
                    {
                        $cond: {
                            if: {
                                $gt: ['$age.percent', 0]
                            },
                            then: "$age",
                            else: '$kancut'
                        }
                    },
                    day: 1,

                }

            }
        ]);
        var resultquery = [];
        resultquery = query[0].area;

        resultquery.forEach(function (data) {
            var getdata = data.percent;
            try {
                data.percent = getdata.toFixed(2);
            } catch (e) {
                data.percent = 0;
            }
        });

        resultquery = query[0].genders;

        resultquery.forEach(function (data) {
            var getdata = data.percent;
            try {
                data.percent = getdata.toFixed(2);
            } catch (e) {
                data.percent = 0;
            }
        });

        resultquery = query[0].age;

        resultquery.forEach(function (data) {
            var getdata = data.percent;
            try {
                data.percent = getdata.toFixed(2);
            } catch (e) {
                data.percent = 0;
            }
        });

        if (query[0].age[0].percent === 0) {
            query[0].age = [];
        }

        if (query[0].genders[0].percent === 0) {
            query[0].genders = [];
        }
        if (query[0].area[0].percent === 0) {
            query[0].area = [];
        }
        return query;
    }

    async countadsuser(iduser: ObjectID) {
        var query = await this.adsModel.aggregate(

            [

                {
                    $match: {
                        userID: iduser
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalpost: {
                            $sum: 1
                        }
                    }
                }
            ]
        );

        return query;
    }

    async getAdsanalyticsgraph(startdate: string, enddate: string) {
        var pipeline = [];

        if (startdate !== undefined && enddate !== undefined) {
            var before = new Date(startdate).toISOString().split("T")[0];
            var input = new Date(enddate);
            input.setDate(input.getDate() + 1);
            var today = new Date(input).toISOString().split("T")[0];

            pipeline.push({
                "$match":
                {
                    timestamp:
                    {
                        "$gte": before,
                        "$lte": today
                    },
                    status: "APPROVE"
                }
            },);
        }
        else {
            pipeline.push({
                "$match":
                {
                    status: "APPROVE"
                }
            },);
        }

        pipeline.push({
            "$project":
            {
                _id: 1,
                createdAt:
                {
                    "$substr":
                        [
                            "$timestamp", 0, 10
                        ]
                },
            }
        },
            {
                "$lookup":
                {
                    "from": "userads",
                    "as": "recordtayang",
                    "let": {
                        "userads_fk": "$_id"
                    },
                    "pipeline":
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                            [
                                                "$adsID",
                                                "$$userads_fk"
                                            ]
                                    },
                                    "$or":
                                        [
                                            {
                                                "$expr":
                                                {
                                                    "$eq":
                                                        [
                                                            "$statusClick", true
                                                        ]
                                                }
                                            },
                                            {
                                                "$expr":
                                                {
                                                    "$eq":
                                                        [
                                                            "$statusView", true
                                                        ]
                                                }
                                            }
                                        ]
                                }
                            },
                            {
                                "$group":
                                {
                                    _id: "$adsID",
                                    datatotalview:
                                    {
                                        "$sum":
                                        {
                                            "$cond":
                                            {
                                                if:
                                                {
                                                    "$eq": ["$statusView", true]
                                                },
                                                then: 1,
                                                else: 0
                                            }
                                        }
                                    },
                                    datatotalclick:
                                    {
                                        "$sum":
                                        {
                                            "$cond":
                                            {
                                                if:
                                                {
                                                    "$eq": ["$statusClick", true]
                                                },
                                                then: 1,
                                                else: 0
                                            }
                                        }
                                    },
                                }
                            }
                        ]
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    createdAt: 1,
                    recordtayang:
                    {
                        "$first": "$recordtayang"
                    }
                }
            },
            {
                "$group":
                {
                    _id: "$createdAt",
                    totaldata:
                    {
                        "$sum": 1
                    },
                    totalview:
                    {
                        "$sum": "$recordtayang.datatotalview"
                    },
                    totalclick:
                    {
                        "$sum": "$recordtayang.datatotalclick"
                    },
                }
            },
            {
                "$sort":
                {
                    _id: 1
                }
            },
            {
                "$group":
                {
                    _id: null,
                    totaldata:
                    {
                        "$sum": "$totaldata"
                    },
                    data:
                    {
                        "$push":
                        {
                            createdAt: "$_id",
                            totalview: "$totalview",
                            totalclick: "$totalclick",
                            //totaldataharian:"$totaldata"
                        }
                    }
                }
            });

        var query = await this.adsModel.aggregate(pipeline);

        return query;
    }

    async getAdsbygender(startdate: string, enddate: string) {
        var pipeline = [];

        if (startdate !== undefined && enddate !== undefined) {
            var before = new Date(startdate).toISOString().split("T")[0];
            var input = new Date(enddate);
            input.setDate(input.getDate() + 1);
            var today = new Date(input).toISOString().split("T")[0];

            pipeline.push({
                "$match":
                {
                    timestamp:
                    {
                        "$gte": before,
                        "$lte": today
                    },
                    status: "APPROVE",
                    demografisID:
                    {
                        "$type": "array"
                    }
                }
            },);
        }
        else {
            pipeline.push({
                "$match":
                {
                    status: "APPROVE",
                    demografisID:
                    {
                        "$type": "array"
                    }
                }
            },);
        }

        pipeline.push({
            "$project":
            {
                _id: 1,
                createdAt:
                {
                    "$substr":
                        [
                            "$timestamp", 0, 10
                        ]
                },
                demografisID: 1
            }
        },
            {
                "$facet":
                {
                    // "data":
                    // [
                    //     {
                    //         "$project":
                    //         {
                    //             _id:1,
                    //             createdAt:1,
                    //             demografisID:1
                    //         }
                    //     }
                    // ],
                    "gender":
                        [
                            {
                                "$lookup":
                                {
                                    "from": "userads",
                                    "as": "recordtayang",
                                    "let": {
                                        "userads_fk": "$_id"
                                    },
                                    "pipeline":
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$expr":
                                                    {
                                                        "$eq":
                                                            [
                                                                "$adsID",
                                                                "$$userads_fk"
                                                            ]
                                                    },
                                                    "$or":
                                                        [
                                                            {
                                                                "$expr":
                                                                {
                                                                    "$eq":
                                                                        [
                                                                            "$statusClick", true
                                                                        ]
                                                                }
                                                            },
                                                            {
                                                                "$expr":
                                                                {
                                                                    "$eq":
                                                                        [
                                                                            "$statusView", true
                                                                        ]
                                                                }
                                                            }
                                                        ]
                                                }
                                            },
                                            {
                                                "$project":
                                                {
                                                    _id: 1,
                                                    userID: 1,
                                                    statusClick: 1,
                                                    statusView: 1,
                                                }
                                            }
                                        ]
                                }
                            },
                            {
                                '$unwind':
                                {
                                    path: "$recordtayang"
                                }
                            },
                            {
                                "$lookup":
                                {
                                    "from": "userbasics",
                                    "as": "recorduser",
                                    "let": {
                                        "userbasic_fk": "$recordtayang.userID"
                                    },
                                    "pipeline":
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$expr":
                                                    {
                                                        "$eq":
                                                            [
                                                                "$_id",
                                                                "$$userbasic_fk"
                                                            ]
                                                    },
                                                }
                                            },
                                            {
                                                "$project":
                                                {
                                                    _id: 1,
                                                    emaiL: 1,
                                                    gender: {
                                                        $switch: {
                                                            branches: [
                                                                {
                                                                    case: {
                                                                        $eq: ['$gender', 'FEMALE']
                                                                    },
                                                                    then: 'FEMALE',

                                                                },
                                                                {
                                                                    case: {
                                                                        $eq: ['$gender', ' FEMALE']
                                                                    },
                                                                    then: 'FEMALE',

                                                                },
                                                                {
                                                                    case: {
                                                                        $eq: ['$gender', 'Perempuan']
                                                                    },
                                                                    then: 'FEMALE',

                                                                },
                                                                {
                                                                    case: {
                                                                        $eq: ['$gender', 'Wanita']
                                                                    },
                                                                    then: 'FEMALE',

                                                                },
                                                                {
                                                                    case: {
                                                                        $eq: ['$gender', 'MALE']
                                                                    },
                                                                    then: 'MALE',

                                                                },
                                                                {
                                                                    case: {
                                                                        $eq: ['$gender', ' MALE']
                                                                    },
                                                                    then: 'MALE',

                                                                },
                                                                {
                                                                    case: {
                                                                        $eq: ['$gender', 'Laki-laki']
                                                                    },
                                                                    then: 'MALE',

                                                                },
                                                                {
                                                                    case: {
                                                                        $eq: ['$gender', 'Pria']
                                                                    },
                                                                    then: 'MALE',

                                                                },

                                                            ],
                                                            default: "OTHER",
                                                        },

                                                    },
                                                }
                                            },
                                        ]
                                }
                            },
                            {
                                "$project":
                                {
                                    recorduser: 1
                                }
                            },
                            {
                                "$group":
                                {
                                    _id:
                                    {
                                        "$first": "$recorduser.gender"
                                    },
                                    total:
                                    {
                                        "$sum": 1
                                    }
                                }
                            }
                        ],
                    "area":
                        [
                            {
                                "$unwind":
                                {
                                    path: "$demografisID"
                                }
                            },
                            {
                                "$project":
                                {
                                    demografisID: 1
                                }
                            },
                            {
                                "$group":
                                {
                                    _id: "$demografisID.$id",
                                    total:
                                    {
                                        "$sum": 1
                                    },
                                }
                            },
                            {
                                "$lookup":
                                {
                                    "from": "areas",
                                    "as": "listdaerah",
                                    "let": {
                                        "area_fk": "$_id"
                                    },
                                    "pipeline":
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$expr":
                                                    {
                                                        "$eq": ["$_id", "$$area_fk"]
                                                    }
                                                }
                                            },
                                        ]
                                }
                            },
                            {
                                "$project":
                                {
                                    _id:
                                    {
                                        "$first": "$listdaerah.stateName"
                                    },
                                    total: 1,
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
                        ]
                }
            });

        var query = await this.adsModel.aggregate(pipeline);

        return query;
    }

    async consolegetlistads(startdate:string, enddate:string, statuslist:any[], mincredit:number, maxcredit:number, page:number, limit:number, sorting:boolean)
    {
        var pipeline = [];

        pipeline.push({
                "$lookup": 
                {
                    "from": "adstypes",
                    "as": "type_data",
                    "let": 
                    {
                        "type_fk": "$typeAdsID"
                    },
                    "pipeline": 
                    [
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$eq":
                                    [
                                        "$_id",
                                        "$$type_fk"
                                    ]
                                }
                            },
                        },
                        {
                            "$project":
                            {
                                nameType:1
                            }
                        }
                    ]
                }
            },
            {
                "$lookup": 
                {
                    "from": "adsplaces",
                    "as": "place_data",
                    "let": 
                    {
                        "place_fk": "$placingID"
                    },
                    "pipeline": 
                    [
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$eq":
                                    [
                                        "$_id",
                                        "$$place_fk"
                                    ]
                                }
                            },
                        },
                        {
                            "$project":
                            {
                                namePlace:1
                            }
                        }
                    ]
                }
            },
            {
                "$project":
                {
                    _id:1,
                    userID:1,
                    typesID:1,
                    type_data:
                    {
                        "$first":"$type_data.nameType"
                    },
                    placingID:1,
                    place_data:
                    {
                        "$first":"$place_data.namePlace"
                    },
                    name:1,
                    status:1,
                    timestamp:1,
                    creditFree:1,
                    totalUsedCredit:1,
                    usedCreditFree:1,
                    usedCredit:1,
                    totalCredit:1,
                    idApsara:1,
                    apsara:{
                        "$cond":
                        {
                            if:
                            {
                                "$eq":["$idApsara", null]
                            },
                            then:false,
                            else:true
                        }
                    },
                    type:1,
                }
            },);
        
        //filter by date range
        if(startdate != undefined && enddate != undefined)
        {
            var before = new Date(startdate).toISOString().split("T")[0];
            var input = new Date(enddate);
            input.setDate(input.getDate() + 1);
            var today = new Date(input).toISOString().split("T")[0];

            pipeline.push({
                "$match":
                {
                    timestamp:
                    {
                        "$gte":before,
                        "$lte":today
                    },
                }
            },);
        }

        //filter by status
        if(statuslist != undefined)
        {
            pipeline.push({
                    "$match":
                    {
                        status:
                        {
                            "$in":statuslist
                        }
                    }
                });
        }

        //filter by totalUsedCredit range 
        if(mincredit != undefined && maxcredit != undefined)
        {
            pipeline.push({
                "$match":
                {
                    totalUsedCredit:
                    {
                        "$gte":mincredit,
                        "$lte":maxcredit
                    },
                }
            },);
        }


        if(sorting == true)
        {
            pipeline.push({
                "$sort":
                {
                    timestamp:-1
                }
            })
        }
        else
        {
            pipeline.push({
                "$sort":
                {
                    timestamp:1
                }
            })
        }

        if(page > 0)
        {
            pipeline.push({
                "$skip":(limit * page)
            });
        }

        if(limit > 0)
        {
            pipeline.push({
                "$limit":limit
            });
        }

        //console.log(JSON.stringify(pipeline));

        var query = await this.adsModel.aggregate(pipeline);

        return query;
    }
}
