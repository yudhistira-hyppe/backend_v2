import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDocumentsDto } from './dto/create-documents.dto';
import { Documents, DocumentsDocument } from './schemas/documents.schema';
@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Documents.name, 'SERVER_INFRA')
    private readonly documentsModel: Model<DocumentsDocument>,
  ) {}

  async create(CreateDocumentsDto: CreateDocumentsDto): Promise<Documents> {
    const createDocumentsDto = await this.documentsModel.create(
      CreateDocumentsDto,
    );
    return createDocumentsDto;
  }

  async findAll(): Promise<Documents[]> {
    return this.documentsModel.find().exec();
  }

  async findOne(id: string): Promise<Documents> {
    return this.documentsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.documentsModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
