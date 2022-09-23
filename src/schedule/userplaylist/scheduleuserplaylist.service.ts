import { Injectable } from '@nestjs/common';
import { UtilsService } from '../../utils/utils.service';
import { PostsService } from '../../content/posts/posts.service';
import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';
import { MediastoriesService } from '../../content/mediastories/mediastories.service';
import { MediavideosService } from '../../content/mediavideos/mediavideos.service';
import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { CreateUserplaylistDto } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { UserplaylistService } from '../../trans/userplaylist/userplaylist.service';

@Injectable()
export class ScheduleUserPlaylistService {
    constructor(
        private utilsService: UtilsService,
        private readonly postsService: PostsService,
        private readonly mediadiariesService: MediadiariesService,
        private readonly mediastoriesService: MediastoriesService,
        private readonly mediavideosService: MediavideosService,
        private readonly mediapictsService: MediapictsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly userplaylistService: UserplaylistService,
    ) { }

    async runTask() {
        var EngineUserPlaylistTimeEnd = String(await this.utilsService.getSetting("EngineUserPlaylistTimeEnd"));
        var convertToTime = String(await this.utilsService.convertToTime(EngineUserPlaylistTimeEnd));
        var EngineUserPlaylistIndex = Number(await this.utilsService.getSetting("EngineUserPlaylistIndex"));
        var EngineUserPlaylistDone = Boolean(await this.utilsService.getSetting("EngineUserPlaylistDone"));
        console.log("Setting PlaylistIndex", EngineUserPlaylistIndex);
        console.log("Setting PlaylistDone", EngineUserPlaylistDone);

        var GetPost = await this.postsService.findAllSort();
        console.log("GetPost.length", GetPost.length);
        if (EngineUserPlaylistDone == false) {
            for (let i = EngineUserPlaylistIndex; i < GetPost.length; i++) {
                console.log("------------------------------------------");
                const DateStringLocale = new Date().toLocaleString('sv-SE', {
                    timeZone: 'Asia/Jakarta',
                    hour12: false
                });
                var DateStringLocaleToDate = new Date(DateStringLocale.split(' ')[0] + 'T' + DateStringLocale.split(' ')[1] + ".000Z");
                var DateStringLocaleToDate2 = new Date(DateStringLocale.split(' ')[0] + 'T' + DateStringLocale.split(' ')[1] + ".000Z");

                var date_1 = DateStringLocaleToDate2.setDate(DateStringLocaleToDate2.getDate() + 1);
                var nowDateTime = new Date(date_1).toISOString();
                var nowDate = nowDateTime.split('T')[0];
                //var hms = convertToTime;
                var hms = "23:15:00";
                var target = new Date(nowDate + 'T' + hms + ".000Z");
                const result1 = target.getTime();
                const result2 = DateStringLocaleToDate.getTime();

                console.log("date now", DateStringLocaleToDate);
                console.log("date end", target);
                console.log("result1", result1);
                console.log("result2", result2);

                var stop = false;
                var done = false;
                if (GetPost.length - i == 1) {
                    done = true;
                }
                if (result2 >= result1) {
                    done = false;
                    stop = true;
                }
                console.log("index", i);
                console.log("done status", done);
                console.log("stop status", stop);
                console.log("------------------------------------------");
                if (!stop) {
                    var postType  = GetPost[i].postType;
                    var data_media = null;
                    var postID = GetPost[i].postID.toString();

                    if (postType == "vid") {
                        data_media = await this.mediavideosService.findOnepostID(postID);
                    } else if (postType == "pict") {
                        data_media = await this.mediapictsService.findOnepostID(postID);
                    } else if (postType == "diary") {
                        data_media = await this.mediadiariesService.findOnepostID(postID);
                    } else if (postType == "story") {
                        data_media = await this.mediastoriesService.findOnepostID(postID);
                    }

                    if ((await this.utilsService.ceckData(data_media))) {
                        var data_userbasic = await this.userbasicsService.findOne(GetPost[i].email.toString());
                        if (await this.utilsService.ceckData(data_userbasic)) {
                            var CreateUserplaylistDto_ = new CreateUserplaylistDto();
                            CreateUserplaylistDto_.userPostId = Object(data_userbasic._id);
                            CreateUserplaylistDto_.mediaId = data_media._id.toString();
                            CreateUserplaylistDto_.postType = GetPost[i].postType;
                            await this.postsService.generateUserPlaylist(CreateUserplaylistDto_);
                        }
                    }
                    await this.utilsService.updateSetting("EngineUserPlaylistIndex", i);
                    await this.utilsService.updateSetting("EngineUserPlaylistDone", done);
                } else {
                    await this.utilsService.updateSetting("EngineUserPlaylistIndex", i-1);
                    await this.utilsService.updateSetting("EngineUserPlaylistDone", done);
                    console.log("-------------------break------------------");
                    break;
                }
            }
        }
    }
}