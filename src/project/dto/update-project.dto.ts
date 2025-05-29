import {
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { StudentBatch } from "../../studentBatch/studentBatch.entity";
export class PatchProjectDto {
  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty({
    example: "pROJECT z",
    required: false,
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: "PROJECT z is a project",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: "aaae-enri-fzeuifzr",
    required: false,
  })
  @IsOptional()
  studentBatchId?: string;
}

export type UpdatedProjectPatchDto = {
  isPublished?: boolean;
  name?: string;
  description?: string;
  studentBatch?: StudentBatch;
  studentBatchId?: string;
};
