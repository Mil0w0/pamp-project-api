import { ApiProperty } from "@nestjs/swagger";
import { IsPositive } from "class-validator";

export class ListStudentBatchesDto {
  @ApiProperty({
    example: 10,
    required: false,
  })
  @IsPositive()
  limit: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  page: number;
}
