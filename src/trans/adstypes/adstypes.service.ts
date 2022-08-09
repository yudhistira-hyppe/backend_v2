import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAdstypesDto } from './dto/create-adstypes.dto';
import { Adstypes, AdstypesDocument } from './schemas/adstypes.schema';

@Injectable()
export class AdstypesService {

    constructor(
        @InjectModel(Adstypes.name, 'SERVER_TRANS')
        private readonly adstypesModel: Model<AdstypesDocument>,
    ) { }

    async create(CreateAdstypesDto: CreateAdstypesDto): Promise<Adstypes> {
        let data = await this.adstypesModel.create(CreateAdstypesDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Adstypes[]> {
        return this.adstypesModel.find().exec();
    }

    async findOne(id: Object): Promise<Adstypes> {
        return this.adstypesModel.findOne({ _id: id }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.adstypesModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async update(
        id: string,
        createAdstypesDto: CreateAdstypesDto,
    ): Promise<Adstypes> {
        let data = await this.adstypesModel.findByIdAndUpdate(
            id,
            createAdstypesDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

}
