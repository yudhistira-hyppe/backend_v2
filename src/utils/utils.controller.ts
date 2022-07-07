import { HttpCode, Controller, HttpStatus, Get, Param, Query,UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UtilsService } from './utils.service';
import { InterestsRepoService } from '../infra/interests_repo/interests_repo.service';


@Controller('api/utils/')
export class UtilsController {

    constructor(
        private readonly interestsRepoService: InterestsRepoService
        ) {}
    
    @UseGuards(JwtAuthGuard)
    @Get('interest?')
    @HttpCode(HttpStatus.ACCEPTED)
    async profilePict(
    @Param('langIso') langIso: string,
    @Param('pageNumber') pageNumber: number,
    @Param('pageRow') pageRow: number,
    @Param('search') search: string) {
        var langIso_ = langIso;
        var pageNumber_ = pageNumber;
        var pageRow_ = pageRow;
        var search_ = search;
        return await this.interestsRepoService.findCriteria(langIso_,pageNumber_,pageRow_,search_);
    }
}
