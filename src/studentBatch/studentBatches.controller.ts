import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StudentBatchesService } from "./studentBatches.service";
import { CreateStudentBatchDto } from "./dto/create-student-batch-dto";
import { ListStudentBatchesDto } from "./dto/list-student-batches.dto";
import { PatchStudentBatchDto } from "./dto/update-student-batch.dto";
import { StudentService } from "./students.service";

@ApiTags("StudentBatches")
@Controller("student-batches")
export class StudentBatchesController {
  constructor(
    private readonly studentBatchesService: StudentBatchesService,
    private readonly studentService: StudentService,
  ) {}

  @Post("")
  @ApiResponse({
    status: 201,
    description: "The student batch has been successfully created.",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
  })
  @ApiBody({
    type: CreateStudentBatchDto,
    description: "Json structure for create studentBatch object",
  })
  async create(@Body() newStudentBatch: CreateStudentBatchDto) {
    return this.studentBatchesService.create(newStudentBatch);
  }

  @Patch(":id")
  @ApiBody({
    type: PatchStudentBatchDto,
    description: "Json structure for update studentBatch object",
  })
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
  async patch(
    @Body() updatedStudentBatch: PatchStudentBatchDto,
    @Param("id") id: string,
    @Req() req: Request,
  ) {
    const bearerToken = req.headers["authorization"];
    return this.studentBatchesService.update(
      id,
      updatedStudentBatch,
      bearerToken,
    );
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "The studentBatch has been successfully fetched.",
  })
  async findOne(@Param("id") id: string, @Req() req: Request) {
    const bearerToken = req.headers["authorization"];
    return this.studentBatchesService.findOne(id, bearerToken);
  }

  @Get("")
  @ApiResponse({
    status: 200,
    description: "The studentBatches have been successfully fetched.",
  })
  async findAll(@Query() params: ListStudentBatchesDto, @Req() req: Request) {
    const bearerToken = req.headers["authorization"];
    console.log(req.headers);
    return this.studentBatchesService.findAll(params, bearerToken);
  }

  @Get("/myStudentBatches")
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description:
      "The student batches for the authenticated user if they are a student.",
  })
  async findInWhatBatchIAm(@Req() req) {
    const authToken = req.headers.authorization;
    const user = await this.studentService.getCurrentUser(authToken);

    if (user.role !== "student") {
      throw new ForbiddenException("Only students can access this route");
    }

    // 2. Find student batches for this student
    return await this.studentBatchesService.findByStudentId(user.user_id);
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "The studentBatch has been successfully deleted.",
  })
  @ApiResponse({
    status: 404,
    description: "Student batch not found",
  })
  async delete(@Param("id") id: string, @Req() req: Request) {
    const bearerToken = req.headers["authorization"];
    return this.studentBatchesService.delete(id, bearerToken);
  }
}
