import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, BadRequestException, Request } from '@nestjs/common';
import { GetcontenteventsService } from './getcontentevents.service';
import { CreateGetcontenteventsDto } from './dto/create-getcontentevents.dto';
import { Getcontentevents } from './schemas/getcontentevents.schema';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@Controller()
export class GetcontenteventsController {
    constructor(private readonly getcontenteventsService: GetcontenteventsService) { }

    @Post('api/getcontentevents')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagement(@Req() request: Request): Promise<any> {

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

        let datagender = await this.getcontenteventsService.findgender(postID);

        let dataall = await this.getcontenteventsService.findall(postID);
        var lenggender = datagender.length;
        var datapost = [];
        var totalage = 0;
        var totalage40 = 0;
        var totalage14 = 0;
        var totalpost = dataall.length;
        var obj = {};
        for (var x = 0; x < lenggender; x++) {
            var gender = datagender[x]._id;
            var tepost = datagender[x].totalpost * 100 / totalpost;
            var tpost = tepost.toFixed(2);
            obj = { "_id": gender, "totalpost": tpost };
            datapost.push(obj);
        }

        var dataages = [];
        var objage14 = {};

        let dataage14 = await this.getcontenteventsService.findage14(postID);
        var lengage14 = dataage14.length;
        for (var x = 0; x < lengage14; x++) {

            totalage14 += dataage14[x].totalpost;
        }
        var totalpostage14 = dataall.length;
        var prosentage14 = totalage14 * 100 / totalpostage14;
        var tpostage14 = prosentage14.toFixed(2);

        if (parseInt(tpostage14) > 0) {
            objage14 = { "_id": "<14", "totalpost": tpostage14 };
            dataages.push(objage14);

        } else {
            objage14 = { "_id": "<14", "totalpost": "0" };
            dataages.push(objage14);

        }

        var objage = {};
        var objage40 = {};

        let dataage = await this.getcontenteventsService.findage1440(postID);
        var lengage = dataage.length;
        for (var x = 0; x < lengage; x++) {

            totalage += dataage[x].totalpost;
        }
        var totalpostage = dataall.length;
        var prosentage1441 = totalage * 100 / totalpostage;
        var tpostage = prosentage1441.toFixed(2);

        if (parseInt(tpostage) > 0) {
            objage = { "_id": "14-40", "totalpost": tpostage };
            dataages.push(objage);
        } else {
            objage = { "_id": "14-40", "totalpost": "0" };
            dataages.push(objage);
        }




        let dataage40 = await this.getcontenteventsService.findage40(postID);
        var lengage40 = dataage40.length;
        for (var x = 0; x < lengage40; x++) {

            totalage40 += dataage40[x].totalpost;
        }
        var totalpostage40 = dataall.length;
        var prosentage40 = totalage40 * 100 / totalpostage40;
        var tpostage40 = prosentage40.toFixed(2);

        if (parseInt(tpostage40) > 0) {

            objage40 = { "_id": ">40", "totalpost": tpostage40 };
            dataages.push(objage40);
        } else {
            objage40 = { "_id": ">40", "totalpost": "0" };
            dataages.push(objage40);
        }






        var data = { "gender": datapost, "age": dataages };
        return { response_code: 202, data, messages };
    }
}
