import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Challenge, challengeDocument } from './schemas/challenge.schema';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge.name, 'SERVER_FULL')
    private readonly ChallengeModel: Model<challengeDocument>,
  ) { }

  async create(Challenge_: Challenge): Promise<Challenge> {
    const _Challenge_ = await this.ChallengeModel.create(Challenge_);
    return _Challenge_;
  }

  async findOne(id: string): Promise<Challenge> {
    return this.ChallengeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async find(): Promise<Challenge[]> {
    return this.ChallengeModel.find().exec();
  }

  async update(id: string, Challenge_: Challenge): Promise<Challenge> {
    let data = await this.ChallengeModel.findByIdAndUpdate(id, Challenge_, { new: true });
    if (!data) {
      throw new Error('Data is not found!');
    }
    return data;
  }

  async delete(id: string) {
    const data = await this.ChallengeModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
    return data;
  }
  async challengeReferal() {
    var query = await this.ChallengeModel.aggregate([


      {
        $project: {
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": {
            $arrayElemAt: ['$metrik.Aktivitas', 0]
          },
          "Interaksi": {
            $arrayElemAt: ['$metrik.Interaksi', 0]
          },
          "AktivitasAkun": {
            $arrayElemAt: ['$metrik.AktivitasAkun', 0]
          },

        }
      },
      {
        $project: {
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": 1,
          "Interaksi": 1,
          "poinReferal": {
            $arrayElemAt: ['$AktivitasAkun.Referal', 0]
          },
          "poinFollow": {
            $arrayElemAt: ['$AktivitasAkun.Ikuti', 0]
          },

        }
      },
      {
        $match: { "poinReferal": { $ne: null } }
      }
    ]);
    return query;
  }
}
