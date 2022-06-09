import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from '../comment/dto/create-comment.dto';

import { Comment, CommentDocument } from '../comment/schemas/comment.schema';
import { PostsService } from '../../../content/posts/posts.service';
import { DisqusService } from '../../../content/disqus/disqus.service';
import { DisquslogsService } from '../../../content/disquslogs/disquslogs.service';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name, 'SERVER_TRANS')
        private readonly commentModel: Model<CommentDocument>,
        private readonly postsService: PostsService,
        private readonly disqusService: DisqusService,
        private readonly disquslogsService: DisquslogsService,
    ) { }



    async findOne(email: string): Promise<Comment> {
        return this.commentModel.findOne({ receiver: email }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.commentModel.findByIdAndRemove({
            _id: id,
        }).exec();
        return deletedCat;
    }



    async findlastcomment(email: string) {
        const posts = await this.postsService.findpost();
        const disqus = await this.disqusService.finddisqus();
        const disquslogs = await this.disquslogsService.finddisquslog();
        const query = await this.commentModel.aggregate([
            { $match: { receiver: email, active: true } },

            {
                $addFields: {
                    createdAt: '$createdAt',
                    disqusID: '$disqusID',
                    receiver: "$receiver",
                    sender: "$sender"

                },
            },
            {
                $lookup: {
                    from: 'disqus2',
                    localField: 'disqusID',
                    foreignField: '_id',
                    as: 'disqus_data',
                },
            },
            {
                $lookup: {
                    from: "posts2",
                    localField: "postID",
                    foreignField: "postID",
                    as: "postdata"
                }
            },
            {
                $project: {
                    post: { $arrayElemAt: ['$postdata', 0] },
                    disqusdata: { $arrayElemAt: ['$disqus_data', 0] },
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    email: "$disqusdata.email",
                    title: "$post.description",
                    disqus: {
                        disqusID: "$disqusdata.disqusID",
                        email: "$disqusdata.email",
                        mate: "$disqusdata.mate",
                        eventType: "$disqusdata.evenType",
                        active: "$disqusdata.active",
                        room: "$disqusdata.room",
                        createdAt: "$disqusdata.createAt",
                        updatedAt: "$disqusdata.updateAt",
                        lastestMessage: "$disqusdata.lastestMessage",
                    }



                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'receiver',
                    foreignField: 'email',
                    as: 'userbasics_data',
                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "sender",
                    foreignField: "email",
                    as: "userdatasender"
                }
            },
            {
                $project: {

                    user: { $arrayElemAt: ['$userbasics_data', 0] },
                    usersender: { $arrayElemAt: ['$userdatasender', 0] },
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$usersender.fullName",
                    namereceiver: "$user.fullName",
                    title: "$post.description",
                    disqus: {
                        disqusID: "$disqusdata.disqusID",
                        email: "$disqusdata.email",
                        mate: "$disqusdata.mate",
                        eventType: "$disqusdata.evenType",
                        active: "$disqusdata.active",
                        room: "$disqusdata.room",
                        createdAt: "$disqusdata.createAt",
                        updatedAt: "$disqusdata.updateAt",
                        lastestMessage: "$disqusdata.lastestMessage",
                    }




                }
            },
            {
                $project: {

                    title: "$title",
                    disqusID: "$disqusID",
                    txtMessages: "$txtMessages",
                    sequenceNumber: "$sequenceNumber",
                    sender: "$sender",
                    receiver: "$receiver",
                    active: "$active",
                    eventInsight: "$eventInsight",
                    postType: "$postType",
                    postID: "$postID",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    reactionUri: "$reactionUri",
                    medias: "$medias",
                    namesender: "$usersender.fullName",
                    namereceiver: "$user.fullName",
                    disqus: "$disqus"




                }
            },
            { $sort: { createdAt: -1 }, },
            { $skip: 0 },
            { $limit: 10 },

        ]);
        return query;
    }
}
