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

    // async challengeFollow(iduser: string, idref: string, nametable: string) {
    //     await this.authService.userChallengeFollow(iduser, idref, nametable);
    // }
}
