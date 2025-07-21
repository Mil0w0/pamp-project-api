import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";

export class UpdateGradingCriterionDto {
  @ApiProperty({ example: "Qualité du rendu", required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  maxPoints?: number;

  @ApiProperty({ example: 0.3, required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  commentEnabled?: boolean;
}
