import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Res } from '@nestjs/common';
import { UserbankaccountsService } from './userbankaccounts.service';
import { CreateUserbankaccountsDto } from './dto/create-userbankaccounts.dto';
import { Userbankaccounts } from './schemas/userbankaccounts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('userbankaccounts')
export class UserbankaccountsController {
    constructor(private readonly userbankaccountsService: UserbankaccountsService) { }


}
