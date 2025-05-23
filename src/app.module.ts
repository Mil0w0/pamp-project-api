import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { StudentBatch } from "./studentBatch/studentBatch.entity";
import { StudentBatchesController } from "./studentBatch/studentBatches.controller";
import { StudentBatchesService } from "./studentBatch/studentBatches.service";
import { HttpModule } from "@nestjs/axios";
import { StudentService } from "./studentBatch/students.service";

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/pamp_projects",
      entities: [StudentBatch],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([StudentBatch]),
  ],
  controllers: [AppController, StudentBatchesController],
  providers: [AppService, StudentBatchesService, StudentService],
})
export class AppModule {}
