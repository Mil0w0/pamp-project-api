import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class GradingResultItemDto {
  @ApiProperty({ example: "criterion-uuid" })
  @IsUUID()
  @IsNotEmpty()
  gradingCriterionId: string;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ example: "Très bon travail", required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateGradingResultDto {
  @ApiProperty({ example: "group-uuid", required: false })
  @IsOptional()
  @IsUUID()
  targetGroupId?: string;

  @ApiProperty({ example: "student-uuid", required: false })
  @IsOptional()
  @IsUUID()
  targetStudentId?: string;

  @ApiProperty({ type: [GradingResultItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradingResultItemDto)
  results: GradingResultItemDto[];
}
