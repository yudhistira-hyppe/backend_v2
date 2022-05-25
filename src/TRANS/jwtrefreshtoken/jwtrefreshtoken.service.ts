import { HttpException, HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateJwtrefreshtokenDto } from './dto/create-jwtrefreshtoken.dto';
import { Jwtrefreshtoken, JwtrefreshtokenDocument } from './schemas/jwtrefreshtoken.schema';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { UserauthsService } from '../userauths/userauths.service';
import { Userbasic } from '../userbasics/schemas/userbasic.schema';

@Injectable()
export class JwtrefreshtokenService {
  constructor(
    @InjectModel(Jwtrefreshtoken.name)
    private readonly jwtrefreshtokenModel: Model<JwtrefreshtokenDocument>,
    private userauthsService: UserauthsService,
  ) {}

  async create(
    CreateJwtrefreshtokenDto: CreateJwtrefreshtokenDto,
  ): Promise<Jwtrefreshtoken> {
    const createJwtrefreshtokenDto = await this.jwtrefreshtokenModel.create(
      CreateJwtrefreshtokenDto,
    );
    return createJwtrefreshtokenDto;
  }

  async findAll(): Promise<Jwtrefreshtoken[]> {
    var _class = 'nest.js.JwtRefreshToken';
    return this.jwtrefreshtokenModel.find({ _class: _class }).exec();
  }

  async findOne(email: string): Promise<Jwtrefreshtoken> {
    var _class = 'nest.js.JwtRefreshToken';
    return this.jwtrefreshtokenModel
      .findOne({ email: email, _class: _class })
      .exec();
  }

  async findByEmailRefreshToken(
    email: string,
    refresh_token_id: string,
  ): Promise<Jwtrefreshtoken> {
    var _class = 'nest.js.JwtRefreshToken';
    return this.jwtrefreshtokenModel
      .findOne({ email: email, refresh_token_id: refresh_token_id })
      .exec();
  }

  async delete(id: string) {
    const deletedCat = await this.jwtrefreshtokenModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async saveorupdateRefreshToken(refresh_token_id: string, email: string, exp,iat) {
    var _class = 'nest.js.JwtRefreshToken';
    var user = await this.findOne(email);
    if (!user) {
      var data_user = await this.userauthsService.findOne(email);
      var data = new CreateJwtrefreshtokenDto();
      data.refresh_token_id = refresh_token_id;
      data.email = email;
      data.exp = exp.getTime();
      data.userAuth = 'DBRef("userauths", ObjectId("' + data_user._id + '"))';
      data._class = _class;
      await this.jwtrefreshtokenModel.create(data);
    } else {
      await this.jwtrefreshtokenModel.updateOne(
        { email: email, _class: _class },
        {
          refresh_token_id: refresh_token_id,
          exp: exp,
          iat: iat,
        },
      );
    }
  }

  async removeRefreshToken(email: string) {
    var _class = 'nest.js.JwtRefreshToken';
    return this.jwtrefreshtokenModel.updateOne(
      { email: email, _class: _class },
      { refresh_token_id: null },
    );
  }
}
