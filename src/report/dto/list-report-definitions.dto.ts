import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumberString } from "class-validator";

export class ListReportDefinitionsDto {
  @ApiProperty({
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  page?: number;
}
