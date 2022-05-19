import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateJwtrefreshtokenDto } from './dto/create-jwtrefreshtoken.dto';
import { Jwtrefreshtoken, JwtrefreshtokenDocument } from './schemas/jwtrefreshtoken.schema';

@Injectable()
export class JwtrefreshtokenService {

    constructor(
        @InjectModel(Jwtrefreshtoken.name) private readonly jwtrefreshtokenModel: Model<JwtrefreshtokenDocument>,
      ) {}
     
      async create(CreateJwtrefreshtokenDto: CreateJwtrefreshtokenDto): Promise<Jwtrefreshtoken> {
        const createJwtrefreshtokenDto = await this.jwtrefreshtokenModel.create(CreateJwtrefreshtokenDto);
        return createJwtrefreshtokenDto;
      }
    
      async findAll(): Promise<Jwtrefreshtoken[]> {
        return this.jwtrefreshtokenModel.find().exec();
      }
      

      async findOne(email: string): Promise<Jwtrefreshtoken> {
        return this.jwtrefreshtokenModel.findOne({ email: email }).exec();
      }
    
      async delete(id: string) {
        const deletedCat = await this.jwtrefreshtokenModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }

      async saveorupdateRefreshToken(refresh_token_id:string, email:String, exp){
        console.log(exp);
        console.log(email);
        var _class = "nest.js.JwtRefreshToken";
        await this.jwtrefreshtokenModel.updateOne({email:email,_class:_class},{refresh_token_id:refresh_token_id,exp:exp.getTime()});
      }
}
