import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Postchallenge, PostchallengeDocument } from './schemas/postchallenge.schema';

@Injectable()
export class PostchallengeService {

    constructor(
        @InjectModel(Postchallenge.name, 'SERVER_FULL')
        private readonly PostchallengeModel: Model<PostchallengeDocument>,
    ) { }

    async create(Postchallenge_: Postchallenge): Promise<Postchallenge> {
        const _Postchallenge_ = this.PostchallengeModel.create(Postchallenge_);
        return _Postchallenge_;
    }

    async findOne(id: string): Promise<Postchallenge> {
        return this.PostchallengeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async findBypostID(postID: string, idChallenge: string): Promise<Postchallenge> {
        return this.PostchallengeModel.findOne({ postID: postID, idChallenge: new mongoose.Types.ObjectId(idChallenge) }).exec();
    }
    async findBypostID2(postID: string): Promise<Postchallenge> {
        return this.PostchallengeModel.findOne({ postID: postID }).exec();
    }
    async findBypostIDnew(postID: string, idChallenge: string, idSubChallenge: string): Promise<Postchallenge> {
        return this.PostchallengeModel.findOne({ postID: postID, idChallenge: new mongoose.Types.ObjectId(idChallenge), idSubChallenge: new mongoose.Types.ObjectId(idSubChallenge) }).exec();
    }
    async findOneBypostid(postID: string) {

        var pipeline = [];
        pipeline.push({
            "$match":
            {
                postID: postID
            }
        },
        );

        var query = await this.PostchallengeModel.aggregate(pipeline);

        return query;
    }

    async find(): Promise<Postchallenge[]> {
        return this.PostchallengeModel.find().exec();
    }
    async updatePostchallenge2(id: string, updatedAt: string, score: number): Promise<Object> {
        let data = await this.PostchallengeModel.updateOne({ "_id": new Types.ObjectId(id), },
            {
                $set: {
                    "score": score,
                    "updatedAt": updatedAt,

                }
            });
        return data;
    }
    async update(id: string, Postchallenge_: Postchallenge): Promise<Postchallenge> {
        let data = await this.PostchallengeModel.findByIdAndUpdate(id, Postchallenge_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }


    async updateByUSer(id: string, idSubChallenge: string, idChallenge: string, postid: string): Promise<Object> {
        let data = await this.PostchallengeModel.updateOne({ "_id": new Types.ObjectId(id), idChallenge: new Types.ObjectId(idChallenge), idSubChallenge: new Types.ObjectId(idSubChallenge), postID: postid },
            {
                $set: {
                    "score": 0

                }
            });
        return data;
    }

    async updatebYpostID(postID: string, Postchallenge_: Postchallenge): Promise<Postchallenge> {
        let data = await this.PostchallengeModel.findByIdAndUpdate(postID, Postchallenge_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async updatePostchallenge(id: string, score: number) {
        this.PostchallengeModel.updateOne(
            {

                _id: new Types.ObjectId(id),
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

    async updateUnchallnge(id: string, score: number) {
        this.PostchallengeModel.updateOne(
            {

                _id: new Types.ObjectId(id),
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

    async findByUserandChallenge(idchallenge:string, iduser:string)
    {
        var mongo = require('mongoose');
        var query = await this.PostchallengeModel.aggregate([
            {
                "$match":
                {
                    "$and":
                    [
                        {
                            "idChallenge": new mongo.Types.ObjectId(idchallenge)
                        },
                        {
                            "idUser": new mongo.Types.ObjectId(iduser)
                        }
                    ]
                }
            }
        ]);

        return query;
    }
}
