import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import {  EncryptionInterceptor } from 'middleware/encrypt.middleware';
import { DecryptInterceptor } from 'middleware/decrypt.middleware';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 
  // app.useGlobalInterceptors(new DecryptInterceptor());
  // app.useGlobalInterceptors(new EncryptionInterceptor());
  
  app.use(helmet());
  // app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: true, credentials: true });
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  const config = app.get(ConfigService);
  // app.useGlobalFilters(new HttpExceptionFilter())

  const globalPrefix = 'v1';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 1999;
  await app.startAllMicroservices();


  const configSwag = new DocumentBuilder()
    .setTitle('Go veloox System')
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

    const options: SwaggerDocumentOptions =  {
      operationIdFactory: (
        controllerKey: string,
        methodKey: string
      ) => methodKey
    };
    const document = SwaggerModule.createDocument(app, configSwag, options);
    
  // const document = SwaggerModule.createDocument(app, configSwag);
  SwaggerModule.setup('docs', app, document);


  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
    Logger.log(`Running in ${config.get('environment')} mode`);
  });
}
bootstrap();
