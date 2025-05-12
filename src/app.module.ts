import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import {StudentBatch} from "./studentBatch/studentBatch.entity";
import {StudentBatchesController} from "./studentBatch/studentBatches.controller";
import {StudentBatchesService} from "./studentBatch/studentBatches.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "pamp-project-service",
      port: 3306,
      username: process.env.DATABASE_ROOT,
      password: process.env.DATABASE_ROOT_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [StudentBatch],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([StudentBatch]),
  ],
  controllers: [AppController, StudentBatchesController],
  providers: [
    AppService,
      StudentBatchesService
  ],
})
export class AppModule {}
