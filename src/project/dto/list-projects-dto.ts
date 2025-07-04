import { ApiProperty } from "@nestjs/swagger";
import { IsPositive } from "class-validator";

export class ListProjectsDto {
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

  @ApiProperty({
    example: "aaad-frjgri-qrihgqur",
    required: false,
  })
  userId: string;
}
