import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetuserprofilesController } from './getuserprofiles.controller';
import { GetuserprofilesService } from './getuserprofiles.service';
import { ConfigModule } from '@nestjs/config';
import { Getuserprofiles, GetuserprofilesSchema } from './schemas/getuserprofiles.schema';
import { FileSystemStoredFile, FormDataRequest,NestjsFormDataModule } from 'nestjs-form-data';
@Module({
 
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Getuserprofiles.name, schema: GetuserprofilesSchema }],'SERVER_TRANS')
],
controllers: [GetuserprofilesController],
exports: [GetuserprofilesService],
providers: [GetuserprofilesService],
})
export class GetuserprofilesModule {}
