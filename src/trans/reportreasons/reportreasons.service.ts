import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReportreasonsDto } from './dto/create-reportreasons.dto';
import { Reportreasons, ReportreasonsDocument } from './schemas/reportreasons.schema';

@Injectable()
export class ReportreasonsService {

}
