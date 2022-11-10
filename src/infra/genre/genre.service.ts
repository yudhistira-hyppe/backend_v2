import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GenreDto } from './dto/genre.dto';
import { Genre, GenreDocument } from './schemas/genre.schema';

@Injectable()
export class GenreService {
    constructor(
        @InjectModel(Genre.name, 'SERVER_FULL')
        private readonly genreModel: Model<GenreDocument>,
    ) {}

    async create(GenreDto_: GenreDto): Promise<Genre> {
        const _GenreDto_ = await this.genreModel.create(GenreDto_);
        return _GenreDto_;
    }

    async update(_id: string, GenreDto_: GenreDto){
        const _GenreDto_ = this.genreModel.updateOne(
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
        this.genreModel.deleteOne({ _id: Object(id) }).exec();
    }

    async filAll(): Promise<Genre[]>{
        return await this.genreModel.find().exec();
    }

    async find(GenreDto_: GenreDto): Promise<Genre[]>{
        return await this.genreModel.find(GenreDto_).exec();
    }

    async findOne(id: string): Promise<Genre> {
        return await this.genreModel.findOne({ _id: Object(id)}).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string): Promise<Genre[]> {
        var perPage = pageRow, page = Math.max(0, pageNumber);
        var where = {};
        if (search != undefined) {
            where['name'] = { $regex: search, $options: "i" };
        }
        const query = await this.genreModel.find(where).limit(perPage).skip(perPage * page).sort({ name: 'desc' });
        return query;
    }
}
