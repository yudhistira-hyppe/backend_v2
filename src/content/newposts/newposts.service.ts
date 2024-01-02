import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNewpostsDto } from './dto/create-newposts.dto';
import { Newposts, NewpostsDocument } from './schemas/newposts.schema';
@Injectable()
export class NewpostsService {
    constructor(
        @InjectModel(Newposts.name, 'SERVER_FULL')
        private readonly NewpostsModel: Model<NewpostsDocument>,

    ) { }

    async updatePostviewer(postid: string, email: string) {
        return await this.NewpostsModel.updateOne({ postID: postid }, { $push: { viewer: email } }).exec();
    }

    async findByPostId(id:string)
    {
        return await this.NewpostsModel.findOne({ postID:id }).exec();
    }

    async updateByPostId(id:string, data:Newposts)
    {
        let result = await this.NewpostsModel.findByIdAndUpdate(
        id,
        data,
        { new: true },
        );
    
        if (!data) {
        throw new Error('Todo is not found!');
        }
        return data;        
    }


    // async challengeFollow(iduser: string, idref: string, nametable: string) {
    //     await this.authService.userChallengeFollow(iduser, idref, nametable);
    // }
}
