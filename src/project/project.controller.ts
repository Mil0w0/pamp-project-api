import {Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes, ValidationPipe,} from "@nestjs/common";
import {ApiBody, ApiResponse, ApiTags} from "@nestjs/swagger";
import {ProjectService} from "./project.service";
import {PatchProjectDto} from "./dto/update-project.dto";
import {CreateProjectDto} from "./dto/create-project-dto";
import {ListProjectsDto} from "./dto/list-projects-dto";
import {ReportDefinitionService} from "../report/reportDefinition.service";
import {UpsertReportDefinitionDto} from "../report/dto/upsert-report-definition.dto";

@ApiTags("Projects")
@Controller("projects")
export class ProjectController {
    constructor(
        private readonly projectsService: ProjectService,
        private readonly reportDefinitionService: ReportDefinitionService,
    ) {
    }

    @Post("")
    @ApiResponse({
        status: 201,
        description: "The project has been successfully created.",
    })
    @ApiResponse({
        status: 400,
        description: "Bad request",
    })
    @ApiBody({
        type: CreateProjectDto,
        description: "Json structure for create project object",
    })
    async create(@Body() project: CreateProjectDto) {
        return this.projectsService.create(project);
    }

    @Patch(":id")
    @ApiBody({
        type: PatchProjectDto,
        description: "Json structure for update project object",
    })
    @UsePipes(new ValidationPipe({forbidNonWhitelisted: true, whitelist: true}))
    async patch(@Body() project: PatchProjectDto, @Param("id") id: string) {
        return this.projectsService.update(id, project);
    }

    @Get(":id")
    @ApiResponse({
        status: 200,
        description: "The project has been successfully fetched.",
    })
    async findOne(@Param("id") id: string) {
        return this.projectsService.findOne(id);
    }

    @Get("")
    @ApiResponse({
        status: 200,
        description: "The projects have been successfully fetched.",
    })
    async findAll(@Query() params: ListProjectsDto) {
        return this.projectsService.findAll(params);
    }

    @Delete(":id")
    @ApiResponse({
        status: 200,
        description: "The project has been successfully deleted.",
    })
    @ApiResponse({
        status: 404,
        description: "Project not found",
    })
    async delete(@Param("id") id: string) {
        return this.projectsService.delete(id);
    }

    @Post(":id")
    @ApiResponse({
        status: 200,
        description: "The project has been successfully copied.",
    })
    @ApiResponse({
        status: 404,
        description: "Original project not found",
    })
    async copy(@Param("id") id: string) {
        return this.projectsService.copy(id);
    }

    @Put(":id/report-definition")
    @ApiResponse({
        status: 200,
        description: "The report definition has been successfully created or replaced.",
    })
    @ApiResponse({
        status: 404,
        description: "Project not found",
    })
    @ApiBody({
        type: UpsertReportDefinitionDto,
        description: "Json structure for upsert report definition object",
    })
    @UsePipes(new ValidationPipe({forbidNonWhitelisted: true, whitelist: true}))
    async upsertReportDefinition(@Body() reportDefinition: UpsertReportDefinitionDto, @Param("id") projectId: string) {
        return this.reportDefinitionService.upsertByProjectId(projectId, reportDefinition);
    }

    @Get(":id/report-definition")
    @ApiResponse({
        status: 200,
        description: "The report definition has been successfully fetched.",
    })
    @ApiResponse({
        status: 404,
        description: "Project not found or no report definition exists for this project",
    })
    async getReportDefinition(@Param("id") projectId: string) {
        return this.reportDefinitionService.findByProjectId(projectId);
    }
}
