import {IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class PatchProjectDto {
  @ApiProperty({
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty({
    example: "pROJECT z",
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    example: "PROJECT z is a project",
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    example: "aaae-enri-fzeuifzr",
    required: false,
  })
  @IsUUID()
  studentBatchId?: string;

}
