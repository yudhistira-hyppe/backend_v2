import { Controller, Logger } from "@nestjs/common";

@Controller()
export class OssController {
    private readonly logger = new Logger(OssController.name);
    constructor() { }
}