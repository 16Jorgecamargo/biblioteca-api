import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiException } from './api.exception.js';

interface ErrorBody {
  status: number;
  codigo: string;
  mensagem: string;
}

const DEFAULT_CODES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'REQUISICAO_INVALIDA',
  [HttpStatus.NOT_FOUND]: 'NAO_ENCONTRADO',
  [HttpStatus.CONFLICT]: 'CONFLITO',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const erro = this.buildErrorBody(exception);

    response.status(erro.status).json({
      sucesso: false,
      erro,
      caminho: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  private buildErrorBody(exception: unknown): ErrorBody {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
      return {
        status,
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro interno do servidor',
      };
    }

    const httpException = exception as HttpException;
    return {
      status,
      codigo:
        httpException instanceof ApiException
          ? httpException.codigo
          : (DEFAULT_CODES[status] ?? 'ERRO_HTTP'),
      mensagem: this.extractMessage(httpException),
    };
  }

  private extractMessage(exception: HttpException): string {
    const body = exception.getResponse();
    const message =
      typeof body === 'string'
        ? body
        : ((body as { message?: string | string[] }).message ??
          exception.message);
    return Array.isArray(message) ? message.join('; ') : message;
  }
}
