import { ApiProperty } from "@nestjs/swagger";

import { IsString } from "class-validator";

export class CreateStudentBatch {
  @ApiProperty({
    example: "Promotion Z",
    required: true,
  })
  @IsString()
  name: string;

}
