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
import { StudentService } from "../studentBatch/students.service";
import { CreateOralDto } from "./dto/create-oral-dto";
import { ProjectGroupService } from "../projectGroup/projectGroup.service";
import { OralsService } from "./orals.service";
import { PatchOralDto } from "./dto/patch-oral-dto";
import { ListOralDto } from "./dto/list-oral-dto";

@ApiTags("Orals")
@Controller("orals")
export class OralController {
  constructor(
    private readonly oralService: OralsService,
  ) {}

  @Post("")
  @ApiResponse({
    status: 201,
    description: "The oral has been successfully created.",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
  })
  @ApiBody({
    type: CreateOralDto,
    description: "Json structure for create oral object",
  })
  async create(@Body() dto: CreateOralDto) {
    return this.oralService.create(dto);
  }

  @Patch(":id")
  @ApiBody({
    type: PatchOralDto,
    description: "Json structure for update oral object",
  })
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
  async patch(@Body() oral: PatchOralDto, @Param("id") id: string) {
    return this.oralService.update(id, oral);
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "The oral has been successfully fetched.",
  })
  async findOne(@Param("id") id: string) {
    return this.oralService.findOne(id);
  }

  @Get("/projects/:projectId")
  @ApiResponse({
    status: 200,
    description: "The orals for this project have been successfully fetched.",
  })
  async findAll(
    @Query() params: ListOralDto,
    @Param("projectId") projectId: string,
  ) {
    return this.oralService.findAllByProject(params, projectId);
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "The oral has been successfully deleted.",
  })
  @ApiResponse({
    status: 404,
    description: "Oral not found",
  })
  async delete(@Param("id") id: string) {
    return this.oralService.delete(id);
  }
}
