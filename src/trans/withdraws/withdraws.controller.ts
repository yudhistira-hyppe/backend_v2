import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Res } from '@nestjs/common';
import { WithdrawsService } from './withdraws.service';
import { CreateWithdrawsDto } from './dto/create-withdraws.dto';
import { Withdraws } from './schemas/withdraws.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('withdraws')
export class WithdrawsController {

    constructor(private readonly WithdrawsService: WithdrawsService) { }

}
