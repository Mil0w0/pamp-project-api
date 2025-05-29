import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProjectService } from "./project.service";
import { PatchProjectDto } from "./dto/update-project.dto";
import { CreateProjectDto } from "./dto/create-project-dto";
import { ListProjectsDto } from "./dto/list-projects-dto";

@ApiTags("Projects")
@Controller("projects")
export class ProjectController {
  constructor(private readonly projectsService: ProjectService) {}

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
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
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
}
