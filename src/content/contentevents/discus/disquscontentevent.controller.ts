import { Controller} from '@nestjs/common';
import { DisqusContentEventService } from './disqusdisquscontentevent.service';

const Long = require('mongodb').Long;
@Controller('api/')
export class DisqusContentEventController {

  constructor(private readonly disqusContentEventService: DisqusContentEventService,) { }

}
