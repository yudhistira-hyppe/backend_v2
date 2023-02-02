import { Controller, Logger } from '@nestjs/common';


@Controller('api/ads')
export class AdsLandingController {
    private readonly logger = new Logger(AdsLandingController.name);

    constructor() { }
}
