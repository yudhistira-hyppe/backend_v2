import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
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

    room(email: string, payload: string): void {
        this.server.socketsJoin("f89c6e7d-e8ac-48b9-b10e-95a65fef4b92");
        this.server.to("f89c6e7d-e8ac-48b9-b10e-95a65fef4b92").emit("payload", payload);
        this.server.socketsLeave("f89c6e7d-e8ac-48b9-b10e-95a65fef4b92");
    }            

    @SubscribeMessage('coba')
    coba(payload: string): void {
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