import { IsOptional } from "class-validator";
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
  description?: string;

  @ApiProperty({
    example: "aaae-enri-fzeuifzr",
    required: false,
  })
  @IsOptional()
  studentBatchId?: string;

  @ApiProperty({
    example: 5,
    required: false,
  })
  @IsOptional()
  maxGroups?: number;

  @ApiProperty({
    example: 5,
    required: false,
  })
  @IsOptional()
  maxPerGroup?: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  minPerGroup?: number;

  @ApiProperty({
    example: "TEACHER",
    required: false,
  })
  @IsOptional()
  groupsCreator?: "TEACHER" | "STUDENT" | "RANDOM";

  @ApiProperty({
    example: "12/07/2025",
    required: false,
  })
  @IsOptional()
  creationGroupDeadLineDate?: string;
}

export type UpdatedProjectPatchDto = {
  isPublished?: boolean;
  name?: string;
  description?: string;
  maxGroups?: number;
  maxPerGroup?: number;
  minPerGroup?: number;
  groupsCreator?: "TEACHER" | "STUDENT" | "RANDOM";
  creationGroupDeadLineDate?: string;
  studentBatch?: StudentBatch;
  studentBatchId?: string;
};
