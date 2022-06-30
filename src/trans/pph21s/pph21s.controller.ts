import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Pph21sService } from './pph21s.service';
import { CreatePph21sDto } from './dto/create-pph21s.dto';
import { Pph21s } from './schemas/pph21s.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/pph21s')
export class Pph21sController {


}
