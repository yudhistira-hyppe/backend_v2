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
}
