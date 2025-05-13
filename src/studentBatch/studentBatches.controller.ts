import {Body, Controller, Delete, Get, Param, Patch, Post, Query, SetMetadata,} from "@nestjs/common";
import {ApiBearerAuth, ApiBody, ApiResponse, ApiTags} from "@nestjs/swagger";
import {StudentBatchesService} from "./studentBatches.service";
import {CreateStudentBatch} from "./dto/create-student-batch";
import {ListStudentBatchesDto} from "./dto/list-student-batches.dto";
import {PatchStudentBatchDto} from "./dto/update-student-batch.dto";

@ApiTags("StudentBatches")
@Controller("student-batches")
export class StudentBatchesController {
    constructor(private readonly studentBatchesService: StudentBatchesService) {
    }

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
        type: CreateStudentBatch,
        description: "Json structure for create studentBatch object",
    })
    async create(@Body() newStudentBatch: CreateStudentBatch) {
        return this.studentBatchesService.create(newStudentBatch);
    }

    @Patch(":id")
    @ApiBody({
        type: PatchStudentBatchDto,
        description: "Json structure for update studentBatch object",
    })
    async patch(@Body() updatedStudentBatch: PatchStudentBatchDto, @Param("id") id: string) {
        return this.studentBatchesService.update(id, updatedStudentBatch);
    }

    @Get(":id")
    @ApiResponse({
        status: 200,
        description: "The studentBatch has been successfully fetched.",
    })
    async findOne(@Param("id") id: string){
        return this.studentBatchesService.findOne(id);
    }

    @Get("")
    @ApiResponse({
        status: 200,
        description: "The studentBatch has been successfully fetched.",
    })
    async findAll(@Query() params: ListStudentBatchesDto){
        return this.studentBatchesService.findAll(params);
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
    async delete(@Param("id") id: string){
        return this.studentBatchesService.delete(id);
    }

}
