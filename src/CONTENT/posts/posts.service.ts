import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostsDto } from './dto/create-posts.dto';
import { Posts, PostsDocument } from './schemas/posts.schema';


@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Posts.name) private readonly PostsModel: Model<PostsDocument>,
      ) {}
     
      async create(CreatePostsDto: CreatePostsDto): Promise<Posts> {
        const createPostsDto = await this.PostsModel.create(CreatePostsDto);
        return createPostsDto;
      }
    
      async findAll(): Promise<Posts[]> {
        return this.PostsModel.find().exec();
      }
      

    //    async findOne(id: string): Promise<Posts> {
    //     return this.PostsModel.findOne({ _id: id }).exec();
    //   }
    async findOne(email: string): Promise<Posts> {
        return this.PostsModel.findOne({ email: email }).exec();
      }
      async delete(id: string) {
        const deletedCat = await this.PostsModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
