import { Controller } from "@nestjs/common";
import { TransactionsPostService } from "./transactionspost.service";

@Controller()
export class TransactionsPostController {
    constructor(private readonly transactionsPostService: TransactionsPostService,
    ) { }
}

