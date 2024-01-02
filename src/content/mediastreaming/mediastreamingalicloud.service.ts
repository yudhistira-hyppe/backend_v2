import { Injectable } from '@nestjs/common';
import live20161101, * as $live20161101 from '@alicloud/live20161101';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import * as $tea from '@alicloud/tea-typescript';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';
import { MediastreamingrequestService } from './mediastreamingrequest.service';
import { request } from 'https';
import { Mediastreamingrequest } from './schema/mediastreamingrequest.schema';
var md5 = require('md5');

@Injectable()
export class MediastreamingalicloudService {
  
  constructor(
    private readonly utilsService: UtilsService,
    private readonly configService: ConfigService,
    private readonly mediastreamingrequestService: MediastreamingrequestService,
  ) {}

  async createClient(): Promise<live20161101> {
    //Get APSARA_ACCESS_KEY
    const APSARA_ACCESS_KEY = this.configService.get("APSARA_ACCESS_KEY");

    //Get APSARA_ACCESS_SECRET
    const APSARA_ACCESS_SECRET = this.configService.get("APSARA_ACCESS_SECRET");

    let config = new $OpenApi.Config({
      accessKeyId: APSARA_ACCESS_KEY,
      accessKeySecret: APSARA_ACCESS_SECRET,
    });
    config.endpoint = `live.aliyuncs.com`;
    return new live20161101(config);
  }

  //QPS 3 per second per account
  async DescribeLiveStreamsPublishList(streamName:string, dateStart: string, dateEnd: string, pageSize: number, pageNumber: number) {
    //Get APP_NAME_LIVE
    const GET_APP_NAME_LIVE = this.configService.get("APP_NAME_LIVE");
    const APP_NAME_LIVE = await this.utilsService.getSetting_Mixed(GET_APP_NAME_LIVE);

    //Get URL_STREAM_LIVE
    const GET_URL_STREAM_LIVE = this.configService.get("URL_STREAM_LIVE");
    const URL_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_STREAM_LIVE);

    let client = await this.createClient();

