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
    @InjectModel(Jwtrefreshtoken.name, 'SERVER_FULL')
    private readonly jwtrefreshtokenModel: Model<JwtrefreshtokenDocument>,
    private userauthsService: UserauthsService,
  ) { }

  async create(
    CreateJwtrefreshtokenDto: CreateJwtrefreshtokenDto,
  ): Promise<Jwtrefreshtoken> {
    const createJwtrefreshtokenDto = await this.jwtrefreshtokenModel.create(
      CreateJwtrefreshtokenDto,
    );
    return createJwtrefreshtokenDto;
  }

  async findAll(): Promise<Jwtrefreshtoken[]> {
    return this.jwtrefreshtokenModel.find().exec();
  }

  async findOne(email: string): Promise<Jwtrefreshtoken> {
    return this.jwtrefreshtokenModel
      .findOne({ email: email })
      .exec();
  }

  async findByEmailRefreshToken(
    email: string,
    refresh_token_id: string,
  ): Promise<Jwtrefreshtoken> {
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

  async saveorupdateRefreshToken(
    refresh_token_id: string,
    email: string,
    exp,
    iat,
  ) {
    var user = await this.findOne(email);
    if (!user) {
      var data_user = await this.userauthsService.findOne(email);
      var data = new CreateJwtrefreshtokenDto();
      data.refresh_token_id = refresh_token_id;
      data.email = email;
      data.exp = exp;
      data.iat = iat;
      data._class = 'io.melody.core.domain.JwtRefreshToken';
      data.userAuth = {
        $ref: 'userauths',
        $id: Object(data_user._id),
      };
      await this.jwtrefreshtokenModel.create(data);
    } else {
      await this.jwtrefreshtokenModel.updateOne(
        { email: email },
        {
          refresh_token_id: refresh_token_id,
          exp: exp,
          iat: iat,
        },
      );
    }
  }

  async removeRefreshToken(email: string) {
    this.jwtrefreshtokenModel.updateOne(
      { email: email },
      { refresh_token_id: null },
    );
  }
}
