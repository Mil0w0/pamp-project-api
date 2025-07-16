import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, Min } from "class-validator";

export class UpdateGradingResultDto {
  @ApiProperty({ example: 4.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @ApiProperty({ example: "Très bon travail", required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
