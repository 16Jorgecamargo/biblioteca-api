import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoresModule } from './autores/autores.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { AllExceptionsFilter } from './comum/all-exceptions.filter.js';
import { LoggerMiddleware } from './comum/logger.middleware.js';
import { ResponseInterceptor } from './comum/response.interceptor.js';
import { EmprestimosModule } from './emprestimos/emprestimos.module.js';
import { LeitoresModule } from './leitores/leitores.module.js';
import { LivrosModule } from './livros/livros.module.js';

const DEFAULT_DATABASE = 'data/biblioteca.sqlite';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DB_DATABASE') || DEFAULT_DATABASE,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AutoresModule,
    CategoriasModule,
    LeitoresModule,
    LivrosModule,
    EmprestimosModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('{*splat}');
  }
}
