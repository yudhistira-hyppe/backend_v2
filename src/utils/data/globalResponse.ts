import { ProfileDTO } from "./Profile";
import { GlobalMessages } from "./globalMessage";

export class GlobalResponse {
    response_code: number;
    data: ProfileDTO;
    messages: GlobalMessages;
    version: string;
}