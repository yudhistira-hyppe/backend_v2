import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFiles, Res, BadRequestException, HttpStatus } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { Challenge } from './schemas/challenge.schema';
import { OssService } from 'src/stream/oss/oss.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { BadgeService } from '../badge/badge.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('api/challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService,
    private readonly osservices: OssService,
    private readonly util: UtilsService,
    private readonly badge: BadgeService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileFieldsInterceptor([{ name: 'bannerBoard', maxCount: 1 }, { name: 'bannerSearch', maxCount:1 }, { name: 'popUpnotif', maxCount:1 }, { name: 'profile_juara', maxCount:3 }, { name: 'general_juara', maxCount:3 }]))
    async create(
      @UploadedFiles() files: { 
        bannerBoard?: Express.Multer.File[]
        bannerSearch?: Express.Multer.File[]
        popUpnotif?: Express.Multer.File[]      
        profile_juara?: Express.Multer.File[]      
        general_juara?: Express.Multer.File[]      
      },
      @Req() request: Request,
      @Res() res,
    ) {
      var request_json = JSON.parse(JSON.stringify(request.body));
  
      if(files.bannerBoard == undefined)
      {
        throw new BadRequestException("Unabled to proceed. banner board image is required");
      }
  
      if(files.bannerSearch == undefined)
      {
        throw new BadRequestException("Unabled to proceed. banner search image is required");
      }
  
      if(files.popUpnotif == undefined)
      {
        throw new BadRequestException("Unabled to proceed. pop up notification image is required");
      }
  
      // if(request_json['ketentuanhadiah_tampilbadge'] == true)
      if(request_json['ketentuanhadiah_tampilbadge'] == 'true' || request_json['ketentuanhadiah_tampilbadge'] == true)
      {
        var dataarray = files.profile_juara;
        if(dataarray.length != 3)
        {
          throw new BadRequestException("Unabled to proceed. upload profile badge 3 times");
        }
  
        var dataarray = files.general_juara;
        if(dataarray.length != 3)
        {
          throw new BadRequestException("Unabled to proceed. upload general badge 3 times");
        }
      }
  
      var mongoose = require('mongoose');
      var insertdata = new CreateChallengeDto();
      insertdata._id = new mongoose.Types.ObjectId();
      insertdata.nameChallenge = request_json['namechallenge'];
      
      var importlib = require('mongoose');
      insertdata.nameChallenge = request_json['nameChallenge'];
      insertdata.jenisChallenge = importlib.Types.ObjectId(request_json['jenisChallenge']);
      insertdata.description = request_json['description'];
      insertdata.createdAt = await this.util.getDateTimeString();
      insertdata.updatedAt = await this.util.getDateTimeString();
      insertdata.startChallenge = request_json['startChallenge'];
      insertdata.endChallenge = request_json['endChallenge'];
      insertdata.durasi = request_json['durasi'];
      insertdata.tampilStatusPengguna = request_json['tampilStatusPengguna'];
      insertdata.objectChallenge = request_json['objectChallenge'].toString().toLowerCase();
      insertdata.statusChallenge = 'DRAFT';
    
      var arraymetrik = [];
      let setmetrik = {};
      if(request_json['pilihanMetrik'] == 'akun')
      {
        var setreferal = null;
        var setikuti = null;
  
        if (request_json["akun_referal"] !== undefined) {
          setreferal = Number(request_json['akun_referal']);
        }
  
        if (request_json["akun_ikuti"] !== undefined) {
          setikuti = Number(request_json['akun_ikuti']);
        }
  
        if(setreferal == null && setikuti == null)
        {
          throw new BadRequestException("Unabled to proceed, referral score or following score is required");
        }
  
        setmetrik = {
          "Aktivitas": true,
          "Interaksi": false,
          "InteraksiKonten": [ ],
          "AktivitasAkun": [
              {
                "Referal": setreferal,
                "Ikuti": setikuti
              }
          ]
        }
      }
      else
      {
        if (request_json["konten_tagar"] == undefined) {
          request_json['konten_tagar'] = null;
        }
  
        if (request_json["konten_hyppevid_createpost"] == undefined && request_json["konten_hyppevid_createpost"] == null) {
          request_json['konten_hyppevid_createpost'] = 0;
        }
  
        if (request_json["konten_hyppepic_createpost"] == undefined && request_json["konten_hyppepic_createpost"] == null) {
          request_json['konten_hyppepic_createpost'] = 0;
        }
  
        if (request_json["konten_hyppediary_createpost"] == undefined && request_json["konten_hyppediary_createpost"] == null) {
          request_json['konten_hyppediary_createpost'] = 0;
        }
  
        if (request_json["konten_hyppevid_likepost"] == undefined && request_json["konten_hyppevid_likepost"] == null) {
          request_json['konten_hyppevid_likepost'] = 0;
        }
  
        if (request_json["konten_hyppepic_likepost"] == undefined && request_json["konten_hyppepic_likepost"] == null) {
          request_json['konten_hyppepic_likepost'] = 0;
        }
  
        if (request_json["konten_hyppediary_likepost"] == undefined && request_json["konten_hyppediary_likepost"] == null) {
          request_json['konten_hyppediary_likepost'] = 0;
        }
  
        if (request_json["konten_hyppevid_viewpost"] == undefined && request_json["konten_hyppevid_viewpost"] == null) {
          request_json['konten_hyppevid_viewpost'] = 0;
        }
  
        if (request_json["konten_hyppediary_viewpost"] == undefined && request_json["konten_hyppediary_viewpost"] == null) {
          request_json['konten_hyppediary_viewpost'] = 0;
        }
  
        setmetrik = {
          "Aktivitas": false,
          "Interaksi": true,
          "AktivitasAkun": [ ],
          "InteraksiKonten": [
            {
              "tagar": request_json['konten_tagar'],
              "buatKonten": [
                {
                  "HyppeVid":Number(request_json['konten_hyppevid_createpost']),
                  "HyppePic":Number(request_json['konten_hyppepic_createpost']),
                  "HyppeDiary":Number(request_json['konten_hyppediary_createpost'])
                }
              ],
              "suka": [
                {
                  "HyppeVid":Number(request_json['konten_hyppevid_likepost']),
                  "HyppePic":Number(request_json['konten_hyppepic_likepost']),
                  "HyppeDiary":Number(request_json['konten_hyppediary_likepost'])
                }
              ],
              "tonton": [
                {
                  "HyppeVid":Number(request_json['konten_hyppevid_viewpost']),
                  "HyppeDiary":Number(request_json['konten_hyppediary_viewpost'])
                }
              ],
            }
          ]
        }
      }
  
      arraymetrik.push(setmetrik);
      insertdata.metrik = arraymetrik;
  
      var setpesertafield = {};
      var datatipeAkun = request_json['tipeAkun'];
      var konversitipeAkun = datatipeAkun.toString().split(",");
      var settipeAkun = {};
      var listarraytipe = ["Terverifikasi","TidakTerverifikasi"];
      
      for(var i = 0; i < listarraytipe.length; i++)
      {
        var checkresulttipe = konversitipeAkun.includes(listarraytipe[i]);
        if(checkresulttipe == true)
        {
          settipeAkun[listarraytipe[i]] = "YES";
        }
        else
        {
          settipeAkun[listarraytipe[i]] = "NO";
        }
      }
  
      setpesertafield["tipeAkun"] = [settipeAkun];
      setpesertafield["caraGabung"] = request_json['caraGabung'];
  
      var datajeniskelamin = request_json['jenis_kelamin'];
      var konversikelamin = datajeniskelamin.toString();
      konversikelamin.split(",");
      var tempkelamindata = null;
      var setjeniskelamin = {};
      for(var i = 0; i < konversikelamin.length; i++)
      {
        tempkelamindata = konversikelamin[i];
        if(tempkelamindata == 'L')
        {
          setjeniskelamin['Laki-laki'] = 'YES';
        }
        else if(tempkelamindata == 'P')
        {
          setjeniskelamin['Perempuan'] = 'YES';
        }
        else if(tempkelamindata == 'O')
        {
          setjeniskelamin['Lainnya'] = 'YES';
        }
      }
  
      setpesertafield["jenisKelamin"] = [setjeniskelamin];
  
      var datalokasi = request_json['lokasi'];
      var konversilokasi = datalokasi.toString().split(",");
      var templokasidata = null;
      var setlokasi = [];
      var mongoose = require('mongoose');
      for(var i = 0; i < konversilokasi.length; i++)
      {
        templokasidata = new mongoose.Types.ObjectId(konversilokasi[i].toString());
        setlokasi.push(templokasidata);
      }
  
      setpesertafield["lokasiPengguna"] = setlokasi;
  
      var dataumur = request_json['rentangumur'];
      var konversiumur = dataumur.toString();
      konversiumur.split(",");
      var listumur = ["<14","14-28","29-43","44<"];
      var setumur = {};
      var mongoose = require('mongoose');
      for(var i = 0; i < listumur.length; i++)
      {
        var searchumur = konversiumur.includes(listumur[i]);
        if(searchumur == true)
        {
          setumur[listumur[i]] = 'YES';
        }
        else
        {
          setumur[listumur[i]] = 'NO';
        }
      }
  
      setpesertafield['rentangUmur'] = [setumur];
  
      insertdata.peserta = [setpesertafield];
  
      var setleaderboard = {};
      // if(request_json['leaderboard_tampil'] == true)
      if(request_json['leaderboard_tampil'] == 'true' || request_json['leaderboard_tampil'] == true)
      {
        setleaderboard['tampilBadge'] = true;
        setleaderboard['Height'] = Number(request_json['leaderboard_Height']);
        setleaderboard['Weight'] = Number(request_json['leaderboard_Weight']);
        setleaderboard['maxSize'] = Number(request_json['leaderboard_maxSize']);
        setleaderboard['minSize'] = Number(request_json['leaderboard_minSize']);
        setleaderboard['warnaBackground'] = request_json['leaderboard_warnaBackground'];
        setleaderboard['formatFile'] = request_json['leaderboard_formatFile'];
        var ektensileaderboard = request_json['leaderboard_formatFile'];
        var insertbanner = files.bannerBoard[0];
        var path = "images/challenge/" + insertdata._id + "_bannerLeaderboard" + "." + ektensileaderboard;
        var result = await this.osservices.uploadFile(insertbanner, path);
        setleaderboard['bannerLeaderboard'] = result.url;
        // setleaderboard['bannerLeaderboard'] = path;
      }
      else
      {
        setleaderboard['tampilBadge'] = false;
        setleaderboard['Height'] = null;
        setleaderboard['Weight'] = null;
        setleaderboard['maxSize'] = null;
        setleaderboard['minSize'] = null;
        setleaderboard['formatFile'] = null;
        setleaderboard['warnaBackground'] = null;
        setleaderboard['bannerLeaderboard'] = null;
      }
  
      insertdata.leaderBoard = [setleaderboard];
  
      var setketentuanhadiah = {};
      // if(request_json['ketentuanhadiah.tampilbadge'] == true)
      if(request_json['ketentuanhadiah_tampilbadge'] == 'true' || request_json['ketentuanhadiah.tampilbadge'] == true)
      {
        setketentuanhadiah['badgePemenang'] = true;
        setketentuanhadiah['Height'] = Number(request_json['ketentuanhadiah_Height']);
        setketentuanhadiah['Weight'] = Number(request_json['ketentuanhadiah_Weight']);
        setketentuanhadiah['maxSize'] = Number(request_json['ketentuanhadiah_maxSize']);
        setketentuanhadiah['minSize'] = Number(request_json['ketentuanhadiah_minSize']);
        setketentuanhadiah['formatFile'] = request_json['ketentuanhadiah_formatFile'];
        var listjuara = {};
        for(var i = 0; i < 3; i++)
        {
          var insertbadge = {};
          var tambahsatu = i + 1;
          insertbadge['name'] = 'Badge juara' + tambahsatu.toString();
          var settype = 'juara' + tambahsatu.toString();
          insertbadge['type'] = settype;
          var insertgeneral = [files.general_juara[i]];
          var insertprofile = [files.profile_juara[i]];
          var resultbadge = await this.badge.create(insertgeneral, insertprofile, insertbadge);
          var convertid = mongoose.Types.ObjectId(resultbadge._id);
          // var convertid = settype;
          listjuara[settype] = convertid;
        }
        setketentuanhadiah['badge'] = [listjuara];
      }
      else
      {
        setketentuanhadiah['badgePemenang'] = false;
        setketentuanhadiah['Height'] = null;
        setketentuanhadiah['Weight'] = null;
        setketentuanhadiah['maxSize'] = null;
        setketentuanhadiah['minSize'] = null;
        setketentuanhadiah['formatFile'] = null;
        setketentuanhadiah['badge'] = [];
      }
  
      insertdata.ketentuanHadiah = [setketentuanhadiah];
  
      var setbannersearch = {};
      setbannersearch['Height'] = Number(request_json['bannersearch_Height']);
      setbannersearch['Weight'] = Number(request_json['bannersearch_Weight']);
      setbannersearch['maxSize'] = Number(request_json['bannersearch_maxSize']);
      setbannersearch['minSize'] = Number(request_json['bannersearch_minSize']);
      setbannersearch['formatFile'] = request_json['bannersearch_formatFile'];
      var ektensisearch = request_json['bannersearch_formatFile'];
      var insertsearch = files.bannerSearch[0];
      var path = "images/challenge/" + insertdata._id + "_bannerSearch" + "." + ektensisearch;
      var result = await this.osservices.uploadFile(insertsearch, path);
      setbannersearch['image'] = result.url;
      // setbannersearch['image'] = path;
      
      insertdata.bannerSearch = [setbannersearch];
  
      var setpopup = {};
      setpopup['Height'] = Number(request_json['popup_Height']);
      setpopup['Weight'] = Number(request_json['popup_Weight']);
      setpopup['maxSize'] = Number(request_json['popup_maxSize']);
      setpopup['minSize'] = Number(request_json['popup_minSize']);
      setpopup['formatFile'] = request_json['popup_formatFile'];
      var ektensipopup = request_json['popup_formatFile'];
      var insertpopup = files.popUpnotif[0];
      var path = "images/challenge/" + insertdata._id + "_popup" + "." + ektensipopup;
      var result = await this.osservices.uploadFile(insertpopup, path);
      setpopup['image'] = result.url;
      // setpopup['image'] = path;
      
      insertdata.popUp = [setpopup];
  
      if(request_json['hadiah_currency'] != null && request_json['hadiah_currency'] != undefined)
      {
        var sethadiah = {};
  
        sethadiah["currency"] = request_json['hadiah_currency'].toUpperCase();
        var getlistjuara = request_json['hadiah_juara'];
        var konversijuara = getlistjuara.toString().split(",");
        for(var i = 0; i < konversijuara.length; i++)
        {
          var temploop = i + 1;
          var stringnama = 'juara' + temploop.toString();
          sethadiah[stringnama] = Number(konversijuara[i]);
        }
  
        insertdata.hadiahPemenang = [sethadiah];
      }
      else
      {
        insertdata.hadiahPemenang = [];
      }
  
      var setnotifikasi = {};
      var listnotifikasipush = ['akanDatang', 'challengeDimulai', 'updateLeaderboard', 'challengeAkanBerakhir', 'untukPemenang'];
      var listvariable = ['include', 'title', 'description', 'unit', 'aturWaktu'];
      for(var i = 0; i < listnotifikasipush.length; i++)
      {
        var tempnotifikasi = {};
        var getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_include';
        if(request_json[getvarname] != undefined && request_json[getvarname] != null)
        {
          for(var j = 0; j < listvariable.length; j++)
          {
            getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_' + listvariable[j];
            tempnotifikasi[listvariable[j]] = request_json[getvarname];
          }
        }
        else
        {
          for(var j = 0; j < listvariable.length; j++)
          {
            if(listvariable[j] == 'include')
            {
              tempnotifikasi[listvariable[j]] = 'NO';
            }
            else
            {
              tempnotifikasi[listvariable[j]] = null;
            }
          }
        }
  
        setnotifikasi[listnotifikasipush[i]] = [
          tempnotifikasi
        ];
      }
  
      insertdata.notifikasiPush = [setnotifikasi];
  
      const messages = {
        "info": ["The process successful"],
      };
  
      const messagesEror = {
        "info": ["Todo is not found!"],
      };
  
      try
      {
        // var resultdata = insertdata;
        var resultdata = await this.challengeService.create(insertdata);
        
        return res.status(HttpStatus.OK).json({
            response_code: 202,
            "data": resultdata,
            "message": messages
        });
      }
      catch(e)
      {
        return res.status(HttpStatus.BAD_REQUEST).json({
          "message": messagesEror
        });
      }
    }

    @UseGuards(JwtAuthGuard)
    @Post('listing')
    async findAll(@Req() request: Request) {
      var page = null;
      var limit = null;
      var namachallenge = null;
      var startdate = null;
      var enddate = null;
      var objectchallenge = null;
      var statuschallenge = null;
      var caragabung = null;
  
      var request_json = JSON.parse(JSON.stringify(request.body));
  
      if (request_json["namechallenge"] !== undefined) {
        namachallenge = request_json["namechallenge"];
      }
  
      if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
      }
  
      if (request_json["objectchallenge"] !== undefined) {
        objectchallenge = request_json["objectchallenge"];
      }
  
      if (request_json["statuschallenge"] !== undefined) {
        statuschallenge = request_json["statuschallenge"];
      }
      
      if (request_json["caragabung"] !== undefined) {
        caragabung = request_json["caragabung"];
      }
  
      if (request_json["page"] !== undefined) {
        page = Number(request_json["page"]);
      } else {
          throw new BadRequestException("Unabled to proceed, page field is required");
      }
  
      if (request_json["limit"] !== undefined) {
          limit = Number(request_json["limit"]);
      } else {
          throw new BadRequestException("Unabled to proceed, limit field is required");
      }
  
      var data = await this.challengeService.findAll(namachallenge, startdate, enddate, objectchallenge, statuschallenge, caragabung, page, limit);
      
      const messages = {
        "info": ["The process successful"],
      };
  
      return {
          response_code: 202,
          data:data,
          messages: messages,
      };
    }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.challengeService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createChallenge: CreateChallengeDto) {
  //   return this.challengeService.update(id, createChallenge);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.challengeService.remove(id);
  // }
}
