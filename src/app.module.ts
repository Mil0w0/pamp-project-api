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
import { Project } from "./project/project.entity";
import { ProjectController } from "./project/project.controller";
import { ProjectService } from "./project/project.service";

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true, // Enable env var
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      url:
        process.env.DATABASE_URL ||
        "postgres://postgres:postgres@localhost:5432/pamp_projects",
      entities: [StudentBatch, Project],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([StudentBatch, Project]),
  ],
  controllers: [AppController, StudentBatchesController, ProjectController],
  providers: [
    AppService,
    StudentBatchesService,
    StudentService,
    ProjectService,
  ],
})
export class AppModule {}
