import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Mediastiker, MediastikerDocument } from './schemas/mediastiker.schema';
import { first, pipe } from 'rxjs';

@Injectable()
export class MediastikerService {

    constructor(
        @InjectModel(Mediastiker.name, 'SERVER_FULL')
        private readonly MediastikerModel: Model<MediastikerDocument>,
    ) { }

    async create(Mediastiker_: Mediastiker): Promise<Mediastiker> {
        const _Mediastiker_ = await this.MediastikerModel.create(Mediastiker_);
        return _Mediastiker_;
    }

    async findOne(id: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }
    async findByname(name: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ name: name }).exec();
    }
    async findOne2(id: string) {
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(id);

        var pipeline = [];
        pipeline.push({
            "$match":
            {
                _id: konvertid
            }
        },
        );

        var query = await this.MediastikerModel.aggregate(pipeline);

        return query[0];
    }

    async find(): Promise<Mediastiker[]> {
        return this.MediastikerModel.find().exec();
    }

    async update(id: string, Mediastiker_: Mediastiker): Promise<Mediastiker> {
        let data = await this.MediastikerModel.findByIdAndUpdate(id, Mediastiker_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const data = await this.MediastikerModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }
    async updateNonactive(id: string): Promise<Object> {
        let data = await this.MediastikerModel.updateOne({ "_id": id },
            {
                $set: {
                    "isDelete": true
                }
            });
        return data;
    }



}
