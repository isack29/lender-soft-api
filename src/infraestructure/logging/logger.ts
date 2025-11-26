import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';
import { ConfigService } from '@nestjs/config';

type LoggerConfig = {
  pinoHttp: {
    level?: string;
    transport?: {
      target: string;
      options?: {
        colorize?: boolean;
        translateTime?: string;
        singleLine?: boolean;
        ignore?: string;
        messageFormat?: string;
      };
    };
    serializers?: {
      req?: (req: IncomingMessage & { method?: string; url?: string }) => {
        method?: string;
        url?: string;
      };
      res?: (res: ServerResponse & { statusCode?: number }) => {
        statusCode?: number;
      };
    };
  };
};

const loggerConfigAsync = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): LoggerConfig => {
    return {
      pinoHttp: {
        level: configService.get<string>('log.level', 'info'),
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            singleLine: true,
            ignore: 'pid,hostname',
            messageFormat: '{req.method} {req.url} {res.statusCode} - {msg}',
          },
        },
        serializers: {
          req: (req: IncomingMessage & { method?: string; url?: string }) => ({
            method: req.method || 'unknown',
            url: req.url || 'unknown',
          }),
          res: (res: ServerResponse & { statusCode?: number }) => ({
            statusCode: res.statusCode || 0,
          }),
        },
      },
    };
  },
};

export const LoggerConfiguredModule =
  LoggerModule.forRootAsync(loggerConfigAsync);
