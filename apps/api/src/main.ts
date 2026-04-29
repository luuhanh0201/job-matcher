/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ field thừa
      forbidNonWhitelisted: true, // báo lỗi nếu có field lạ
      transform: true, // convert type
    }),
  );
  app.setGlobalPrefix('api');
  // const loggingMiddleware = new LoggingMiddleware();

  // app.use((req, res, next) =>
  //   loggingMiddleware.use(
  //     req as Request,
  //     res as Response,
  //     next as NextFunction,
  //   ),
  // );
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Job Matcher API')
    .setDescription('API documentation for Job Matcher backend')
    .setVersion('1.0.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    useGlobalPrefix: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
