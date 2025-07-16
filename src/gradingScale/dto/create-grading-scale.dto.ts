import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  ValidateNested,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";
import { GradingScaleType, NotationMode } from "../gradingScale.entity";
import { CreateGradingCriterionDto } from "./create-grading-criterion.dto";

export class CreateGradingScaleDto {
  @ApiProperty({ example: "project-uuid", required: false })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ enum: GradingScaleType, example: GradingScaleType.LIVRABLE })
  @IsEnum(GradingScaleType)
  type: GradingScaleType;

  @ApiProperty({ example: "livrable-uuid" })
  @IsUUID()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ enum: NotationMode, example: NotationMode.GROUPE })
  @IsEnum(NotationMode)
  notationMode: NotationMode;

  @ApiProperty({ example: "Grille Livrable 1" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: [CreateGradingCriterionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGradingCriterionDto)
  criteria?: CreateGradingCriterionDto[];
}
