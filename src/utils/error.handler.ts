import {
  Injectable,
  NotAcceptableException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';

@Injectable()
export class ErrorHandler {
  async generateNotAcceptableException(messages: string): Promise<any> {
    throw new NotAcceptableException({
      response_code: 406,
      messages: {
        info: [messages],
      },
    });
  }
  
  async generateCustomNotAcceptableException(messages: any): Promise<any> {
    throw new NotAcceptableException(messages);
  }

  async generateBadRequestException(messages: string): Promise<any> {
    throw new BadRequestException({
      response_code: 400,
      messages: {
        info: [messages],
      },
    });
  }

  async generateUnauthorizedException(messages: string): Promise<any> {
    throw new UnauthorizedException({
      response_code: 406,
      messages: {
        info: [messages],
      },
    });
  }

  async generateNotFoundException(messages: string): Promise<any> {
    throw new NotFoundException({
      response_code: 404,
      messages: {
        info: [messages],
      },
    });
  }

  async generateForbiddenException(messages: string): Promise<any> {
    throw new ForbiddenException({
      response_code: 406,
      messages: {
        info: [messages],
      },
    });
  }

  async generateResponseCode(response_code: number, messages: string): Promise<any> {
    throw new UnauthorizedException({
      response_code: response_code,
      messages: {
        info: [messages],
      },
    });
  }
}