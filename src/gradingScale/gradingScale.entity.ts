import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Project } from "../project/project.entity";
import { GradingCriterion } from "./gradingCriterion.entity";

export enum GradingScaleType {
  LIVRABLE = "livrable",
  RAPPORT = "rapport",
  SOUTENANCE = "soutenance",
}

export enum NotationMode {
  GROUPE = "groupe",
  INDIVIDUEL = "individuel",
}

@Entity()
export class GradingScale {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: GradingScaleType,
  })
  type: GradingScaleType;

  @Column("uuid")
  targetId: string;

  @Column({
    type: "enum",
    enum: NotationMode,
  })
  notationMode: NotationMode;

  @Column()
  title: string;

  @Column({ default: false })
  isValidated: boolean;

  @Column("uuid")
  createdBy: string;

  @Column("uuid", { nullable: true })
  projectId?: string;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  validatedAt: Date;

  @ManyToOne(() => Project, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "projectId" })
  project?: Project;

  @OneToMany(() => GradingCriterion, (criterion) => criterion.gradingScale, {
    cascade: true,
  })
  criteria: GradingCriterion[];
}
