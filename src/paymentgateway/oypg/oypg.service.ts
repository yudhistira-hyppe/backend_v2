import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OyAccountInquiry } from './dto/OyDTO';

@Injectable()
export class OyPgService {

    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {}

    async inquiryAccount(accountInfo : OyAccountInquiry) {

        let config = {headers : {"x-oy-username" : this.configService.get("OY_USERNAME")}, "x-oy-username" : this.configService.get("OY_USERNAME")}; 
        return await this.httpService.post(this.configService.get("OY_ENDPOINT"), accountInfo, config);
    }
}
