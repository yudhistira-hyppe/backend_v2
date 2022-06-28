import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateFaqdetailsDto } from './dto/create-faqdetails.dto';
import { Faqdetails, FaqdetailsDocument } from './schemas/faqdetails.schema';
@Injectable()
export class FaqdetailsService {
    constructor(
        @InjectModel(Faqdetails.name, 'SERVER_TRANS')
        private readonly faqdetailsModel: Model<FaqdetailsDocument>,

    ) { }
    async create(CreateFaqdetailsDto: CreateFaqdetailsDto): Promise<Faqdetails> {
        let data = await this.faqdetailsModel.create(CreateFaqdetailsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async update(
        id: string,
        createFaqdetailsDto: CreateFaqdetailsDto,
    ): Promise<Faqdetails> {
        let data = await this.faqdetailsModel.findByIdAndUpdate(
            id,
            createFaqdetailsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const deletedCat = await this.faqdetailsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }
}
