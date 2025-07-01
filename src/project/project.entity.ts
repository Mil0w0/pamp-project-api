import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { StudentBatch } from "../studentBatch/studentBatch.entity";
import { ProjectGroup } from "../projectGroup/projectGroup.entity";
import { Step } from "../steps/step.entity";
import { ReportDefinition } from "../report/reportDefinition.entiy";

@Entity()
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: false })
  isPublished: boolean; //False == draft

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  creatorId: string;

  @Column("text")
  description: string;

  @Column({ nullable: true })
  maxGroups: number;

  @Column({ nullable: true })
  maxPerGroup: number;

  @Column({ nullable: true })
  minPerGroup: number;

  @Column({ nullable: true })
  groupsCreator: "TEACHER" | "STUDENT" | "RANDOM"; //defines who can make groups

  @Column({ nullable: true })
  creationGroupDeadLineDate: Date; //if groupsCreator are students, give a deadline after which groups will be filled it randomly

  @ManyToOne(() => StudentBatch, (batch) => batch.projects, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "studentBatchId" })
  studentBatch: StudentBatch;

  @OneToMany(() => ProjectGroup, (groups) => groups.project)
  groups: ProjectGroup[];

  @OneToMany(() => Step, (step) => step.project)
  steps: Step[];

  @OneToOne(
    () => ReportDefinition,
    (reportDefinition) => reportDefinition.project,
    {
      onDelete: "CASCADE",
      nullable: true,
      eager: false, // do not load report definition automatically
    },
  )
  reportDefinition: ReportDefinition;
}
