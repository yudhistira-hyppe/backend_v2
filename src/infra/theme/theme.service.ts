import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ThemeDto } from './dto/theme.dto';
import { Theme, ThemeDocument } from './schemas/theme.schema';

@Injectable()
export class ThemeService {
    constructor(
        @InjectModel(Theme.name, 'SERVER_FULL')
        private readonly themeModel: Model<ThemeDocument>,
    ) {}

    async create(ThemeDto_: ThemeDto): Promise<Theme> {
        const _GenreDto_ = await this.themeModel.create(ThemeDto_);
        return _GenreDto_;
    }

    async update(_id: string, ThemeDto_: ThemeDto){
        const _GenreDto_ = this.themeModel.updateOne(
        { _id: Object(_id) },
        ThemeDto_,
        function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        });
    }

    async delete(id: string) {
        this.themeModel.deleteOne({ _id: Object(id) }).exec();
    }

    async filAll(): Promise<ThemeDto[]>{
        return await this.themeModel.find().exec();
    }

    async find(ThemeDto_: ThemeDto): Promise<Theme[]>{
        return await this.themeModel.find(ThemeDto_).exec();
    }

    async findOne(id: string): Promise<Theme> {
        return await this.themeModel.findOne({ _id: Object(id)}).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string, langIso: string): Promise<Theme[]> {
        var perPage = pageRow, page = Math.max(0, pageNumber);
        var where = {};
        if (search != undefined) {
            where['name'] = { $regex: search, $options: "i" };
        }
        where['langIso'] = langIso;
        const query = await this.themeModel.find(where).limit(perPage).skip(perPage * page).sort({ name: 'desc' });
        return query;
    }
}
