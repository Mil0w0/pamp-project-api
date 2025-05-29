import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { StudentBatch } from "../studentBatch/studentBatch.entity";

@Entity()
export class Project {
  @PrimaryColumn({ generated: "uuid" })
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

  @Column("text")
  description: string;

  @ManyToOne(() => StudentBatch, (batch) => batch.projects, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "studentBatchId" })
  studentBatch: StudentBatch;
}
