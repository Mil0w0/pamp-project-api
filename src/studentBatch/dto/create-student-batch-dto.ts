import { ApiProperty } from "@nestjs/swagger";

import { IsString } from "class-validator";

export class CreateStudentBatchDto {
  @ApiProperty({
    example: "Promotion Z",
    required: true,
  })
  @IsString()
  name: string;
}
