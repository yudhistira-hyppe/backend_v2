import { Controller, Post, Req, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { ChallengeReadService } from './challenge_read.service';
import { UtilsService } from 'src/utils/utils.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { SubChallengeReadService } from './subChallenge_read.service';

@Controller('api/challenge')
export class ChallengeReadController {
  constructor(
    private readonly challengeReadService: ChallengeReadService,
    private readonly subChallengeReadService: SubChallengeReadService,
    private utilsService: UtilsService,
    private readonly logapiSS: LogapisService,) { }

  @UseGuards(JwtAuthGuard)
  @Post('listleaderboard')
  async listleaderboaard(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listleaderboard';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var idchallenge = null;
    var iduser = null;
    var status = null;
    var session = null;
    var datasession = null;
    var data = null;
    var totalSession = null;
    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["idchallenge"] !== undefined) {
      idchallenge = request_json['idchallenge'];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, challenge field is required");
    }

    if (request_json["iduser"] !== undefined) {
      iduser = request_json['iduser'];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }
    status = request_json['status'];
    session = request_json['session'];


    try {
      data = await this.subChallengeReadService.getListUserChallengeNew3(idchallenge, iduser, status, session);
    } catch (e) {
      data = [];
    }
    if (data !== null && data.length > 0) {
      try {
        datasession = await this.subChallengeReadService.getcount(idchallenge);
      } catch (e) {
        datasession = [];
      }
      if (datasession !== null && datasession.length > 0) {
        totalSession = datasession[0].totalSession;
      } else {
        totalSession = 0;
      }
      data[0].totalSession = totalSession;

    }

    const messages = {
      "info": ["The proses successful"],
    };

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      "data": data,
      "message": messages
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('listleaderboard/v2')
  async listleaderboardv2(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listleaderboard/v2';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var idchallenge = null;
    var iduser = null;
    var status = null;
    var session = null;
    var datasession = null;
    var data = null;
    var totalSession = null;
    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["idchallenge"] !== undefined) {
      idchallenge = request_json['idchallenge'];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, challenge field is required");
    }

    if (request_json["iduser"] !== undefined) {
      iduser = request_json['iduser'];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }
    status = request_json['status'];
    session = request_json['session'];


    try {
      data = await this.subChallengeReadService.getListUserChallengeNew3V2(idchallenge, iduser, status, session);
    } catch (e) {
      data = [];
    }
    if (data !== null && data.length > 0) {
      try {
        datasession = await this.subChallengeReadService.getcount(idchallenge);
      } catch (e) {
        datasession = [];
      }
      if (datasession !== null && datasession.length > 0) {
        totalSession = datasession[0].totalSession;
      } else {
        totalSession = 0;
      }
      data[0].totalSession = totalSession;

    }

    const messages = {
      "info": ["The proses successful"],
    };

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      "data": data,
      "message": messages
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('listleaderboard2')
  async listleaderboaard2(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listleaderboard2';

    var idchallenge = null;
    var iduser = null;
    var status = null;
    var session = null;
    var datasession = null;
    var data = null;
    var totalSession = null;
    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["idchallenge"] !== undefined) {
      idchallenge = request_json['idchallenge'];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, challenge field is required");
    }

    if (request_json["iduser"] !== undefined) {
      iduser = request_json['iduser'];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }
    status = request_json['status'];
    session = request_json['session'];


    try {
      data = await this.subChallengeReadService.getListUserChallengekeduaNew3(idchallenge, iduser, status, session);
    } catch (e) {
      data = [];
    }
    if (data !== null && data.length > 0) {
      try {
        datasession = await this.subChallengeReadService.getcount(idchallenge);
      } catch (e) {
        datasession = [];
      }
      if (datasession !== null && datasession.length > 0) {
        totalSession = datasession[0].totalSession;
      } else {
        totalSession = 0;
      }
      data[0].totalSession = totalSession;

    }

    const messages = {
      "info": ["The proses successful"],
    };

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

    return {
      response_code: 202,
      "data": data,
      "message": messages
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('listleaderboard2/v2')
  async listleaderboard2v2(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listleaderboard2/v2';

    var idchallenge = null;
    var iduser = null;
    var status = null;
    var session = null;
    var datasession = null;
    var data = null;
    var totalSession = null;
    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["idchallenge"] !== undefined) {
      idchallenge = request_json['idchallenge'];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, challenge field is required");
    }

    if (request_json["iduser"] !== undefined) {
      iduser = request_json['iduser'];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }
    status = request_json['status'];
    session = request_json['session'];


    try {
      data = await this.subChallengeReadService.getListUserChallengekeduaNew3V2(idchallenge, iduser, status, session);
    } catch (e) {
      data = [];
    }
    if (data !== null && data.length > 0) {
      try {
        datasession = await this.subChallengeReadService.getcount(idchallenge);
      } catch (e) {
        datasession = [];
      }
      if (datasession !== null && datasession.length > 0) {
        totalSession = datasession[0].totalSession;
      } else {
        totalSession = 0;
      }
      data[0].totalSession = totalSession;

    }

    const messages = {
      "info": ["The proses successful"],
    };

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

    return {
      response_code: 202,
      "data": data,
      "message": messages
    }
  }
}
