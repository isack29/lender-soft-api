import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  success: boolean;
  message: string;
  error: string;
  path: string;
  details?: unknown;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determinar el status code y mensaje
    const { statusCode, message, error } = this.getErrorDetails(exception);

    // Construir la respuesta de error
    const errorResponse: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      success: false,
      message,
      error,
      path: request.url,
    };

    // Agregar detalles adicionales en desarrollo
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === 'development') {
      errorResponse.details = this.getErrorDetails(exception);
    }

    response.status(statusCode).json(errorResponse);
  }

  private getErrorDetails(exception: unknown): {
    statusCode: number;
    message: string;
    error: string;
  } {
    // Si es una HttpException de NestJS
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      // Manejar respuestas estructuradas
      if (typeof response === 'object' && response !== null) {
        const responseObj = response as Record<string, unknown>;
        const message = Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : (responseObj.message as string) || exception.message;

        return {
          statusCode: status,
          message,
          error: (responseObj.error as string) || this.getErrorName(status),
        };
      }

      // Respuesta simple (string)
      return {
        statusCode: status,
        message: typeof response === 'string' ? response : exception.message,
        error: this.getErrorName(status),
      };
    }

    // Error genérico
    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
        error: 'Internal Server Error',
      };
    }

    // Error desconocido
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      error: 'Internal Server Error',
    };
  }

  /**
   * Obtiene el nombre del error según el status code
   */
  private getErrorName(statusCode: number): string {
    const errorNames: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };

    return errorNames[statusCode] || 'Error';
  }
}
