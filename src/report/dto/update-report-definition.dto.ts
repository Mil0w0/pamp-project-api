import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean, IsIn } from "class-validator";
import { Project } from "../../project/project.entity";

export class PatchReportDefinitionDto {
  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: "QUESTIONNAIRE",
    required: false,
    enum: ["CLASSIC", "QUESTIONNAIRE"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["CLASSIC", "QUESTIONNAIRE"])
  format?: "CLASSIC" | "QUESTIONNAIRE";

  @ApiProperty({
    example: "Updated instructions for the report...",
    required: false,
    description: "Instructions for the report. MANDATORY for CLASSIC format, OPTIONAL for QUESTIONNAIRE format",
  })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiProperty({
    example: '[{"id": 1, "text": "What was your biggest challenge?"}, {"id": 2, "text": "What did you learn?"}]',
    required: false,
    description: "JSON string with questions for the report. MANDATORY for QUESTIONNAIRE format, should be NULL/EMPTY for CLASSIC format",
  })
  @IsOptional()
  @IsString()
  questions?: string;

  @ApiProperty({
    example: "project-uuid-here",
    required: false,
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}

export type UpdatedReportDefinitionPatchDto = {
  isActive?: boolean;
  format?: "CLASSIC" | "QUESTIONNAIRE";
  instruction?: string;
  questions?: string;
  project?: Project;
  projectId?: string;
}; 