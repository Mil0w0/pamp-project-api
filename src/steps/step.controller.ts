import {
    Body,
    Controller,
    Delete,
    Get,
    Param, Patch,
    Post,
    Query, Req,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {ApiBody, ApiResponse, ApiTags} from "@nestjs/swagger";
import {StepService} from "./step.service";
import {ListStepDto} from "./dto/list-projects-dto";
import {CreateStepDTO, PatchStepDTO} from "./dto/create-step-dto";

@ApiTags("Steps")
@Controller("projects/:projectId/steps")
export class StepController {
    constructor(private readonly stepService: StepService) {
    }

    @Post("")
    @ApiBody({
        type: Array<CreateStepDTO>,
        description: "Json structure for update project step object",
    })
    @UsePipes(new ValidationPipe({forbidNonWhitelisted: true, whitelist: true}))
    async insertAndUpdate(
        @Body() stepDTO: CreateStepDTO[],
        @Param("projectId") projectId: string,
    ) {
        console.log(stepDTO);
        return this.stepService.createBatch(projectId, stepDTO);
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
        @Query() params: ListStepDto,
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


    @Patch(":id")
    @ApiBody({
        type: PatchStepDTO,
        description: "Json structure for step object on update/patch",
    })
    @UsePipes(new ValidationPipe({forbidNonWhitelisted: true, whitelist: true}))
    async patch(
        @Body() step: PatchStepDTO,
        @Param("id") id: string,
        @Req() req,
    ) {
        const bearerToken = req.headers["authorization"];
        return this.stepService.update(id, step, bearerToken);
    }
}
