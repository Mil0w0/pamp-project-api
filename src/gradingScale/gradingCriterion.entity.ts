import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GradingScale } from "./gradingScale.entity";
import { GradingResult } from "./gradingResult.entity";

@Entity()
export class GradingCriterion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  label: string;

  @Column("float")
  maxPoints: number;

  @Column("float", { nullable: true })
  weight: number;

  @Column({ default: false })
  commentEnabled: boolean;

  @ManyToOne(() => GradingScale, (gradingScale) => gradingScale.criteria, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "gradingScaleId" })
  gradingScale: GradingScale;

  @OneToMany(() => GradingResult, (result) => result.gradingCriterion)
  results: GradingResult[];
}
