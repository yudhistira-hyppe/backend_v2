import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateAssetsFilterDto } from './dto/create-assets-filter.dto';
import { AssetsFilter, AssetsFilterDocument } from './schemas/assets-filter.schema';

@Injectable()
export class AssetsFilterService {

    constructor(
        @InjectModel(AssetsFilter.name, 'SERVER_FULL')
        private readonly sourceFilterModel: Model<AssetsFilterDocument>,
    ) {}

    async create(CreateAssetsFilterDto_: CreateAssetsFilterDto): Promise<AssetsFilter> {
        return this.sourceFilterModel.create(CreateAssetsFilterDto_ );
    }

    async find(assetsUser: mongoose.Types.ObjectId[]): Promise<AssetsFilter[]> {
        console.log(assetsUser);
        return this.sourceFilterModel.find({ _id: { $nin: assetsUser } });
    }
}
