import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Transactions, TransactionsSchema } from "../transactions/schemas/transactions.schema";
import { TransactionsPostController } from "./transactionspost.controller";
import { TransactionsPostService } from "./transactionspost.service";


@Module({

    imports: [
        MongooseModule.forFeature([{ name: Transactions.name, schema: TransactionsSchema }], 'SERVER_FULL')
    ],
    controllers: [TransactionsPostController],
    exports: [TransactionsPostService],
    providers: [TransactionsPostService],

})
export class TransactionsPostModule { }
