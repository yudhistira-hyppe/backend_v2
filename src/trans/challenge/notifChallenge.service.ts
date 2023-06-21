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
        return this.notifChallengeModel.find({ challengeId: new Types.ObjectId(id) }).exec();
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
}
