import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateGradingScaleDto {
  @ApiProperty({ example: "Grille Livrable 1 - Modifiée", required: false })
  @IsOptional()
  @IsString()
  title?: string;
}
