import {IsNotEmpty, IsOptional, IsString, IsUUID} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CreateStudent } from "./get-students-dao";
export class PatchStudentBatchDto {
  @ApiProperty({
    example: "INACTIVE",
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: "INACTIVE" | "ACTIVE";

  @ApiProperty({
    example: "Promotion Y",
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: "ESGI, Paris",
    required: false,
  })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  students?: CreateStudent[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
