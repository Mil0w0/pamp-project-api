import {IsOptional, IsString,} from "class-validator";
import {ApiProperty, PartialType} from "@nestjs/swagger";
import {CreateStudentBatch} from "./create-student-batch";

export class PatchStudentBatchDto {
    @ApiProperty({
        example: "INACTIVE",
        required: false,
    })
    @IsString()
    @IsOptional()
    state?: "INACTIVE"| "ACTIVE";

    @ApiProperty({
        example: "Promotion Y",
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        example: "ESGI, Paris",
        required: false,
    })
    @IsString()
    @IsOptional()
    tags?: string;
}
