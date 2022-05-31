import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGetuserprofilesDto } from './dto/create-getuserprofiles.dto';
import { Getuserprofiles, GetuserprofilesDocument } from './schemas/getuserprofiles.schema';

@Injectable()
export class GetuserprofilesService {
  constructor(
    @InjectModel(Getuserprofiles.name, 'SERVER_TRANS')
    private readonly getuserprofilesModel: Model<GetuserprofilesDocument>,
  ) {}

  async create(
    CreateGetuserprofilesDto: CreateGetuserprofilesDto,
  ): Promise<Getuserprofiles> {
    const createGetuserprofilesDto = await this.getuserprofilesModel.create(
      CreateGetuserprofilesDto,
    );
    return createGetuserprofilesDto;
  }

  async findAll(documentsToSkip = 0, limitOfDocuments?: number) {
    const query = this.getuserprofilesModel
      .find()
      .sort({ _id: 1 })
      .skip(documentsToSkip);
    if (limitOfDocuments) {
      query.limit(limitOfDocuments);
    }
    return query;
  }
  async findAlls(): Promise<Getuserprofiles[]> {
    return this.getuserprofilesModel.find().exec();
  }
  async findfullname(fullName: String): Promise<Getuserprofiles> {
    return this.getuserprofilesModel.findOne({ fullName: fullName }).exec();
  }
  async findgender(gender: String): Promise<Getuserprofiles> {
    return this.getuserprofilesModel.findOne({ gender: gender }).exec();
  }
  async findfullnamegender(
    fullName: String,
    gender: String,
  ): Promise<Getuserprofiles> {
    return this.getuserprofilesModel
      .findOne({ fullName: fullName, gender: gender })
      .exec();
  }

  async findTypeAkun(
    fullName: String,
    roles: String,
  ): Promise<Getuserprofiles> {
    return this.getuserprofilesModel
      .findOne({ fullName: fullName, roles: roles })
      .exec();
  }

  async findroles(roles: String): Promise<Getuserprofiles> {
    return this.getuserprofilesModel.findOne({ roles: roles }).exec();
  }
  async findfullnameroles(
    fullName: String,
    roles: String,
  ): Promise<Getuserprofiles> {
    return this.getuserprofilesModel
      .findOne({ fullName: fullName, roles: roles })
      .exec();
  }
  async findfullnamegenderroles(
    fullName: String,
    roles: String,
    gender: String,
  ): Promise<Getuserprofiles> {
    return this.getuserprofilesModel
      .findOne({ fullName: fullName, roles: roles, gender: gender })
      .exec();
  }
  async findgenderroles(
    roles: String,
    gender: String,
  ): Promise<Getuserprofiles> {
    return this.getuserprofilesModel
      .findOne({ roles: roles, gender: gender })
      .exec();
  }
  async findumur(dob: String): Promise<Getuserprofiles> {
    return this.getuserprofilesModel.findOne({ dob: dob }).exec();
  }
  async delete(id: string) {
    const deletedCat = await this.getuserprofilesModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
