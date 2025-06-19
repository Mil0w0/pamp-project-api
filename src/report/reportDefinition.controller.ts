import {Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe,} from "@nestjs/common";
import {ApiBody, ApiResponse, ApiTags} from "@nestjs/swagger";
import {ReportDefinitionService} from "./reportDefinition.service";
import {CreateReportDefinitionDto} from "./dto/create-report-definition.dto";
import {PatchReportDefinitionDto} from "./dto/update-report-definition.dto";
import {ListReportDefinitionsDto} from "./dto/list-report-definitions.dto";

@ApiTags("Report Definitions")
@Controller("report-definitions")
export class ReportDefinitionController {
    constructor(private readonly reportDefinitionService: ReportDefinitionService) {
    }

    @Post("")
    @ApiResponse({
        status: 201,
        description: "The report definition has been successfully created.",
    })
    @ApiResponse({
        status: 400,
        description: "Bad request - Project not found or report definition already exists",
    })
    @ApiBody({
        type: CreateReportDefinitionDto,
        description: "Json structure for create report definition object",
    })
    async create(@Body() reportDefinition: CreateReportDefinitionDto) {
        return this.reportDefinitionService.create(reportDefinition);
    }

    @Patch(":id")
    @ApiResponse({
        status: 200,
        description: "The report definition has been successfully updated.",
    })
    @ApiResponse({
        status: 404,
        description: "Report definition not found",
    })
    @ApiBody({
        type: PatchReportDefinitionDto,
        description: "Json structure for update report definition object",
    })
    @UsePipes(new ValidationPipe({forbidNonWhitelisted: true, whitelist: true}))
    async patch(@Body() reportDefinition: PatchReportDefinitionDto, @Param("id") id: string) {
        return this.reportDefinitionService.update(id, reportDefinition);
    }

    @Get(":id")
    @ApiResponse({
        status: 200,
        description: "The report definition has been successfully fetched.",
    })
    @ApiResponse({
        status: 404,
        description: "Report definition not found",
    })
    async findOne(@Param("id") id: string) {
        return this.reportDefinitionService.findOne(id);
    }

    @Get("project/:projectId")
    @ApiResponse({
        status: 200,
        description: "The report definition for the project has been successfully fetched.",
    })
    @ApiResponse({
        status: 404,
        description: "No report definition found for this project",
    })
    async findByProject(@Param("projectId") projectId: string) {
        return this.reportDefinitionService.findByProjectId(projectId);
    }

    @Patch("project/:projectId")
    @ApiResponse({
        status: 200,
        description: "The report definition for the project has been successfully updated.",
    })
    @ApiResponse({
        status: 404,
        description: "No report definition found for this project",
    })
    @ApiBody({
        type: PatchReportDefinitionDto,
        description: "Json structure for update report definition object",
    })
    @UsePipes(new ValidationPipe({forbidNonWhitelisted: true, whitelist: true}))
    async patchByProject(@Body() reportDefinition: PatchReportDefinitionDto, @Param("projectId") projectId: string) {
        return this.reportDefinitionService.updateByProjectId(projectId, reportDefinition);
    }

    @Get("")
    @ApiResponse({
        status: 200,
        description: "The report definitions have been successfully fetched.",
    })
    async findAll(@Query() params: ListReportDefinitionsDto) {
        return this.reportDefinitionService.findAll(params);
    }

    @Delete(":id")
    @ApiResponse({
        status: 200,
        description: "The report definition has been successfully deleted.",
    })
    @ApiResponse({
        status: 404,
        description: "Report definition not found",
    })
    async delete(@Param("id") id: string) {
        return this.reportDefinitionService.delete(id);
    }
} 