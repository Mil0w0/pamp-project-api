import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GradingScaleService } from "./gradingScale.service";
import { CreateGradingScaleDto } from "./dto/create-grading-scale.dto";
import { UpdateGradingScaleDto } from "./dto/update-grading-scale.dto";
import { CreateGradingResultDto } from "./dto/create-grading-result.dto";
import { GradingResult } from "./gradingResult.entity";
import { CreateGradingCriterionDto } from "./dto/create-grading-criterion.dto";
import { UpdateGradingResultDto } from './dto/update-grading-result.dto';
import { UpdateGradingCriterionDto } from "./dto/update-grading-criterion.dto";

@ApiTags("Grading Scales")
@Controller("grading-scales")
export class GradingScaleController {
  constructor(private readonly gradingScaleService: GradingScaleService) {}

  @Post()
  @ApiBody({ type: CreateGradingScaleDto })
  @ApiResponse({ status: 201, description: "Grading scale created successfully" })
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createGradingScaleDto: CreateGradingScaleDto,
    @Req() req: Request,
  ) {
    const createdBy = (req as { user?: { user_id: string } }).user?.user_id || "system";
    return this.gradingScaleService.create(createGradingScaleDto, createdBy);
  }

  @Get(":id")
  @ApiResponse({ status: 200, description: "Grading scale found" })
  async findOne(@Param("id") id: string) {
    return this.gradingScaleService.findOne(id);
  }

  @Put(":id")
  @ApiBody({ type: UpdateGradingScaleDto })
  @ApiResponse({ status: 200, description: "Grading scale updated successfully" })
  @UsePipes(new ValidationPipe())
  async update(
    @Param("id") id: string,
    @Body() updateGradingScaleDto: UpdateGradingScaleDto,
  ) {
    return this.gradingScaleService.update(id, updateGradingScaleDto);
  }

  @Delete(":id")
  @ApiResponse({ status: 200, description: "Grading scale deleted successfully" })
  async remove(@Param("id") id: string) {
    return this.gradingScaleService.remove(id);
  }

  @Post(":id/validate")
  @ApiResponse({ status: 200, description: "Grading scale validated successfully" })
  async validate(@Param("id") id: string) {
    return this.gradingScaleService.validate(id);
  }

  @Post(":id/criteria")
  @ApiBody({})
  @ApiResponse({ status: 201, description: "Criterion added successfully" })
  @UsePipes(new ValidationPipe())
  async addCriterion(@Param("id") id: string, @Body() criterionData: CreateGradingCriterionDto) {
    return this.gradingScaleService.addCriterion(id, criterionData);
  }

  @Put("criteria/:criterionId")
  @ApiBody({})
  @ApiResponse({ status: 200, description: "Criterion updated successfully" })
  @UsePipes(new ValidationPipe())
  async updateCriterion(
    @Param("criterionId") criterionId: string,
    @Body() criterionData: UpdateGradingCriterionDto,
  ) {
    return this.gradingScaleService.updateCriterion(criterionId, criterionData);
  }

  @Delete("criteria/:criterionId")
  @ApiResponse({ status: 200, description: "Criterion deleted successfully" })
  async removeCriterion(@Param("criterionId") criterionId: string) {
    return this.gradingScaleService.removeCriterion(criterionId);
  }

  @Post(":id/results")
  @ApiBody({ type: CreateGradingResultDto })
  @ApiResponse({ status: 201, description: "Results created successfully" })
  @UsePipes(new ValidationPipe())
  async createResults(
    @Param("id") id: string,
    @Body() createGradingResultDto: CreateGradingResultDto,
    @Req() req: Request & { user?: { user_id: string } },
  ) {
    const createdBy = req.user?.user_id || "system";
    return this.gradingScaleService.createResults(
      id,
      createGradingResultDto,
      createdBy,
    );
  }

  @Get(":id/results")
  @ApiResponse({ status: 200, description: "Results found" })
  async getResults(@Param("id") id: string) {
    return this.gradingScaleService.getResults(id);
  }

  @Put("results/:resultId")
  @ApiBody({})
  @ApiResponse({ status: 200, description: "Result updated successfully" })
  @UsePipes(new ValidationPipe())
  async updateResult(
    @Param("resultId") resultId: string,
    @Body() resultData: UpdateGradingResultDto,
  ) {
    return this.gradingScaleService.updateResult(resultId, resultData as Partial<GradingResult>);
  }
}

@ApiTags("Projects")
@Controller("projects")
export class ProjectGradingScaleController {
  constructor(private readonly gradingScaleService: GradingScaleService) {}

  @Get(":id/grading-scales")
  @ApiResponse({ status: 200, description: "Project grading scales found" })
  async findByProject(@Param("id") projectId: string) {
    return this.gradingScaleService.findByProject(projectId);
  }
}