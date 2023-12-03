import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { createLogger, transports, format } from 'winston';

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

  const config = new DocumentBuilder()
    .setTitle('First Service')
    .setDescription('First Service API')
    .setVersion('1.0')
    .addTag('first-service')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3002);
}
bootstrap();
