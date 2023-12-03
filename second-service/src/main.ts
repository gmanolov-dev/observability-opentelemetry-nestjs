import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { createLogger, transports, format } from 'winston';
import { join } from 'path';

async function bootstrap() {
  const loggerInstance = createLogger({
    transports: [
      new transports.Console({
        level: "debug",
        format: format.combine(
          format.timestamp(), // format.ms(),
          nestWinstonModuleUtilities.format.nestLike('Main App', {
            // options
          }),
        ),
      }),
      // other transports...
    ],
    
  });


  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: loggerInstance,
    }),
  });
  
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'hello',
      protoPath: join(__dirname, './proto/hello.proto'),
      url: '127.0.0.1:5001',
    },
  });

  await app.startAllMicroservices();

  await app.listen(3001);


}
bootstrap();
