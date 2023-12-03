import { Logger, Module, Provider } from '@nestjs/common';
import { GrpcController } from './controllers/grpc/grpc.controller';
import { HttpController } from './controllers/http/http.controller';

import { createLogger, format, transports } from 'winston';
import { WinstonModule, utilities } from 'nest-winston';

export const loggerProvider = (): Provider => {

  const loggerInstance = createLogger({
    transports: [
      new transports.Console({
        level: "debug",
        format: format.combine(
          format.timestamp(),
          format.ms(),
          utilities.format.nestLike('App Module', {
            // options
          }),
        ),
      }),
      // other transports...
    ],
    
  });

  return {
    provide: Logger,
    useFactory: async () => {
      return await WinstonModule.createLogger({
        instance: loggerInstance,
      });
    },
  }
};

@Module({
  imports: [],
  controllers: [GrpcController, HttpController],
  providers: [loggerProvider()],
})
export class AppModule { }
