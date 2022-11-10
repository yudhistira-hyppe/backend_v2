import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MoodDto } from './dto/mood.dto';
import { Mood, MoodDocument } from './schemas/mood.schema';

@Injectable()
export class MoodService {
    constructor(
        @InjectModel(Mood.name, 'SERVER_FULL')
        private readonly moodModel: Model<MoodDocument>,
    ) {}

    async create(GenreDto_: MoodDto): Promise<Mood> {
        const _GenreDto_ = await this.moodModel.create(GenreDto_);
        return _GenreDto_;
    }

    async update(_id: string, GenreDto_: MoodDto){
        const _GenreDto_ = this.moodModel.updateOne(
        { _id: Object(_id) },
        GenreDto_,
        function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        });
    }

    async delete(id: string) {
        this.moodModel.deleteOne({ _id: Object(id) }).exec();
    }

    async filAll(): Promise<Mood[]>{
        return await this.moodModel.find().exec();
    }

    async find(GenreDto_: MoodDto): Promise<Mood[]>{
        return await this.moodModel.find(GenreDto_).exec();
    }

    async findOne(id: string): Promise<Mood> {
        return await this.moodModel.findOne({ _id: Object(id)}).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string, langIso: string): Promise<Mood[]> {
        var perPage = pageRow, page = Math.max(0, pageNumber);
        var where = {};
        if (search != undefined) {
            where['name'] = { $regex: search, $options: "i" };
        }
        where['langIso'] = langIso;
        const query = await this.moodModel.find(where).limit(perPage).skip(perPage * page).sort({ name: 'desc' });
        return query;
    }
}
