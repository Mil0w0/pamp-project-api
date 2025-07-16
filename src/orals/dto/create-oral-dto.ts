import { ApiProperty } from "@nestjs/swagger";

import { IsString } from "class-validator";

export class CreateOralDto {
  @ApiProperty({
    example: "ISO sTRING",
    required: true,
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    example: "ISO STRING",
    required: true,
  })
  @IsString()
  endTime: string;

  @ApiProperty({
    example: "GROUP UUID",
    required: true,
  })
  @IsString()
  groupId: string;
}
