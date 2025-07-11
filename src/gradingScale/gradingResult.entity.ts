import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GradingCriterion } from "./gradingCriterion.entity";

@Entity()
export class GradingResult {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid", { nullable: true })
  targetGroupId: string;

  @Column("uuid", { nullable: true })
  targetStudentId: string;

  @Column("float")
  score: number;

  @Column("text", { nullable: true })
  comment: string;

  @Column("uuid")
  createdBy: string;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => GradingCriterion, (criterion) => criterion.results, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "gradingCriterionId" })
  gradingCriterion: GradingCriterion;
}