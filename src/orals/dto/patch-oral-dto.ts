import { ApiProperty } from "@nestjs/swagger";

import { IsString } from "class-validator";

export class PatchOralDto {
  @ApiProperty({
    example: "ISO sTRING",
    required: true,
  })
  @IsString()
  startTime?: string;

  @ApiProperty({
    example: "ISO STRING",
    required: true,
  })
  @IsString()
  endTime?: string;
}
