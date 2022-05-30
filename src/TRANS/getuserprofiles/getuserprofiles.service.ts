import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGetuserprofilesDto } from './dto/create-getuserprofiles.dto';
import { Getuserprofiles, GetuserprofilesDocument } from './schemas/getuserprofiles.schema';
import { CitiesService } from '../../infra/cities/cities.service';
// import { Cities, CitiesDocument } from '../../infra/cities/schemas/cities.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import moment from 'moment';

@Injectable()
export class GetuserprofilesService {

    constructor(
        @InjectModel(Getuserprofiles.name) private readonly getuserprofilesModel: Model<GetuserprofilesDocument>,private citiesService: CitiesService,@InjectConnection('hyppe_infra_db') private connection: Connection
      ) {}
    
      async create(CreateGetuserprofilesDto: CreateGetuserprofilesDto): Promise<Getuserprofiles> {
        const createGetuserprofilesDto = await this.getuserprofilesModel.create(CreateGetuserprofilesDto);
        return createGetuserprofilesDto;
      }
    
      async findAll(documentsToSkip = 0, limitOfDocuments?: number) {
        const query = this.getuserprofilesModel
          .find()
          .sort({ _id: 1 })
          .skip(documentsToSkip)
         ;
       
        if (limitOfDocuments) {
          query.limit(limitOfDocuments);
        }
        return query;
      }
      async findAlls(): Promise<Getuserprofiles[]> {
        return this.getuserprofilesModel.find().exec();
      }
      async findfullname(fullName: String): Promise<Getuserprofiles> {
        return this.getuserprofilesModel.findOne({ fullName: fullName}).exec();
      }
      async findgender(gender:String): Promise<Getuserprofiles> {
        return this.getuserprofilesModel.findOne({ gender:gender }).exec();
      }
      async findfullnamegender(fullName: String,gender:String): Promise<Getuserprofiles> {
        return this.getuserprofilesModel.findOne({ fullName: fullName,gender:gender }).exec();
      }

      async findTypeAkun(fullName: String,roles:String): Promise<Getuserprofiles> {
        return this.getuserprofilesModel.findOne({ fullName: fullName,roles:roles }).exec();
      }

      async findroles(roles: String): Promise<Getuserprofiles> {
        return this.getuserprofilesModel.findOne({ roles: roles}).exec();
      }
      async findfullnameroles(fullName: String,roles: String): Promise<Getuserprofiles> {
        return this.getuserprofilesModel.findOne({fullName:fullName, roles: roles}).exec();
      }
      async findfullnamegenderroles(fullName: String,roles: String,gender:String): Promise<Getuserprofiles> {
        return this.getuserprofilesModel.findOne({fullName:fullName, roles: roles,gender:gender}).exec();
      }
      async findgenderroles(roles: String,gender:String): Promise<Getuserprofiles> {
        return this.getuserprofilesModel.findOne({ roles: roles,gender:gender}).exec();
      }
      async findumur(age: Number): Promise<Getuserprofiles> {
        return this.getuserprofilesModel.findOne({ age: age}).exec();
      }

    
     
  
      async findAllage15(): Promise<Object> {
        var dbx=await this.connection.db.collection('cities').find();
      
        const query = this.getuserprofilesModel.aggregate(
          [
          {
            $addFields: {
              userAuth_id:'$userAuth.$id',
             
                        age: {
                          $dateDiff: { startDate: { $toDate: '$dob'}, endDate: '$$NOW', unit: 'year' },
                        },
                    
                    },
                    
         
       },
      
      { $match : { age : { $gt: 0, $lt: 14 } } ,},

      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
        },
      },
      {
        $addFields: {
         
          cities_id:'$cities.$id',
                  
                },
                
     
   }, {
    $lookup: {
      from:'cities' ,
      localField: 'cities_id',
      foreignField: '_id',
      as: 'cities_data',
    },
  },
      {
        
        $project: {
          gender:'$gender',
          idProofNumber:'$idProofNumber',
          fullName:'$fullName',
          bio:'$bio',
          dob:'$dob',
          age: '$age',
          mobileNumber:'$mobileNumber', 
           cities:'$cities_data',
          email: '$email',
          isIdVerified:'$isIdVerified',
          idProofStatus:'$idProofStatus',
          event:'$event',
          isComplete:'$isComplete',
          status:'$status',
          username:'$userAuth_data.username',
          uname:'$username[0]',
          roles:'$userAuth_data.roles'
       
          

        },
      },
     
    ]) ;

    
     
        return query;
      }

     
     
      async delete(id: string) {
        const deletedCat = await this.getuserprofilesModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
