import { Logger, Module, Provider } from '@nestjs/common';
import { AppController } from './app.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { createLogger, format, transports } from 'winston';
import { WinstonModule, utilities } from 'nest-winston';


console.log(process.env.SECOND_SERVICE_GRPC_URL);

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
  imports: [
    ClientsModule.register([
      {
        name: 'GRPC_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: 'hello',
          protoPath: join(__dirname, './proto/hello.proto'),
          url: process.env.SECOND_SERVICE_GRPC_URL || 'localhost:5001',
        },
      }
    ])
  ],
  controllers: [AppController],
  providers: [loggerProvider()],
})
export class AppModule { }


