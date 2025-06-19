import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query, Req,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {ApiBody, ApiResponse, ApiTags} from "@nestjs/swagger";
import {ProjectGroupService} from "./projectGroup.service";
import {PatchGroupProjectDto} from "./dto/update-project.dto";
import {ListProjectGroupsDto} from "./dto/list-projects-dto";
import {CreateBatchGroupsDto} from "./dto/create-project-dto";

@ApiTags("ProjectGroups")
@Controller("projectGroups")
export class ProjectGroupController {
    constructor(private readonly projectGroup: ProjectGroupService) {
    }

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
        type: CreateBatchGroupsDto,
        description: "Json structure for create project group object",
    })
    async create(@Body() dto: CreateBatchGroupsDto) {
        return this.projectGroup.create(dto);
    }

    @Patch(":id")
    @ApiBody({
        type: PatchGroupProjectDto,
        description: "Json structure for update project group object",
    })
    @UsePipes(new ValidationPipe({forbidNonWhitelisted: true, whitelist: true}))
    async patch(@Body() project: PatchGroupProjectDto, @Param("id") id: string, @Req() req) {
        const bearerToken = req.headers["authorization"];
        return this.projectGroup.update(id, project, bearerToken);
    }

    @Get(":id")
    @ApiResponse({
        status: 200,
        description: "The project group has been successfully fetched.",
    })
    async findOne(@Param("id") id: string) {
        return this.projectGroup.findOne(id);
    }

    @Get("")
    @ApiResponse({
        status: 200,
        description: "The project groups have been successfully fetched.",
    })
    async findAll(@Query() params: ListProjectGroupsDto) {
        return this.projectGroup.findAll(params);
    }

    @Delete(":id")
    @ApiResponse({
        status: 200,
        description: "The project group has been successfully deleted.",
    })
    @ApiResponse({
        status: 404,
        description: "Project group not found",
    })
    async delete(@Param("id") id: string) {
        return this.projectGroup.delete(id);
    }
}
