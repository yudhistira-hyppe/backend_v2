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
import { AppGateway } from '../socket/socket.gateway';

@Injectable()
export class DisqusService {

    private readonly logger = new Logger(DisqusService.name);

    constructor(
        @InjectModel(Disqus.name, 'SERVER_FULL')
        private readonly DisqusModel: Model<DisqusDocument>,
        private utilsService: UtilsService,
        private disquslogsService: DisquslogsService,
        private disqconService: DisquscontactsService,
        private userService: UserbasicsService,
        private gtw: AppGateway,
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
        return this.DisqusModel.findOne({ _id: id }).exec();
    }

    async sendDMNotif(room: string, payload: string) {
        return this.gtw.room(room, payload);
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
        } else {
            throw new NotAcceptableException({
                response_code: 406,
                messages: {
                    info: ['Unabled to proceed, Disqus not found'],
                },
            });
        }
    }

    // async finddisqus() {
    //   const query = await this.DisqusModel.aggregate([

    //     {
    //       $lookup: {
    //         from: 'disqus',
    //         localField: 'disqus.$id',
    //         foreignField: '_id',
    //         as: 'roless',
    //       },
    //     }, {
    //       $out: {
    //         db: 'hyppe_trans_db',
    //         coll: 'disqus2'
    //       }
    //     },

    //   ]);
    //   return query;
    // }

    async findDisqusByPost(postId: string, eventType: string): Promise<Disqus[]> {
        return await this.DisqusModel.find().where('postID', postId).where('eventType', eventType).exec();
    }

    async findDisqusByPost_(postId: string, eventType: string): Promise<Disqus> {
        //return await this.DisqusModel.findOne().where('email', email).where('postID', postId).where('eventType', eventType).exec();
        return await this.DisqusModel.findOne().where('postID', postId).where('eventType', eventType).where('active', true).exec();
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
        let contact: Disquscontacts[] = [];
        if (body.receiverParty != undefined) {
            contact = await this.disqconService.findDisqusByEmail(body.email);
        } else {
            contact = await this.disqconService.findByEmailAndMate(body.email, body.receiverParty);
        }

        return contact;
    }

    async queryDiscussV2(email: string) {
        let query = await this.DisqusModel.aggregate(

            [
                {
                    $match: 
                    {
                        $or: [
                            {
                                $and: [
                                    {
                                        "email": email
                                    },
                                    {
                                        "eventType": "DIRECT_MSG"
                                    },
                                    {
                                        "emailActive": true
                                    },
                                    
                                ]
                            },
                            {
                                $and: [
                                    {
                                        "mate": email
                                    },
                                    {
                                        "eventType": "DIRECT_MSG"
                                    },
                                    {
                                        "mateActive": true
                                    },
                                    
                                ]
                            },
                            
                        ]
                    },
                    
                },
                {
                    $lookup: {
                        from: 'userbasics',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'userUserBasic',
                        
                    },
                    
                },
                {
                    $lookup: {
                        from: 'userauths',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'userUserAuth',
                        
                    },
                    
                },
                {
                    "$lookup": {
                        from: "mediaprofilepicts",
                        as: "avatar",
                        let: {
                            localID: '$userUserBasic.profilePict.$id'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    
                                    
                                    $expr: {
                                        $in: ['$mediaID', '$$localID']
                                    }
                                }
                            },
                            {
                                $project: {
                                    "mediaBasePath": 1,
                                    "mediaUri": 1,
                                    "originalName": 1,
                                    "fsSourceUri": 1,
                                    "fsSourceName": 1,
                                    "fsTargetUri": 1,
                                    "mediaType": 1,
                                    "mediaEndpoint": {
                                        "$concat": ["/profilepict/", "$mediaID"]
                                    }
                                }
                            }
                        ],
                        
                    }
                },
                {
                    $lookup: {
                        from: 'userbasics',
                        localField: 'mate',
                        foreignField: 'email',
                        as: 'mateUserBasic',
                        
                    },
                    
                },
                {
                    $lookup: {
                        from: 'userauths',
                        localField: 'mate',
                        foreignField: 'email',
                        as: 'mateUserAuth',
                        
                    },
                    
                },
                {
                    "$lookup": {
                        from: "mediaprofilepicts",
                        as: "mateAvatar",
                        let: {
                            localID: '$mateUserBasic.profilePict.$id'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    
                                    $expr: {
                                        $in: ['$mediaID', '$$localID']
                                    }
                                }
                            },
                            {
                                $project: {
                                    "mediaBasePath": 1,
                                    "mediaUri": 1,
                                    "originalName": 1,
                                    "fsSourceUri": 1,
                                    "fsSourceName": 1,
                                    "fsTargetUri": 1,
                                    "mediaType": 1,
                                    "mediaEndpoint": {
                                        "$concat": ["/profilepict/", "$mediaID"]
                                    }
                                }
                            }
                        ],
                        
                    }
                },


                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "disqusLogs",
                        let: {
                            localID: '$disqusLogs.$id'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },
                                                
                                            ]
                                        },
                                        
                                    ]
                                },
                                
                            },
                            {
                                $match : 
                                {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $or: [
                                                        { 'senderActive': true},
                                                        {'senderActive':null},
                                                    ]
                                                },
                                                {
                                                    'sender':'ilhamarahman97@gmail.com'
                                                }
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $or: [
                                                        {
                                                            'receiverActive': true
                                                        },
                                                        {
                                                            'receiverActive': null
                                                        },
                                                    ]
                                                },
                                                {
                                                    'receiver': 'ilhamarahman97@gmail.com'
                                                }
                                            ]
                                        },
                                    ]
                                },
                            },
                            
                            {
                                $sort: {
                                    "createdAt": 1
                                }
                            },
                            
                        ],
                        
                    },
                    
                },                


                {
                    $lookup: {
                        from: 'reactions_repo',
                        as: 'emot',
                        let: {
                            localID: '$disqusLogs.reactionUri'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    $or: [
                                        {
                                            $expr: {
                                                $in: ['$URL', '$$localID']
                                            }
                                        },
                                        
                                    ]
                                }
                            },
                            
                        ],
                        
                    },
                    
                },
                {
                    $unwind: {
                        path: "$userUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$userUserAuth",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$mateUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$mateUserAuth",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$avatar",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$mateAvatar",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        "emailActive": 1,
                        "email": 
                        {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$email",
                                else : '$mate'
                            }
                        },
                        "username": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserAuth.username",
                                else : '$mateUserAuth.username'
                            }
                        },
                        "fullName": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserBasic.fullName",
                                else : '$mateUserBasic.fullName'
                            }
                        },
                        "avatar": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$avatar",
                                else : '$mateAvatar'
                            }
                        },
                        "updatedAt": 1,
                        "lastestMessage": 1,
                        "disqusID": 1,
                        "room": 1,
                        "mateActive": 1,
                        "createdAt": 1,
                        "active": 1,
                        "eventType": 1,
                        "emot": 1,
                        "disqusLogs": "$disqusLogs",
                        "senderOrReceiverInfo": 
                        {
                            "email": 
                            {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$email",
                                    else : '$mate'
                                }
                            },
                            "username": 
                                {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserAuth.username",
                                    else : '$mateUserAuth.username'
                                }
                            },
                            "fullName": 
                                {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserBasic.fullName",
                                    else : '$mateUserBasic.fullName'
                                }
                            },
                            "avatar": 
                                {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$avatar",
                                    else : '$mateAvatar'
                                }
                            },
                            
                        },
                        
                    }
                },
                {
                    $sort: {
                        "updatedAt": -1
                    }
                },
                
            ]

        ).exec();

        return query;
    }

    async queryDiscussV2ByDisqusIs(id: string, email: string) {
        let query = await this.DisqusModel.aggregate(

            [
                {
                    $match: 
                    {
                        disqusID: id
                    },
                    
                },
                {
                    $lookup: {
                        from: 'userbasics',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'userUserBasic',
                        
                    },
                    
                },
                {
                    $lookup: {
                        from: 'userauths',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'userUserAuth',
                        
                    },
                    
                },
                {
                    "$lookup": {
                        from: "mediaprofilepicts",
                        as: "avatar",
                        let: {
                            localID: '$userUserBasic.profilePict.$id'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    
                                    
                                    $expr: {
                                        $in: ['$mediaID', '$$localID']
                                    }
                                }
                            },
                            {
                                $project: {
                                    "mediaBasePath": 1,
                                    "mediaUri": 1,
                                    "originalName": 1,
                                    "fsSourceUri": 1,
                                    "fsSourceName": 1,
                                    "fsTargetUri": 1,
                                    "mediaType": 1,
                                    "mediaEndpoint": {
                                        "$concat": ["/profilepict/", "$mediaID"]
                                    }
                                }
                            }
                        ],
                        
                    }
                },
                {
                    $lookup: {
                        from: 'userbasics',
                        localField: 'mate',
                        foreignField: 'email',
                        as: 'mateUserBasic',
                        
                    },
                    
                },
                {
                    $lookup: {
                        from: 'userauths',
                        localField: 'mate',
                        foreignField: 'email',
                        as: 'mateUserAuth',
                        
                    },
                    
                },
                {
                    "$lookup": {
                        from: "mediaprofilepicts",
                        as: "mateAvatar",
                        let: {
                            localID: '$mateUserBasic.profilePict.$id'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    
                                    $expr: {
                                        $in: ['$mediaID', '$$localID']
                                    }
                                }
                            },
                            {
                                $project: {
                                    "mediaBasePath": 1,
                                    "mediaUri": 1,
                                    "originalName": 1,
                                    "fsSourceUri": 1,
                                    "fsSourceName": 1,
                                    "fsTargetUri": 1,
                                    "mediaType": 1,
                                    "mediaEndpoint": {
                                        "$concat": ["/profilepict/", "$mediaID"]
                                    }
                                }
                            }
                        ],
                        
                    }
                },
                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "disqusLogs",
                        let: {
                            localID: '$disqusLogs.$id'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },
                                                {
                                                    "senderActive": {
                                                        $ne:false
                                                    }
                                                },
                                                {
                                                    "recieverActive": {
                                                        $ne:false
                                                    }
                                                }
                                                
                                            ]
                                        },
                                        
                                    ]
                                },
                                
                            },
                            {
                                $project: {
                                    "createdAt": 1,
                                    "reactionUri": 1,
                                    "txtMessages": 1,
                                    "receiver": 1,
                                    "postType": 1,
                                    "sender": 1,
                                    "lineID": 1,
                                    "active": 1,
                                    "disqusID": 1,
                                    "updatedAt": 1,
                                    "reaction_icon": "$emot.icon",
                                    "content":"$medias",
                                }
                            },
                            {
                                $sort: {
                                    "createdAt": 1
                                }
                            },
                            
                        ],
                        
                    },
                    
                },
                {
                    $lookup: {
                        from: 'reactions_repo',
                        as: 'emot',
                        let: {
                            localID: '$disqusLogs.reactionUri'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    $or: [
                                        {
                                            $expr: {
                                                $in: ['$URL', '$$localID']
                                            }
                                        },
                                        
                                    ]
                                }
                            },
                            
                        ],
                        
                    },
                    
                },
                {
                    $unwind: {
                        path: "$userUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$userUserAuth",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$mateUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$mateUserAuth",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$avatar",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$mateAvatar",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        "emailActive": 1,
                        "email": 
                        {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$email",
                                else : '$mate'
                            }
                        },
                        "username": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserAuth.username",
                                else : '$mateUserAuth.username'
                            }
                        },
                        "fullName": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserBasic.fullName",
                                else : '$mateUserBasic.fullName'
                            }
                        },
                        "avatar": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$avatar",
                                else : '$mateAvatar'
                            }
                        },
                        "updatedAt": 1,
                        "lastestMessage": 1,
                        "disqusID": 1,
                        "room": 1,
                        "mateActive": 1,
                        "createdAt": 1,
                        "active": 1,
                        "eventType": 1,
                        "emot": 1,
                        "disqusLogs": "$disqusLogs",
                        "senderOrReceiverInfo": 
                        {
                            "email": 
                            {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$email",
                                    else : '$mate'
                                }
                            },
                            "username": 
                                {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserAuth.username",
                                    else : '$mateUserAuth.username'
                                }
                            },
                            "fullName": 
                                {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserBasic.fullName",
                                    else : '$mateUserBasic.fullName'
                                }
                            },
                            "avatar": 
                                {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$avatar",
                                    else : '$mateAvatar'
                                }
                            },
                            
                        },
                        
                    }
                },
                {
                    $sort: {
                        "createdAt": - 1
                    }
                },
                
            ]

        ).exec();

        return query;
    }    
}
