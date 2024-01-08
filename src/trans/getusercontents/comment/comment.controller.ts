import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, BadRequestException } from '@nestjs/common';
import { CommentService } from '../comment/comment.service';
import { CreateCommentDto } from '../comment/dto/create-comment.dto';
import { Comment } from '../comment/schemas/comment.schema';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('api/getnewcomment')
export class CommentController {
    constructor(private readonly getcommentService: CommentService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async contentuserall(@Req() request: Request): Promise<any> {

        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getcommentService.findlastcomment(email);
        console.log(data.length);
        var total_comment = data.length;

        return { response_code: 202, data, messages, total_comment };
    }
    @Post('v2')
    @UseGuards(JwtAuthGuard)
    async contentuserallv2(@Req() request: Request): Promise<any> {

        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getcommentService.findlastcommentv2(email);
        console.log(data.length);
        var total_comment = data.length;

        return { response_code: 202, data, messages, total_comment };
    }
    @Post('disquslogs')
    @UseGuards(JwtAuthGuard)
    async comment(@Req() request: Request): Promise<any> {

        var postID = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getcommentService.findcomment(postID);

        return { response_code: 202, data, messages };
    }
    @Post('disquslogs/v2')
    @UseGuards(JwtAuthGuard)
    async commentv2(@Req() request: Request): Promise<any> {

        var postID = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getcommentService.findcommentv2(postID);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createCommentDto: CreateCommentDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.getcommentService.update(id, createCommentDto);
            res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }

}
