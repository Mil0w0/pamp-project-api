import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Project} from "../project/project.entity";

@Entity()
export class ReportDefinition {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({default: false})
    isActive: boolean; // False == no report for this project

    @Column()
    format: "CLASSIC" | "QUESTIONNAIRE"; // defines the type of report

    @Column({nullable: true})
    instruction: string;
    /// instructions for the report, displayed at the top of the report
    /// it can be null if the format is QUESTIONNAIRE

    @Column({nullable: true})
    questions: string; // JSON string with questions for the report, used in QUESTIONNAIRE format

    @OneToOne(() => Project, (project) => project.reportDefinition, {
        onDelete: "NO ACTION",
        nullable: false,
        eager: true, // Eager loading to automatically load the project when the report definition is loaded
    })
    @JoinColumn({name: "projectId"})
    project: Project; // Reference to the project this report definition belongs to
}