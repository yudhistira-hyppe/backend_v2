import { HttpCode, Controller, HttpStatus, Get, Param, Query,UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from './utils.service';
import { InterestsRepoService } from '../infra/interests_repo/interests_repo.service';


@Controller()
export class UtilsController {

    constructor(
        private readonly interestsRepoService: InterestsRepoService
        ) {}
    
    @UseGuards(JwtAuthGuard)
    @Get('profilePict/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async profilePict(
    @Param('langIso') langIso: string,
    @Param('pageNumber') pageNumber: string,
    @Param('pageRow') pageRow: string,
    @Param('search') search: string,
    @Query('x-auth-token') token: string) {
        return await this.interestsRepoService.findAll();
    }
}
