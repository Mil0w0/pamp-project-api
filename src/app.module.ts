import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import {ConfigModule} from "@nestjs/config";
import {StudentBatch} from "./studentBatch/studentBatch.entity";
import {StudentBatchesController} from "./studentBatch/studentBatches.controller";
import {StudentBatchesService} from "./studentBatch/studentBatches.service";
import {HttpModule} from "@nestjs/axios";
import {StudentService} from "./studentBatch/students.service";
import {Project} from "./project/project.entity";
import {ProjectController} from "./project/project.controller";
import {ProjectService} from "./project/project.service";
import {ProjectGroup} from "./projectGroup/projectGroup.entity";
import {ProjectGroupService} from "./projectGroup/projectGroup.service";
import {ProjectGroupController} from "./projectGroup/projectGroup.controller";
import {Step} from "./steps/step.entity";
import {StepController} from "./steps/step.controller";
import {StepService} from "./steps/step.service";
import {ReportDefinition} from "./report/reportDefinition.entiy";
import {ReportDefinitionService} from "./report/reportDefinition.service";
import {ReportDefinitionController} from "./report/reportDefinition.controller";
import {LiveblocksService} from "./liveblocks/liveblocks.service";
import {LiveblocksController} from "./liveblocks/liveblocks.controller";
import {Oral} from "./orals/oral.entity";
import {OralController} from "./orals/oral.controller";
import {OralsService} from "./orals/orals.service";

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
            entities: [StudentBatch, Project, ProjectGroup, Step, ReportDefinition, Oral],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            StudentBatch,
            Project,
            ProjectGroup,
            Step,
            ReportDefinition,
            Oral
        ]),
    ],
    controllers: [
        AppController,
        StudentBatchesController,
        ProjectController,
        StepController,
        ProjectGroupController,
        ReportDefinitionController,
        LiveblocksController,
        OralController
    ],
    providers: [
        AppService,
        StudentBatchesService,
        StudentService,
        ProjectService,
        ProjectGroupService,
        StepService,
        ReportDefinitionService,
        LiveblocksService,
        OralsService
    ],
})
export class AppModule {
}
