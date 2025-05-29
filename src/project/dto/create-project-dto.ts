import { ApiProperty } from "@nestjs/swagger";

import { IsNotEmpty, IsString } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({
    example: "Promotion Z",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "This is a project",
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
