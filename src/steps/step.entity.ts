import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Project } from "../project/project.entity";

@Entity()
export class Step {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column()
  name: string;

  @Column({
    type: "text",
  })
  description: string;

  @Column({
    default: true,
  })
  hasMandatorySubmission: boolean;

  @Column({ default: false })
  allowSubmittingAfterDeadLine: boolean;

  @Column({ type: 'jsonb', nullable: true })
  submissionConformityRules: any[];

  @Column({
    nullable: true,
  })
  submissionDeadLine: Date;

  @ManyToOne(() => Project, (project) => project.steps, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "projectId" })
  project: Project;
}
