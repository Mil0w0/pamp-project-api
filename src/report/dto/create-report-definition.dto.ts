import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { IsValidReportDefinition } from "./report-definition.validator";

export class CreateReportDefinitionDto {
  @ApiProperty({
    example: "project-uuid-here",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: "CLASSIC",
    required: true,
    enum: ["CLASSIC", "QUESTIONNAIRE"],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(["CLASSIC", "QUESTIONNAIRE"])
  format: "CLASSIC" | "QUESTIONNAIRE";

  @ApiProperty({
    example: "Please provide a detailed report of your project progress...",
    required: false,
    description:
      "Instructions for the report. MANDATORY for CLASSIC format, OPTIONAL for QUESTIONNAIRE format",
  })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiProperty({
    example:
      '[{"id": 1, "text": "What was your biggest challenge?", "type": "text"}]',
    required: false,
    description:
      "JSON string with questions for the report. MANDATORY for QUESTIONNAIRE format, should be NULL/EMPTY for CLASSIC format",
  })
  @IsOptional()
  @IsString()
  questions?: string;

  @IsValidReportDefinition({
    message:
      "Invalid report definition: check format-specific field requirements",
  })
  private _validation?: unknown;
}
