import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  ValidateNested,
  IsArray,
  IsNumber,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { GradingScaleType, NotationMode } from "../gradingScale.entity";

export class CreateGradingCriterionDto {
  @ApiProperty({ example: "Qualité du rendu" })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsNotEmpty()
  maxPoints: number;

  @ApiProperty({ example: 0.3, required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  commentEnabled?: boolean;
}

export class CreateGradingScaleDto {
  @ApiProperty({ example: "project-uuid" })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

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