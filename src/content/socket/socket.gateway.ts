import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { from, map, Observable } from 'rxjs';

@WebSocketGateway(
    // 5002, 
    {
        // namespace: 'events',
        // transports: ['websocket','polling'],
        cors: {
            origin: '*',
        },
        //allowEIO3:false
    }
)
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('AppGateway');

    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, payload: string): void {
        this.server.emit('msgToClient', payload);
    }

    directMessage(email: string, payload: string): void {
        this.server.emit(email, payload);
    }        

    room(room: string, payload: string): void {
        //this.server.socketsJoin("45b0bb4c-2ef6-4d9f-8ab2-c30a6ace1256");
        //this.server.to("45b0bb4c-2ef6-4d9f-8ab2-c30a6ace1256").emit("payload", payload);
        console.log("room emit: " + payload);
        //this.server.emit(room, payload);
        this.server.emit("event_disqus", payload, (data) => console.log(data));
        //this.server.socketsLeave("45b0bb4c-2ef6-4d9f-8ab2-c30a6ace1256");
    }  

    @SubscribeMessage('TEST_COBA')
    findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
        return from([1, 2, 3]).pipe(map(item => ({ event: 'TEST_COBA', data: item })));
    }

    @SubscribeMessage('identity')
    async identity(@MessageBody() data: number): Promise<number> {
        return data;
    }

    testCoba(payload: string) {
        this.server.emit('events', payload);
    } 
    
    @SubscribeMessage('TEST_COBA')
    handleTestCoba(@MessageBody() payload: any): Observable<WsResponse<number>> {
        console.log("Subscribe: " + payload);
        return payload;
    }

    @SubscribeMessage('coba')
    coba(@MessageBody() payload: string): void {
        this.server.emit('coba', payload);
    }    

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }
}