import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProjectService } from "./project.service";
import { PatchProjectDto } from "./dto/update-project.dto";
import { CreateProjectDto } from "./dto/create-project-dto";
import { ListProjectsDto } from "./dto/list-projects-dto";
import { ReportDefinitionService } from "../report/reportDefinition.service";
import { UpsertReportDefinitionDto } from "../report/dto/upsert-report-definition.dto";
import { StudentService } from "../studentBatch/students.service";

@ApiTags("Projects")
@Controller("projects")
export class ProjectController {
  private readonly logger = new Logger(ProjectController.name);

  constructor(
    private readonly projectsService: ProjectService,
    private readonly reportDefinitionService: ReportDefinitionService,
    private readonly studentService: StudentService,
  ) {}

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
  async create(@Body() project: CreateProjectDto, @Req() req: Request) {
    this.logger.log(`POST /projects - Creating project: ${project.name || 'Untitled'}`);
    const user = await this.studentService.getCurrentUser(
      req.headers["authorization"],
    );
    this.logger.log(`User authenticated: ${user.user_id} (${user.role})`);
    if (user.role === "STUDENT") {
      this.logger.warn(`Unauthorized project creation attempt by student: ${user.user_id}`);
      throw new UnauthorizedException("Only teacher can create a project.");
    }
    const result = await this.projectsService.create(project, user.user_id);
    this.logger.log(`Project created successfully with ID: ${result?.id || 'Unknown'}`);
    return result;
  }

  @Patch(":id")
  @ApiBody({
    type: PatchProjectDto,
    description: "Json structure for update project object",
  })
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
  async patch(@Body() project: PatchProjectDto, @Param("id") id: string) {
    this.logger.log(`PATCH /projects/${id} - Updating project`);
    const result = await this.projectsService.update(id, project);
    this.logger.log(`Project ${id} updated successfully`);
    return result;
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "The project has been successfully fetched.",
  })
  async findOne(@Param("id") id: string) {
    this.logger.log(`GET /projects/${id} - Fetching project`);
    const result = await this.projectsService.findOne(id);
    this.logger.log(`Project found: ${result?.name || 'Not found'}`);
    return result;
  }

  @Get("")
  @ApiResponse({
    status: 200,
    description: "The projects have been successfully fetched.",
  })
  async findAll(@Query() params: ListProjectsDto, @Req() req: Request) {
    this.logger.log(`GET /projects - Fetching projects with params: ${JSON.stringify(params)}`);
    const token = req.headers["authorization"];
    const result = await this.projectsService.findAll(params, token);
    this.logger.log(`Found ${result.length} projects`);
    return result;
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
    this.logger.log(`DELETE /projects/${id} - Deleting project`);
    const result = await this.projectsService.delete(id);
    this.logger.log(`Project ${id} deleted successfully`);
    return result;
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
    this.logger.log(`POST /projects/${id} - Copying project`);
    const result = await this.projectsService.copy(id);
    this.logger.log(`Project ${id} copied successfully with new ID: ${result?.id || 'Unknown'}`);
    return result;
  }

  @Put(":id/report-definition")
  @ApiResponse({
    status: 200,
    description:
      "The report definition has been successfully created or replaced.",
  })
  @ApiResponse({
    status: 404,
    description: "Project not found",
  })
  @ApiBody({
    type: UpsertReportDefinitionDto,
    description: "Json structure for upsert report definition object",
  })
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
  async upsertReportDefinition(
    @Body() reportDefinition: UpsertReportDefinitionDto,
    @Param("id") projectId: string,
  ) {
    this.logger.log(`PUT /projects/${projectId}/report-definition - Upserting report definition`);
    const result = await this.reportDefinitionService.upsertByProjectId(
      projectId,
      reportDefinition,
    );
    this.logger.log(`Report definition for project ${projectId} upserted successfully`);
    return result;
  }

  @Get(":id/report-definition")
  @ApiResponse({
    status: 200,
    description: "The report definition has been successfully fetched.",
  })
  @ApiResponse({
    status: 404,
    description:
      "Project not found or no report definition exists for this project",
  })
  async getReportDefinition(@Param("id") projectId: string) {
    this.logger.log(`GET /projects/${projectId}/report-definition - Fetching report definition`);
    const result = await this.reportDefinitionService.findByProjectId(projectId);
    this.logger.log(`Report definition for project ${projectId}: ${result ? 'Found' : 'Not found'}`);
    return result;
  }
}
