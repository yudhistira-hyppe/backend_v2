import { Body, Controller, Post, UploadedFiles, Get, Headers, UseInterceptors, Req, BadRequestException, NotAcceptableException, Res, HttpException, HttpStatus, HttpCode, Request, Query, UseGuards } from "@nestjs/common";
import { AnyFilesInterceptor, FileFieldsInterceptor } from "@nestjs/platform-express/multer";
import * as fse from 'fs-extra';
import * as fs from 'fs';
import { MediaService } from "./media.service";
import { ErrorHandler } from "../../utils/error.handler";
import { SeaweedfsService } from "../seaweedfs/seaweedfs.service";
import { CreateMediaproofpictsDto } from "../../content/mediaproofpicts/dto/create-mediaproofpicts.dto";
import { UtilsService } from "../../utils/utils.service";
import { extname } from "path";
import { diskStorage } from "multer";
import { AwsService } from "../aws/aws.service";
import { UserbasicsService } from "../../trans/userbasics/userbasics.service";
import { MediaproofpictsService } from "../../content/mediaproofpicts/mediaproofpicts.service";
import { MediaprofilepictsService } from "../../content/mediaprofilepicts/mediaprofilepicts.service";
import mongoose from "mongoose";
import { SettingsService } from "../../trans/settings/settings.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { UserauthsService } from "../../trans/userauths/userauths.service";

//import FormData from "form-data";
const multer = require('multer');
var FormData = require('form-data');
var path = require("path");

export const multerConfig = {
    //dest: process.env.PATH_UPLOAD,
    dest: './temp/'
};

export const multerOptions = {
    limits: {
        fileSize: +process.env.MAX_FILE_SIZE,
    },
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            cb(null, true);
        } else {
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        }
    },
    storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
            const uploadPath = multerConfig.dest;
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
        },
        filename: (req: any, file: any, cb: any) => {
            const fileName = file.originalname.toLowerCase().split(' ').join('-');
            cb(null, fileName)
        },
    }),
};

