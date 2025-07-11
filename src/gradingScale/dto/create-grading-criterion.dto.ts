import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from "class-validator";

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