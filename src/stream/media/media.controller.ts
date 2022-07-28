import { Body, Controller, Post, UploadedFiles, Headers, UseInterceptors, Req, NotAcceptableException, Res, HttpException, HttpStatus, HttpCode } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express/multer";
import * as fse from 'fs-extra';
import * as fs from 'fs'; 
import { request } from "http";
import { FormDataRequest } from "nestjs-form-data";
import { MediaService } from "./media.service";
import { ErrorHandler } from "../../utils/error.handler";
import { SeaweedfsService } from "../seaweedfs/seaweedfs.service";
import { CreateMediaproofpictsDto } from "src/content/mediaproofpicts/dto/create-mediaproofpicts.dto";
import { UtilsService } from "../../utils/utils.service";
import { extname } from "path";
import { diskStorage, Multer } from "multer";
import { AwsCompareFacesRequest, AwsDetectFacesRequest } from "../aws/dto/aws.dto";
import { AwsService } from "../aws/aws.service";
import { UserbasicsService } from "../../trans/userbasics/userbasics.service";
import { MediaproofpictsService } from "../../content/mediaproofpicts/mediaproofpicts.service"; 
import mongoose from "mongoose";
//import FormData from "form-data";
const multer = require('multer');
var FormData = require('form-data');
var path = require("path");

export const multerConfig = {
    dest: process.env.PATH_UPLOAD,
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
        private readonly mediaproofpictsService: MediaproofpictsService, 
        private readonly userbasicsService: UserbasicsService,
        private readonly seaweedfsService: SeaweedfsService) {}

    @Post('api/posts/profilepicture')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'profilePict', maxCount: 1 }, { name: 'proofPict', maxCount: 1, }], multerOptions))
    async uploadcomparing(
        @UploadedFiles() files: { 
            profilePict?: Express.Multer.File[], 
            proofPict?: Express.Multer.File[] 
        }, 
        @Body() request,
        @Headers() headers) {
        var profilePict_data = null;
        var profilePict_filename = '';
        var profilePict_etx = '';
        var profilePict_name = '';
        var profilePict_filename_new = '';

        var proofPict_data = null;
        var proofPict_filename = '';
        var proofPict_etx = '';
        var proofPict_name = '';
        var proofPict_filename_new = '';

        var request_email = null;
        var request_verifyID = null;

        if (request.email == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed',
            );
        }
        if (request.verifyID == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed',
            );
        }

        request_email = request.email;
        request_verifyID = request.verifyID;

        if (files.profilePict != undefined) {
            var FormData_ = new FormData();
            profilePict_data = files.profilePict[0];
            profilePict_filename = files.profilePict[0].filename;
            profilePict_etx = profilePict_filename.substring(profilePict_filename.lastIndexOf('.') + 1, profilePict_filename.length);
            profilePict_name = profilePict_filename.substring(0, profilePict_filename.lastIndexOf('.'));

            profilePict_filename_new = profilePict_name + '_25.' + profilePict_etx;
            fs.renameSync('./testing/' + profilePict_filename, './testing/' + profilePict_filename_new);

            FormData_.append('profilePict', fs.createReadStream(path.resolve('./testing/' + profilePict_filename_new)));
            await this.seaweedfsService.write('/testingupload/', FormData_);
        }

        if (files.proofPict != undefined) {
            var FormData_ = new FormData();
            proofPict_data = files.proofPict[0];
            proofPict_filename = files.proofPict[0].filename;
            proofPict_etx = proofPict_filename.substring(proofPict_filename.lastIndexOf('.') + 1, proofPict_filename.length);
            proofPict_name = proofPict_filename.substring(0, proofPict_filename.lastIndexOf('.'));

            proofPict_filename_new = proofPict_name + '_25.' + proofPict_etx;
            fs.renameSync('./testing/' + proofPict_filename, './testing/' + proofPict_filename_new);

            FormData_.append('proofPict', fs.createReadStream(path.resolve('./testing/' + proofPict_filename_new)));
            await this.seaweedfsService.write('/testingupload/', FormData_);
        }

        if (headers['x-auth-user'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Update Profile interest successful"
                ]
            }
        };
    }

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
        if (CreateMediaproofpictsDto_.idcardnumber==undefined){
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed idcardnumber is required',
            );
        }else{
            if (CreateMediaproofpictsDto_.idcardnumber.length<16) {
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

        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Var generate id
        var IdMediaproofpictsDto = await this.utilsService.generateId();
        //Var generate id mongoose
        var mongoose_gen_meida = new mongoose.Types.ObjectId();

        //Ceck User Userbasics
        const datauserbasicsService = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );

        if (await this.utilsService.ceckData(datauserbasicsService)) {
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
                try{
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
                }catch (err) {
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
            if (datauserbasicsService.proofPict!=undefined){
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
                    CreateMediaproofpictsDto_.SelfiefsTargetUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                    await this.mediaproofpictsService.updatebyId(data_mediaproofpicts._id.toString(),CreateMediaproofpictsDto_); 
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
                    CreateMediaproofpictsDto_.SelfiefsTargetUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
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
            fs.rmdir('./temp/' + mongoose_gen_meida._id.toString(), { recursive: true }, (err) => {
                if (err) {
                    throw err;
                }

                console.log(`${'./temp/' + mongoose_gen_meida._id.toString() } is deleted!`);
            });

            //Ceck face detect true
            if (face_detect_selfiepict.FaceDetails.length > 0 && face_detect_cardPict.FaceDetails.length > 0) {
                try {
                    var data_comparing = {
                        "SimilarityThreshold": 70,
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
                        var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                        _CreateMediaproofpictsDto.status = 'FINISH';
                        _CreateMediaproofpictsDto.valid = true;
                        await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                        return {
                            "response_code": 202,
                            "data":{
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "status": "FINISH",
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
                        _CreateMediaproofpictsDto.status = 'IN_PROGGRESS';
                        _CreateMediaproofpictsDto.valid = false;
                        await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                        return {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "status": "IN_PROGGRESS",
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Face not match"
                                ]
                            }
                        };
                    }
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed comparing face',
                    );
                }
                return face_detect_selfiepict;
            }else{
                if (face_detect_selfiepict.FaceDetails.length == 0) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed selfiepict not face detect',
                    );
                }
                if (face_detect_cardPict.FaceDetails.length == 0) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed cardPict not face detect',
                    );
                }
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }
}