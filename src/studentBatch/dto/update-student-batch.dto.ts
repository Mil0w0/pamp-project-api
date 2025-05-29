import { IsOptional} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CreateStudent } from "./get-students-dao";
export class PatchStudentBatchDto {
  @ApiProperty({
    example: "INACTIVE",
    required: false,
  })
  @IsOptional()
  state?: "INACTIVE" | "ACTIVE";

  @ApiProperty({
    example: "Promotion Y",
    required: false,
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: "ESGI, Paris",
    required: false,
  })
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
  projectId?: string;
}