@Controller()
export class MediaController {
    constructor(
        private readonly mediaService: MediaService,
        private readonly errorHandler: ErrorHandler,
        private readonly awsService: AwsService,
        private readonly utilsService: UtilsService,
        private readonly settingsService: SettingsService,
        private readonly mediaproofpictsService: MediaproofpictsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly mediaprofilepictsService: MediaprofilepictsService,
        private readonly userauthsService: UserauthsService,
        private readonly seaweedfsService: SeaweedfsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('api/posts/profilepicture')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'profilePict', maxCount: 1 }, { name: 'proofPict', maxCount: 1, }], multerOptions))
    async uploadcomparing(
        @UploadedFiles() files: {
            profilePict?: Express.Multer.File[],
            proofPict?: Express.Multer.File[]
        },
        @Body() request,
        @Headers() headers) {
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed header email is required',
            );
        }
        if (request.email == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param mail is required',
            );
        }

        //Var profilePict
        var profilePict_data = null;
        var profilePict_filename = '';
        var profilePict_etx = '';
        let profilePict_mimetype = '';
        var profilePict_name = '';
        var profilePict_filename_new = '';
        let profilePict_local_path = '';
        let profilePict_seaweedfs_path = '';

        //Var proofPict
        var proofPict_data = null;
        var proofPict_filename = '';
        var proofPict_etx = '';
        let proofPict_mimetype = '';
        var proofPict_name = '';
        var proofPict_filename_new = '';
        let proofPict_local_path = '';
        let proofPict_seaweedfs_path = '';

        //Var bitmap
        let bitmap_profilePict = null;
        let bitmap_proofPict = null;

        //Var buffer
        let buffer_profilePict = null;
        let buffer_proofPict = null;

        var id_mediaprofilepicts = null;
        var mongoose_gen_media = null;

        var request_email = null;
        var request_verifyID = null;

        request_email = request.email;
        request_verifyID = request.verifyID;

        //Ceck User Userbasics
        const datauserbasicsService = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );

        if (await this.utilsService.ceckData(datauserbasicsService)) {
            if (datauserbasicsService.profilePict != undefined) {
                var profilePict_json = JSON.parse(JSON.stringify(datauserbasicsService.profilePict));
                id_mediaprofilepicts = profilePict_json.$id;
                //Ceck User profilePict
                const datamediaprofilepictsService = await this.mediaprofilepictsService.findOne(
                    id_mediaprofilepicts,
                );

                if (await this.utilsService.ceckData(datamediaprofilepictsService)) {
                    mongoose_gen_media = datamediaprofilepictsService.mediaBasePath.toString().replace("/profilepict/", "");
                } else {
                    mongoose_gen_media = new mongoose.Types.ObjectId();
                }
            } else {
                id_mediaprofilepicts = await this.utilsService.generateId();
                mongoose_gen_media = new mongoose.Types.ObjectId();
            }
            //Ceck cardPict
            if (files.profilePict != undefined) {
                var FormData_ = new FormData();
                profilePict_data = files.profilePict[0];
                profilePict_mimetype = files.profilePict[0].mimetype;
                profilePict_filename = files.profilePict[0].filename;
                //profilePict_etx = profilePict_filename.substring(profilePict_filename.lastIndexOf('.') + 1, profilePict_filename.length);
                profilePict_etx = 'jpeg';
                profilePict_name = profilePict_filename.substring(0, profilePict_filename.lastIndexOf('.'));

                //New Name file cardPict
                profilePict_filename_new = id_mediaprofilepicts + '_0001.' + profilePict_etx;
                //Rename Name file cardPict
                fs.renameSync('./temp/' + profilePict_filename, './temp/' + profilePict_filename_new);
                //Local path
                profilePict_local_path = './temp/' + mongoose_gen_media.toString() + '/profilepict/' + profilePict_filename_new;
                //SeaweedFs path
                profilePict_seaweedfs_path = '/' + mongoose_gen_media.toString() + '/profilepict/';

                //Create Folder Id
                if (await this.utilsService.createFolder('./temp/', mongoose_gen_media.toString())) {
                    //Create folder proofpict
                    if (await this.utilsService.createFolder('./temp/' + mongoose_gen_media + '/', 'profilepict')) {
                        //Move File
                        await fse.move('./temp/' + profilePict_filename_new, './temp/' + mongoose_gen_media.toString() + '/profilepict/' + profilePict_filename_new);
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed create folder proofpict',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed create folder ' + mongoose_gen_media.toString(),
                    );
                }

                //Upload Seaweedfs
                try {
                    FormData_.append('proofpict', fs.createReadStream(path.resolve(profilePict_local_path)));
                    await this.seaweedfsService.write(profilePict_seaweedfs_path, FormData_);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed proofpict failed upload seaweedfs',
                    );
                }

                //Delete directory recursively
                fs.rm('./temp/' + mongoose_gen_media.toString(), { recursive: true }, (err) => {
                    if (err) {
                        throw err;
                    }
                });

                return {
                    "response_code": 202,
                    "messages": {
                        "info": [
                            "Update Profile interest successful"
                        ]
                    }
                };
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed cardPict is required',
                );
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/posts/verificationid')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'cardPict', maxCount: 1 }, { name: 'selfiepict', maxCount: 1, }], multerOptions))
    async uploadcomparingid(
        @UploadedFiles() files: {
            cardPict?: Express.Multer.File[],
            selfiepict?: Express.Multer.File[]
        },
        @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
        @Headers() headers) {
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
        if (CreateMediaproofpictsDto_.idcardnumber == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed idcardnumber is required',
            );
        } else {
            if (CreateMediaproofpictsDto_.idcardnumber.length < 16) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed idcardnumber must length 16 digit',
                );
            }
        }
        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email is required',
            );
        }
        var titleingagal = "Verifikasi Gagal";
        var titleengagal = "Verification Failed";
        var bodyingagal = "Proses identifikasi gagal, coba ulangi kembali";
        var bodyengagal = "Identification failed, please try again";

        var titleinsukses = "Verifikasi Berhasil";
        var titleensukses = "Verification Successful";
        var bodyinsukses = "Proses identifikasi berhasil, kamu telah terverifikasi";
        var bodyensukses = "Identification successful, you’ve been verified";
        var eventType = "VERIFICATIONID";
        var event = "REQUEST";
        //Var cardPict
        let cardPict_data = null;
        let cardPict_filename = '';
        let cardPict_etx = '';
        let cardPict_mimetype = '';
        let cardPict_name = '';
        let cardPict_filename_new = '';
        let cardPict_local_path = '';
        let cardPict_seaweedfs_path = '';

        //Var selfiepict
        let selfiepict_data = null;
        let selfiepict_filename = '';
        let selfiepict_etx = '';
        let selfiepict_mimetype = '';
        let selfiepict_name = '';
        let selfiepict_filename_new = '';
        let selfiepict_local_path = '';
        let selfiepict_seaweedfs_path = '';

        //Var bitmap
        let bitmap_cardPict = null;
        let bitmap_selfiepict = null;

        //Var buffer
        let buffer_cardPict = null;
        let buffer_selfiepict = null;

        //Var response facedetect
        let face_detect_cardPict = null;
        let face_detect_selfiepict = null;

        let id_mediaproofpicts_ = null;
        let iduserbasic = null;
        let emailuserbasic = null;

        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Var generate id
        var IdMediaproofpictsDto = await this.utilsService.generateId();
        //Var generate id mongoose
        var mongoose_gen_meida = new mongoose.Types.ObjectId();

        //Get Setting Similarity
        var Similarity = await (await this.settingsService.findOneByJenis('Similarity')).value;

        //Ceck User Userbasics
        const datauserbasicsService = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );
        if (await this.utilsService.ceckData(datauserbasicsService)) {
            emailuserbasic = datauserbasicsService.email;
            //Ceck cardPict
            if (files.cardPict != undefined) {
                var FormData_ = new FormData();
                cardPict_data = files.cardPict[0];
                cardPict_mimetype = files.cardPict[0].mimetype;
                cardPict_filename = files.cardPict[0].filename;
                cardPict_etx = cardPict_filename.substring(cardPict_filename.lastIndexOf('.') + 1, cardPict_filename.length);
                cardPict_name = cardPict_filename.substring(0, cardPict_filename.lastIndexOf('.'));

                //New Name file cardPict
                cardPict_filename_new = IdMediaproofpictsDto + '_0001.' + cardPict_etx;
                //Rename Name file cardPict
                fs.renameSync('./temp/' + cardPict_filename, './temp/' + cardPict_filename_new);

                //Local path
                cardPict_local_path = './temp/' + mongoose_gen_meida._id.toString() + '/proofpict/' + cardPict_filename_new;
                //SeaweedFs path
                cardPict_seaweedfs_path = '/' + mongoose_gen_meida._id.toString() + '/proofpict/';

                //Create Folder Id
                if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida._id.toString())) {
                    //Create folder proofpict
                    if (await this.utilsService.createFolder('./temp/' + mongoose_gen_meida + '/', 'proofpict')) {
                        //Move File
                        await fse.move('./temp/' + cardPict_filename_new, './temp/' + mongoose_gen_meida._id.toString() + '/proofpict/' + cardPict_filename_new);
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed create folder proofpict',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed create folder ' + mongoose_gen_meida._id.toString(),
                    );
                }

                //AWS face detect proofpict
                try {
                    //Create bitmap from local
                    bitmap_cardPict = await fs.readFileSync('./temp/' + mongoose_gen_meida._id.toString() + '/proofpict/' + cardPict_filename_new, 'base64');
                    buffer_cardPict = Buffer.from(bitmap_cardPict, 'base64');

                    var data_cardPict = {
                        "Attributes": ["ALL"],
                        "Image": {
                            "Bytes": buffer_cardPict,
                        }
                    };

                    //AWS face detect 
                    face_detect_cardPict = await this.awsService.detect(data_cardPict);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed face detect proofpict ' + err,
                    );
                }

                //Upload Seaweedfs
                try {
                    FormData_.append('proofpict', fs.createReadStream(path.resolve(cardPict_local_path)));
                    await this.seaweedfsService.write(cardPict_seaweedfs_path, FormData_);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed proofpict failed upload seaweedfs',
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed cardPict is required',
                );
            }

            //Ceck selfiepict
            if (files.selfiepict != undefined) {
                var FormData_ = new FormData();
                selfiepict_data = files.selfiepict[0];
                selfiepict_mimetype = files.cardPict[0].mimetype;
                selfiepict_filename = files.selfiepict[0].filename;
                selfiepict_etx = selfiepict_filename.substring(selfiepict_filename.lastIndexOf('.') + 1, selfiepict_filename.length);
                selfiepict_name = selfiepict_filename.substring(0, selfiepict_filename.lastIndexOf('.'));

                //New Name file selfiepict
                selfiepict_filename_new = mongoose_gen_meida._id.toString() + '_0001.' + selfiepict_etx;
                //Rename Name file selfiepict
                await fs.renameSync('./temp/' + selfiepict_filename, './temp/' + selfiepict_filename_new);
                //Local path
                selfiepict_local_path = './temp/' + mongoose_gen_meida._id.toString() + '/selfiepict/' + selfiepict_filename_new;
                //SeaweedFs path
                selfiepict_seaweedfs_path = '/' + mongoose_gen_meida._id.toString() + '/selfiepict/';

                //Create Folder Id
                if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida._id.toString())) {
                    //Create folder selfiepict
                    if (await this.utilsService.createFolder('./temp/' + mongoose_gen_meida._id.toString() + '/', 'selfiepict')) {
                        //Move File
                        await fse.move('./temp/' + selfiepict_filename_new, './temp/' + mongoose_gen_meida._id.toString() + '/selfiepict/' + selfiepict_filename_new);
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed create folder selfiepict',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed create folder ' + mongoose_gen_meida._id.toString(),
                    );
                }

                //AWS face detect selfiepict
                try {
                    //Create bitmap from local
                    bitmap_selfiepict = await fs.readFileSync('./temp/' + mongoose_gen_meida._id.toString() + '/selfiepict/' + selfiepict_filename_new, 'base64');
                    buffer_selfiepict = Buffer.from(bitmap_selfiepict, 'base64');

                    var data_selfiepict = {
                        "Attributes": ["ALL"],
                        "Image": {
                            "Bytes": buffer_selfiepict,
                        }
                    };
                    //AWS face detect 
                    face_detect_selfiepict = await this.awsService.detect(data_selfiepict);
                } catch (err) {

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed face detect selfiepict ' + err,
                    );
                }

                //Upload Seaweedfs
                try {
                    FormData_.append('selfiepict', fs.createReadStream(path.resolve(selfiepict_local_path)));
                    await this.seaweedfsService.write(selfiepict_seaweedfs_path, FormData_);
                } catch (err) {

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed selfiepict failed upload seaweedfs ' + err,
                    );
                }
            } else {


                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed selfiepict is required',
                );
            }

            //Ceck Data user proofPict
            if (datauserbasicsService.proofPict != undefined) {
                //Update proofPict
                try {
                    var proofPict_json = JSON.parse(JSON.stringify(datauserbasicsService.proofPict));
                    var data_mediaproofpicts = await this.mediaproofpictsService.findOne(proofPict_json.$id);
                    id_mediaproofpicts_ = data_mediaproofpicts._id;
                    CreateMediaproofpictsDto_._id = data_mediaproofpicts._id;
                    CreateMediaproofpictsDto_.mediaID = data_mediaproofpicts.mediaID;
                    CreateMediaproofpictsDto_.active = true;
                    CreateMediaproofpictsDto_.valid = false;
                    CreateMediaproofpictsDto_.createdAt = current_date;
                    CreateMediaproofpictsDto_.updatedAt = current_date;
                    CreateMediaproofpictsDto_.postType = 'proofpict';
                    CreateMediaproofpictsDto_.mediaType = 'image';
                    CreateMediaproofpictsDto_.mediaBasePath = mongoose_gen_meida + '/proofpict/';
                    CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                    CreateMediaproofpictsDto_.originalName = cardPict_filename;
                    CreateMediaproofpictsDto_.fsSourceUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
                    CreateMediaproofpictsDto_.fsTargetUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                    CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                    CreateMediaproofpictsDto_.mediaSelfieBasePath = mongoose_gen_meida + '/selfiepict/';
                    CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;
                    CreateMediaproofpictsDto_.SelfiefsSourceUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfiefsSourceName = cardPict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
                    CreateMediaproofpictsDto_.SelfiefsTargetUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                    CreateMediaproofpictsDto_.userId = {
                        $ref: "userbasics",
                        $id: Object(datauserbasicsService._id.toString()),
                        $db: "hyppe_trans_db"
                    }
                    await this.mediaproofpictsService.updatebyId(data_mediaproofpicts._id.toString(), CreateMediaproofpictsDto_);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed update Mediaproofpicts ' + err,
                    );
                }
            } else {
                //Insert proofPict
                try {
                    id_mediaproofpicts_ = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_._id = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_.mediaID = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_.active = true;
                    CreateMediaproofpictsDto_.valid = false;
                    CreateMediaproofpictsDto_.createdAt = current_date;
                    CreateMediaproofpictsDto_.updatedAt = current_date;
                    CreateMediaproofpictsDto_.postType = 'proofpict';
                    CreateMediaproofpictsDto_.mediaType = 'image';
                    CreateMediaproofpictsDto_.mediaBasePath = mongoose_gen_meida + '/proofpict/';
                    CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                    CreateMediaproofpictsDto_.originalName = cardPict_filename;
                    CreateMediaproofpictsDto_.fsSourceUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
                    CreateMediaproofpictsDto_.fsTargetUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                    CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                    CreateMediaproofpictsDto_.mediaSelfieBasePath = mongoose_gen_meida + '/selfiepict/';
                    CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;
                    CreateMediaproofpictsDto_.SelfiefsSourceUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfiefsSourceName = cardPict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
                    CreateMediaproofpictsDto_.SelfiefsTargetUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                    CreateMediaproofpictsDto_.userId = {
                        $ref: "userbasics",
                        $id: Object(datauserbasicsService._id.toString()),
                        $db: "hyppe_trans_db"
                    }
                    await this.mediaproofpictsService.create(CreateMediaproofpictsDto_);
                    await this.userbasicsService.updatebyEmail(datauserbasicsService.email.toString(), {
                        idProofName: CreateMediaproofpictsDto_.nama,
                        idProofNumber: CreateMediaproofpictsDto_.idcardnumber,
                        idProofStatus: 'COMPLETE',
                        proofPict: {
                            $ref: 'mediaproofpicts',
                            $id: new Object(IdMediaproofpictsDto),
                            $db: 'hyppe_content_db'
                        }
                    });
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed insert Mediaproofpicts ' + err,
                    );
                }
            }

            //Delete directory recursively
            fs.rm('./temp/' + mongoose_gen_meida._id.toString(), { recursive: true }, (err) => {
                if (err) {
                    throw err;
                }
            });

            //Ceck face detect true
            if (face_detect_selfiepict.FaceDetails.length > 0 && face_detect_cardPict.FaceDetails.length > 0) {
                try {
                    var data_comparing = {
                        "SimilarityThreshold": Similarity,
                        "SourceImage": {
                            "Bytes": buffer_cardPict
                        },
                        "TargetImage": {
                            "Bytes": buffer_selfiepict
                        }
                    };

                    //Face comparing
                    face_detect_selfiepict = await this.awsService.comparing(data_comparing);
                    if (face_detect_selfiepict.FaceMatches.length > 0) {
                        iduserbasic = datauserbasicsService._id;
                        emailuserbasic = datauserbasicsService.email;
                        var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                        _CreateMediaproofpictsDto.status = 'FINISH';
                        _CreateMediaproofpictsDto.valid = true;
                        await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                        iduserbasic = datauserbasicsService._id;
                        await this.userbasicsService.updateIdVerified(iduserbasic);
                        await this.userauthsService.update(emailuserbasic, 'ROLE_PREMIUM');
                        await this.utilsService.sendFcm(emailuserbasic, titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);

                        return {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": true
                            },
                            "messages": {
                                "info": [
                                    "Face match"
                                ]
                            }
                        };
                    } else {
                        var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                        _CreateMediaproofpictsDto.state = 'Kesalahan KTP Pict dan Selfie Pict';
                        await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                        await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                        await this.errorHandler.generateCustomNotAcceptableException(
                            {
                                "response_code": 202,
                                "data": {
                                    "id_mediaproofpicts": id_mediaproofpicts_,
                                    "valid": false
                                },
                                "messages": {
                                    "info": [
                                        "Face not match"
                                    ]
                                }
                            }
                        );
                    }
                } catch (err) {
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.state = 'Kesalahan KTP Pict';
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Face not match"
                                ]
                            }
                        }
                    );
                }
                return face_detect_selfiepict;
            } else {
                if (face_detect_selfiepict.FaceDetails.length == 0) {
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.state = 'Kesalahan Selfie Pict';
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Unabled to proceed selfiepict not face detect"
                                ]
                            }
                        }
                    );
                }
                if (face_detect_cardPict.FaceDetails.length == 0) {
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.state = 'KTP Pict';
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Unabled to proceed cardPict not face detect"
                                ]
                            }
                        }
                    );
                }
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/posts/supportfile')
    @UseInterceptors(AnyFilesInterceptor(multerOptions))
    async uploadsuportfile(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
        @Headers() headers) {
        var idmediaproofpict = CreateMediaproofpictsDto_._id.toString();

        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }

        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email is required',
            );
        }

        var countfile = files.length;
        //Var supportFile
        let supportFile_data = null;
        let supportFile_filename = '';
        let supportFile_etx = '';
        let supportFile_mimetype = '';
        let supportFile_name = '';
        let supportFile_filename_new = '';
        let supportFile_local_path = '';
        let supportFile_seaweedfs_path = '';
        var arrayUri = [];
        var arrayName = [];
        var arraySuri = [];
        var arraySname = [];

        //Var bitmap
        let bitmap_supportFile = null;

        //Var buffer
        let buffer_supportFile = null;

        //Var response facedetect
        let face_detect_supportFile = null;

        let id_mediaproofpicts_ = null;

        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Var generate id
        // var IdMediaproofpictsDto = await this.utilsService.generateId();
        //Var generate id mongoose


        //Ceck User Userbasics
        const datamediaproofService = await this.mediaproofpictsService.findOne(
            idmediaproofpict
        );

        if (await this.utilsService.ceckData(datamediaproofService)) {
            // var mongoose_gen_meida = new mongoose.Types.ObjectId();



            var paths = datamediaproofService.mediaBasePath.toString();
            // var mongoose_gen_meida = paths.replace("/PROOF_PICTURE/", "");
            var mongoose_gen_meidas = paths.split('/');
            var mongoose_gen_meida = mongoose_gen_meidas[0];
            //Ceck supportFile
            if (files != undefined) {


                for (var i = 0; i < countfile; i++) {
                    var FormData_ = new FormData();
                    supportFile_data = files[i];
                    supportFile_mimetype = files[i].mimetype;
                    supportFile_filename = files[i].filename;
                    supportFile_etx = supportFile_filename.substring(supportFile_filename.lastIndexOf('.') + 1, supportFile_filename.length);
                    supportFile_name = supportFile_filename.substring(0, supportFile_filename.lastIndexOf('.'));

                    //New Name file supportFile
                    supportFile_filename_new = idmediaproofpict + '_000' + (i + 1) + '.' + supportFile_etx;
                    //Rename Name file supportFile
                    fs.renameSync('./temp/' + supportFile_filename, './temp/' + supportFile_filename_new);

                    //Local path
                    supportFile_local_path = './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new;
                    //SeaweedFs path
                    supportFile_seaweedfs_path = '/' + mongoose_gen_meida + '/supportfile/';

                    //Create Folder Id
                    if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

                        await fse.move('./temp/' + supportFile_filename_new, './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new);
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed create folder ' + mongoose_gen_meida,
                        );
                    }

                    //Upload Seaweedfs
                    try {
                        FormData_.append('proofpict', fs.createReadStream(path.resolve(supportFile_local_path)));
                        await this.seaweedfsService.write(supportFile_seaweedfs_path, FormData_);
                    } catch (err) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed proofpict failed upload seaweedfs',
                        );
                    }

                    var objSuri = '/localrepo/' + mongoose_gen_meida + '/supportfile/' + supportFile_filename_new;
                    var objsname = supportFile_filename_new.replace('_000' + i, '');

                    arrayUri.push(supportFile_filename_new);
                    arrayName.push(supportFile_filename);
                    arraySuri.push(objSuri);
                    arraySname.push(objsname);
                }

            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed supportFile is required',
                );
            }

            //Ceck Data user proofPict
            if (datamediaproofService._id != undefined) {
                //Update proofPict
                try {

                    var data_mediaproofpicts = datamediaproofService;
                    id_mediaproofpicts_ = data_mediaproofpicts._id;
                    CreateMediaproofpictsDto_._id = data_mediaproofpicts._id;
                    CreateMediaproofpictsDto_.mediaID = data_mediaproofpicts.mediaID;
                    CreateMediaproofpictsDto_.active = true;
                    CreateMediaproofpictsDto_.valid = false;
                    CreateMediaproofpictsDto_.createdAt = current_date;
                    CreateMediaproofpictsDto_.updatedAt = current_date;

                    CreateMediaproofpictsDto_.mediaSupportType = 'supportfile';
                    CreateMediaproofpictsDto_.mediaSupportBasePath = mongoose_gen_meida + '/supportfile/';
                    CreateMediaproofpictsDto_.mediaSupportUri = arrayUri;
                    CreateMediaproofpictsDto_.SupportOriginalName = arrayName;
                    CreateMediaproofpictsDto_.SupportfsSourceUri = arraySuri;
                    CreateMediaproofpictsDto_.SupportfsSourceName = arraySname;
                    CreateMediaproofpictsDto_.SupportfsTargetUri = arrayUri;
                    CreateMediaproofpictsDto_.SupportmediaMime = supportFile_mimetype;
                    CreateMediaproofpictsDto_.status = 'IN_PROGGRESS';
                    await this.mediaproofpictsService.updatebyId(idmediaproofpict, CreateMediaproofpictsDto_);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed update Mediaproofpicts ' + err,
                    );
                }
            }
            else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed supportFile is required',
                );

            }


            //Delete directory recursively

            fs.rm('./temp/' + mongoose_gen_meida, { recursive: true }, (err) => {
                if (err) {
                    throw err;
                }
            });

            return {
                "response_code": 202,
                "data": {
                    "id_mediaproofpicts": idmediaproofpict,
                    "status": "IN_PROGGRESS"
                },
                "messages": {
                    "info": [
                        "Success Upload"
                    ]
                }
            };
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }


    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/posts/upload')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'cardPict', maxCount: 1 }, { name: 'selfiepict', maxCount: 1, }, { name: 'supportFile', maxCount: 10, }], multerOptions))
    async upload(
        @UploadedFiles() files1: {
            cardPict?: Express.Multer.File[],
            selfiepict?: Express.Multer.File[],
            supportFile?: Express.Multer.File[]
        },
        // @UploadedFiles() files2: Array<Express.Multer.File>,
        @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
        @Headers() headers) {
        //  var idmediaproofpict = CreateMediaproofpictsDto_._id.toString();

        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }

        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email is required',
            );
        }

        console.log(files1);
        //   console.log(files2);

        var countfile = files1.supportFile.length;
        //Var supportFile
        let supportFile_data = null;
        let supportFile_filename = '';
        let supportFile_etx = '';
        let supportFile_mimetype = '';
        let supportFile_name = '';
        let supportFile_filename_new = '';
        let supportFile_local_path = '';
        let supportFile_seaweedfs_path = '';
        var arrayUri = [];
        var arrayName = [];
        var arraySuri = [];
        var arraySname = [];

        //Var cardPict
        let cardPict_data = null;
        let cardPict_filename = '';
        let cardPict_etx = '';
        let cardPict_mimetype = '';
        let cardPict_name = '';
        let cardPict_filename_new = '';
        let cardPict_local_path = '';
        let cardPict_seaweedfs_path = '';

        //Var selfiepict
        let selfiepict_data = null;
        let selfiepict_filename = '';
        let selfiepict_etx = '';
        let selfiepict_mimetype = '';
        let selfiepict_name = '';
        let selfiepict_filename_new = '';
        let selfiepict_local_path = '';
        let selfiepict_seaweedfs_path = '';

        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Var generate id
        var IdMediaproofpictsDto = await this.utilsService.generateId();
        //Var generate id mongoose


        //Ceck User Userbasics
        const datauserbasicsService = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );

        if (await this.utilsService.ceckData(datauserbasicsService)) {
            // var mongoose_gen_meida = new mongoose.Types.ObjectId();



            var paths = IdMediaproofpictsDto;
            var mongoose_gen_meida = paths;

            //Ceck cardPict
            if (files1.cardPict != undefined) {
                var FormData_ = new FormData();
                cardPict_data = files1.cardPict[0];
                cardPict_mimetype = files1.cardPict[0].mimetype;
                cardPict_filename = files1.cardPict[0].filename;
                cardPict_etx = cardPict_filename.substring(cardPict_filename.lastIndexOf('.') + 1, cardPict_filename.length);
                cardPict_name = cardPict_filename.substring(0, cardPict_filename.lastIndexOf('.'));

                //New Name file cardPict
                cardPict_filename_new = IdMediaproofpictsDto + '_0001.' + cardPict_etx;
                //Rename Name file cardPict
                fs.renameSync('./temp/' + cardPict_filename, './temp/' + cardPict_filename_new);

                //Local path
                cardPict_local_path = './temp/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                //SeaweedFs path
                cardPict_seaweedfs_path = '/' + mongoose_gen_meida + '/proofpict/';


                //Create Folder Id
                if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {
                    //Create folder proofpict
                    if (await this.utilsService.createFolder('./temp/' + mongoose_gen_meida + '/', 'proofpict')) {
                        //Move File
                        await fse.move('./temp/' + cardPict_filename_new, './temp/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new);
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed create folder proofpict',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed create folder ' + mongoose_gen_meida,
                    );
                }

                // //Create Folder Id
                // if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

                //     await fse.move('./temp/' + cardPict_filename_new, './temp/' + mongoose_gen_meida + '/' + cardPict_filename_new);
                // } else {
                //     await this.errorHandler.generateNotAcceptableException(
                //         'Unabled to proceed create folder ' + mongoose_gen_meida,
                //     );
                // }

                //Upload Seaweedfs
                try {
                    FormData_.append('proofpict', fs.createReadStream(path.resolve(cardPict_local_path)));
                    await this.seaweedfsService.write(cardPict_seaweedfs_path, FormData_);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed proofpict failed upload seaweedfs',
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed cardPict is required',
                );
            }

            //Ceck selfiepict
            if (files1.selfiepict != undefined) {
                var FormData_ = new FormData();
                selfiepict_data = files1.selfiepict[0];
                selfiepict_mimetype = files1.cardPict[0].mimetype;
                selfiepict_filename = files1.selfiepict[0].filename;
                selfiepict_etx = selfiepict_filename.substring(selfiepict_filename.lastIndexOf('.') + 1, selfiepict_filename.length);
                selfiepict_name = selfiepict_filename.substring(0, selfiepict_filename.lastIndexOf('.'));

                //New Name file selfiepict
                selfiepict_filename_new = IdMediaproofpictsDto + '_0001.' + selfiepict_etx;
                //Rename Name file selfiepict
                await fs.renameSync('./temp/' + selfiepict_filename, './temp/' + selfiepict_filename_new);
                //Local path
                selfiepict_local_path = './temp/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new;
                //SeaweedFs path
                selfiepict_seaweedfs_path = '/' + mongoose_gen_meida + '/selfiepict/';

                // //Create Folder Id
                // if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

                //     await fse.move('./temp/' + selfiepict_filename_new, './temp/' + mongoose_gen_meida + '/' + selfiepict_filename_new);
                // } else {
                //     await this.errorHandler.generateNotAcceptableException(
                //         'Unabled to proceed create folder ' + mongoose_gen_meida,
                //     );
                // }

                //Create Folder Id
                if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {
                    //Create folder selfiepict
                    if (await this.utilsService.createFolder('./temp/' + mongoose_gen_meida + '/', 'selfiepict')) {
                        //Move File
                        await fse.move('./temp/' + selfiepict_filename_new, './temp/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new);
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed create folder selfiepict',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed create folder ' + mongoose_gen_meida
                    );
                }

                //Upload Seaweedfs
                try {
                    FormData_.append('selfiepict', fs.createReadStream(path.resolve(selfiepict_local_path)));
                    await this.seaweedfsService.write(selfiepict_seaweedfs_path, FormData_);
                } catch (err) {

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed selfiepict failed upload seaweedfs ' + err,
                    );
                }
            } else {


                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed selfiepict is required',
                );
            }
            //Ceck supportFile
            if (files1.supportFile != undefined) {


                for (var i = 0; i < countfile; i++) {
                    var FormData_ = new FormData();
                    supportFile_data = files1.supportFile[i];
                    supportFile_mimetype = files1.supportFile[i].mimetype;
                    supportFile_filename = files1.supportFile[i].filename;
                    supportFile_etx = supportFile_filename.substring(supportFile_filename.lastIndexOf('.') + 1, supportFile_filename.length);
                    supportFile_name = supportFile_filename.substring(0, supportFile_filename.lastIndexOf('.'));

                    //New Name file supportFile
                    supportFile_filename_new = IdMediaproofpictsDto + '_000' + (i + 1) + '.' + supportFile_etx;
                    //Rename Name file supportFile
                    fs.renameSync('./temp/' + supportFile_filename, './temp/' + supportFile_filename_new);

                    //Local path
                    supportFile_local_path = './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new;
                    //SeaweedFs path
                    supportFile_seaweedfs_path = '/' + mongoose_gen_meida + '/supportfile/';

                    //Create Folder Id
                    if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

                        await fse.move('./temp/' + supportFile_filename_new, './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new);
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed create folder ' + mongoose_gen_meida,
                        );
                    }

                    //Upload Seaweedfs
                    try {
                        FormData_.append('proofpict', fs.createReadStream(path.resolve(supportFile_local_path)));
                        await this.seaweedfsService.write(supportFile_seaweedfs_path, FormData_);
                    } catch (err) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed proofpict failed upload seaweedfs',
                        );
                    }

                    var objSuri = '/localrepo/' + mongoose_gen_meida + '/supportfile/' + supportFile_filename_new;
                    var objsname = supportFile_filename_new.replace('_000' + i, '');

                    arrayUri.push(supportFile_filename_new);
                    arrayName.push(supportFile_filename);
                    arraySuri.push(objSuri);
                    arraySname.push(objsname);
                }

            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed supportFile is required',
                );
            }


            // /Ceck Data user proofPict
            // Ceck Data user proofPict

            //Update proofPict
            try {


                CreateMediaproofpictsDto_._id = IdMediaproofpictsDto;
                CreateMediaproofpictsDto_.mediaID = IdMediaproofpictsDto;
                CreateMediaproofpictsDto_.active = true;
                CreateMediaproofpictsDto_.valid = false;
                CreateMediaproofpictsDto_.createdAt = current_date;
                CreateMediaproofpictsDto_.updatedAt = current_date;
                CreateMediaproofpictsDto_.postType = 'proofpict';
                CreateMediaproofpictsDto_.mediaType = 'image';
                CreateMediaproofpictsDto_.mediaBasePath = mongoose_gen_meida + '/proofpict/';
                CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                CreateMediaproofpictsDto_.originalName = cardPict_filename;
                CreateMediaproofpictsDto_.fsSourceUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
                CreateMediaproofpictsDto_.fsTargetUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                CreateMediaproofpictsDto_.mediaSupportType = 'supportfile';
                CreateMediaproofpictsDto_.mediaSupportBasePath = mongoose_gen_meida + '/supportfile/';
                CreateMediaproofpictsDto_.mediaSupportUri = arrayUri;
                CreateMediaproofpictsDto_.SupportOriginalName = arrayName;
                CreateMediaproofpictsDto_.SupportfsSourceUri = arraySuri;
                CreateMediaproofpictsDto_.SupportfsSourceName = arraySname;
                CreateMediaproofpictsDto_.SupportfsTargetUri = arrayUri;
                CreateMediaproofpictsDto_.SupportmediaMime = supportFile_mimetype;
                CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                CreateMediaproofpictsDto_.mediaSelfieBasePath = mongoose_gen_meida + '/selfiepict/';
                CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;
                CreateMediaproofpictsDto_.SelfiefsSourceUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new;
                CreateMediaproofpictsDto_.SelfiefsSourceName = selfiepict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
                CreateMediaproofpictsDto_.SelfiefsTargetUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new;
                CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                CreateMediaproofpictsDto_.status = 'IN_PROGGRESS';
                await this.mediaproofpictsService.create(CreateMediaproofpictsDto_);
                await this.userbasicsService.updatebyEmail(datauserbasicsService.email.toString(), {
                    idProofName: CreateMediaproofpictsDto_.nama,
                    idProofNumber: CreateMediaproofpictsDto_.idcardnumber,
                    idProofStatus: 'COMPLETE',
                    proofPict: {
                        $ref: 'mediaproofpicts',
                        $id: new Object(IdMediaproofpictsDto),
                        $db: 'hyppe_content_db'
                    }
                });
            } catch (err) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed failed update Mediaproofpicts ' + err,
                );
            }



            //Delete directory recursively

            fs.rm('./temp/' + mongoose_gen_meida, { recursive: true }, (err) => {
                if (err) {
                    throw err;
                }
            });

            return {
                "response_code": 202,
                "data": {
                    "id_mediaproofpicts": IdMediaproofpictsDto,
                    "status": "IN_PROGGRESS"
                },
                "messages": {
                    "info": [
                        "Success Upload"
                    ]
                }
            };
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

}