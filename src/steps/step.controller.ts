import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StepService } from "./step.service";
import { ListProjectGroupsDto } from "./dto/list-projects-dto";
import { CreateStepDTO } from "./dto/create-step-dto";

@ApiTags("Steps")
@Controller("projects/:projectId/steps")
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post("")
  @ApiBody({
    type: Array<CreateStepDTO>,
    description: "Json structure for update project step object",
  })
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
  async insertAndUpdate(
    @Body() stepDTO: CreateStepDTO[],
    @Param("projectId") projectId: string,
    @Req() req,
  ) {
    const bearerToken = req.headers["authorization"];
    return this.stepService.createBatch(projectId, stepDTO, bearerToken);
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "The project step has been successfully fetched.",
  })
  async findOne(@Param("id") id: string) {
    return this.stepService.findOne(id);
  }

  @Get("")
  @ApiResponse({
    status: 200,
    description: "The project steps have been successfully fetched.",
  })
  async findAll(
    @Param("projectId") projectId: string,
    @Query() params: ListProjectGroupsDto,
  ) {
    return this.stepService.findAll(params, projectId);
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "The project step has been successfully deleted.",
  })
  @ApiResponse({
    status: 404,
    description: "Project step not found",
  })
  async delete(@Param("id") id: string) {
    return this.stepService.delete(id);
  }
}
