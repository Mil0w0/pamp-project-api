import { ApiProperty } from "@nestjs/swagger";

import { IsString } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({
    example: "Promotion Z",
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: "This is a project",
    required: false,
  })
  @IsString()
  description: string;
}
