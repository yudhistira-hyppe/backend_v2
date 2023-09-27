import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
import { UserbasicnewService } from './userbasicnew.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Userbasicnew } from './schemas/userbasicnew.schema';
import { LogapisService } from '../logapis/logapis.service';

@Controller('api/')
export class UserbasicnewController {
    constructor(
        private readonly UserbasicnewService: UserbasicnewService,
        private readonly logapiSS: LogapisService
    ) { }

    @Post('userauths/useractivebychart/v2')
    @UseGuards(JwtAuthGuard)
    async getUserActiveChartBasedDate(@Req() request: Request, @Headers() headers): Promise<any> {
    var setdate = new Date();
    var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
    var fullurl = headers.host + '/api/userauths/useractivebychart';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var data = null;
    var date = null;

    const messages = {
        "info": ["The process successful"],
    };

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["date"] !== undefined) {
        date = request_json["date"];
    } else {
        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        throw new BadRequestException("Unabled to proceed");
    }

    var tempdata = await this.UserbasicnewService.getUserActiveByDate(date);
    var getdata = [];
    try {
        getdata = tempdata[0].resultdata;
    }
    catch (e) {
        getdata = [];
    }

    var startdate = new Date(date);
    startdate.setDate(startdate.getDate() - 1);
    var tempdate = new Date(startdate).toISOString().split("T")[0];
    var end = new Date().toISOString().split("T")[0];
    var array = [];

    //kalo lama, berarti error disini!!
    while (tempdate != end) {
        var temp = new Date(tempdate);
        temp.setDate(temp.getDate() + 1);
        tempdate = new Date(temp).toISOString().split("T")[0];
        //console.log(tempdate);

        let obj = getdata.find(objs => objs._id === tempdate);
        //console.log(obj);
        if (obj == undefined) {
        obj =
        {
            _id: tempdate,
            totaldata: 0
        }
        }

        array.push(obj);
    }

    data =
    {
        data: array,
        total: (getdata.length == parseInt('0') ? parseInt('0') : tempdata[0].total)
    }

    var setdate = new Date();
    var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return { response_code: 202, messages, data };
    }
}