    let param = {};
    param['domainName'] = URL_STREAM_LIVE.toString();
    param['appName'] = APP_NAME_LIVE.toString();
    if (streamName != undefined) {
      param['streamName'] = streamName;
    }
    param['startTime'] = dateStart;
    param['endTime'] = dateEnd;
    param['streamType'] = "all";
    param['queryType'] = "strict"; 
    param['orderBy'] = "publish_time_desc";//stream_name_desc, stream_name_asc, publish_time_desc, publish_time_asc
    if (pageSize != undefined) {
      param['pageSize'] = pageSize;
    }
    if (pageNumber != undefined) {
      param['pageNumber'] = pageNumber;
    }
    let describeLiveStreamsPublishListRequest = new $live20161101.DescribeLiveStreamsPublishListRequest(param);
    let runtime = new $Util.RuntimeOptions({});
    try {
      const data = await client.describeLiveStreamsPublishListWithOptions(describeLiveStreamsPublishListRequest, runtime);
      //SAVE LOG REQUEST
      this.saveRequest(describeLiveStreamsPublishListRequest, "DescribeLiveStreamsPublishList", data);
      return data.body;
    } catch (error) {
      //SAVE LOG REQUEST
      this.saveRequest(describeLiveStreamsPublishListRequest, "DescribeLiveStreamsPublishList", error.message);
      console.log(error.message);
      console.log(error.data["Recommend"]);
      //Util.assertAsString(error.message);
      return null;
    }
  }

  //QPS 30 per second
  async DescribeLiveStreamState(streamName: string) {
    //Get APP_NAME_LIVE
    const GET_APP_NAME_LIVE = this.configService.get("APP_NAME_LIVE");
    const APP_NAME_LIVE = await this.utilsService.getSetting_Mixed(GET_APP_NAME_LIVE);

    //Get URL_STREAM_LIVE
    const GET_URL_STREAM_LIVE = this.configService.get("URL_STREAM_LIVE");
    const URL_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_STREAM_LIVE);

    let client = await this.createClient();
    let describeLiveStreamStateRequest = new $live20161101.DescribeLiveStreamStateRequest({
      domainName: URL_STREAM_LIVE.toString(),
      appName: APP_NAME_LIVE.toString(),
      streamName: streamName,
    });
    let runtime = new $Util.RuntimeOptions({});
    try {
      const data = await client.describeLiveStreamStateWithOptions(describeLiveStreamStateRequest, runtime);
      //SAVE LOG REQUEST
      this.saveRequest(describeLiveStreamStateRequest, "DescribeLiveStreamState", data);
      return data;
    } catch (error) {
      //SAVE LOG REQUEST
      this.saveRequest(describeLiveStreamStateRequest, "DescribeLiveStreamState", error.message);
      console.log(error.message);
      console.log(error.data["Recommend"]);
      //Util.assertAsString(error.message);
      return null;
    } 
  }

  //QPS 10000 per minute per account
  async DescribeLiveStreamsOnlineList(streamName: string, pageSize: number, pageNum: number) {
    //Get APP_NAME_LIVE
    const GET_APP_NAME_LIVE = this.configService.get("APP_NAME_LIVE");
    const APP_NAME_LIVE = await this.utilsService.getSetting_Mixed(GET_APP_NAME_LIVE);

    //Get URL_STREAM_LIVE
    const GET_URL_STREAM_LIVE = this.configService.get("URL_STREAM_LIVE");
    const URL_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_STREAM_LIVE);

    let client = await this.createClient();
    
    let param = {};
    param['domainName'] = URL_STREAM_LIVE.toString();
    param['appName'] = APP_NAME_LIVE.toString();
    if (streamName != undefined) {
      param['streamName'] = streamName;
    }
    param['onlyStream'] = "yes";
    param['streamType'] = "all";
    param['queryType'] = "strict";
    if (pageSize != undefined) {
      param['pageSize'] = pageSize;
    }
    if (pageNum != undefined) {
      param['pageNum'] = pageNum;
    }
    let describeLiveStreamsOnlineListRequest = new $live20161101.DescribeLiveStreamsOnlineListRequest(param);
    let runtime = new $Util.RuntimeOptions({});
    try {
      const data = await client.describeLiveStreamsOnlineListWithOptions(describeLiveStreamsOnlineListRequest, runtime);
      //SAVE LOG REQUEST
      this.saveRequest(describeLiveStreamsOnlineListRequest, "DescribeLiveStreamsOnlineList", data);
      return data;
    } catch (error) {
      //SAVE LOG REQUEST
      this.saveRequest(describeLiveStreamsOnlineListRequest, "DescribeLiveStreamsOnlineList", error.message);
      console.log(error.message);
      console.log(error.data["Recommend"]);
      //Util.assertAsString(error.message);
      return null;
    } 
  }

  //QPS 5 per second per account
  async DescribeLiveDomainLimit() {
    //Get URL_STREAM_LIVE
    const GET_URL_STREAM_LIVE = this.configService.get("URL_STREAM_LIVE");
    const URL_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_STREAM_LIVE);

    let client = await this.createClient();
    let describeLiveDomainLimitRequest = new $live20161101.DescribeLiveDomainLimitRequest({
      domainName: URL_STREAM_LIVE.toString(),
    });
    let runtime = new $Util.RuntimeOptions({});
    try {
      const data = await client.describeLiveDomainLimitWithOptions(describeLiveDomainLimitRequest, runtime);
      //SAVE LOG REQUEST
      this.saveRequest(describeLiveDomainLimitRequest, "DescribeLiveDomainLimit", data);
      return data;
    } catch (error) {
      //SAVE LOG REQUEST
      this.saveRequest(describeLiveDomainLimitRequest, "DescribeLiveDomainLimit", error.message);
      console.log(error.message);
      console.log(error.data["Recommend"]);
      //Util.assertAsString(error.message);
      return null;
    }  
  }

  //QPS 15 per second per account
  async SetLiveStreamsNotifyUrlConfig(Url: string, notifyReqAuth: string, NotifyAuthKey: string){
    //Get URL_STREAM_LIVE
    const GET_URL_STREAM_LIVE = this.configService.get("URL_STREAM_LIVE");
    const URL_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_STREAM_LIVE);

    let client = await this.createClient();

    let param = {};
    param['domainName'] = URL_STREAM_LIVE.toString();
    param['notifyUrl'] = Url;
    if (notifyReqAuth != undefined) {
      if (notifyReqAuth == "yes") {
        if (NotifyAuthKey != undefined) {
          param['NotifyAuthKey'] = NotifyAuthKey;
        }
        param['notifyReqAuth'] = notifyReqAuth;
      }
    }
    let setLiveStreamsNotifyUrlConfigRequest = new $live20161101.SetLiveStreamsNotifyUrlConfigRequest(param);
    let runtime = new $Util.RuntimeOptions({});
    try {
      const data = await client.setLiveStreamsNotifyUrlConfigWithOptions(setLiveStreamsNotifyUrlConfigRequest, runtime);
      //SAVE LOG REQUEST
      this.saveRequest(setLiveStreamsNotifyUrlConfigRequest, "SetLiveStreamsNotifyUrlConfig", data);
      return data;
    } catch (error) {
      //SAVE LOG REQUEST
      this.saveRequest(setLiveStreamsNotifyUrlConfigRequest, "SetLiveStreamsNotifyUrlConfig", error.message);
      console.log(error.message);
      console.log(error.data["Recommend"]);
      //Util.assertAsString(error.message);
      return null;
    }    
  }

  //QPS 30 per second per account
  async AddLiveDetectNotifyConfig(url:string) {
    //Get URL_STREAM_LIVE
    const GET_URL_STREAM_LIVE = this.configService.get("URL_STREAM_LIVE");
    const URL_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_STREAM_LIVE);

    let param = {}; 
    param['domainName'] = URL_STREAM_LIVE.toString();
    param['notifyUrl'] = url;

    let client = await this.createClient();
    let addLiveDetectNotifyConfigRequest = new $live20161101.AddLiveDetectNotifyConfigRequest({
      domainName: URL_STREAM_LIVE,
      notifyUrl: url,
    });
    let runtime = new $Util.RuntimeOptions({});
    try {
      const data = await client.addLiveDetectNotifyConfigWithOptions(addLiveDetectNotifyConfigRequest, runtime);
      //SAVE LOG REQUEST
      this.saveRequest(addLiveDetectNotifyConfigRequest, "addLiveDetectNotifyConfig", data);
      return data;
    } catch (error) {
      //SAVE LOG REQUEST
      this.saveRequest(addLiveDetectNotifyConfigRequest, "addLiveDetectNotifyConfig", error.message);
      console.log(error.message);
      console.log(error.data["Recommend"]);
      //Util.assertAsString(error.message);
      return null;
    }    
  }

  async saveRequest(request: any, url: any, response: any){
    let Mediastreamingrequest_ = new Mediastreamingrequest();
    Mediastreamingrequest_.request = request;
    Mediastreamingrequest_.url = url;
    Mediastreamingrequest_.response = response;
    Mediastreamingrequest_.createAt = await this.utilsService.getDateString();
    Mediastreamingrequest_.updateAt = await this.utilsService.getDateString();
    this.mediastreamingrequestService.createStreamingRequest(Mediastreamingrequest_);
  }
}
