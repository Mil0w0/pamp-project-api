import {Body, Controller, Delete, Get, Param, Patch, Post, Query, SetMetadata,} from "@nestjs/common";
import {ApiBearerAuth, ApiBody, ApiResponse, ApiTags} from "@nestjs/swagger";
import {StudentBatchesService} from "./studentBatches.service";
import {CreateStudentBatch} from "./dto/create-student-batch";
import {ListWebsitesDto} from "./dto/list-websites.dto";
import {UpdateWebsiteDto} from "./dto/update-website.dto";

@ApiTags("StudentBatches")
@Controller("student-batches")
@ApiBearerAuth("JWT-auth")
export class StudentBatchesController {
    constructor(private readonly websitesServices: StudentBatchesService) {
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
        return this.websitesServices.create(newStudentBatch);
    }

    @Get(":id")
    @ApiResponse({
        status: 200,
        description: "The studentBatch has been successfully fetched.",
    })
    async findOne(@Param("id") id: string){
        return this.websitesServices.findOne(id);
    }

}
