import {Entity, Column, ManyToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { StudentBatch } from "../studentBatch/studentBatch.entity";
import {ProjectGroup} from "../projectGroup/projectGroup.entity";

@Entity()
export class Project {

  @PrimaryGeneratedColumn('uuid')
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

  @Column({nullable: true})
  maxGroups: number;

  @Column({nullable: true})
  maxPerGroup: number;

  @Column({nullable: true})
  minPerGroup: number;

  @Column({nullable: true})
  groupsCreator: "TEACHER" | "STUDENT" | "RANDOM"; //defines who can make groups

  @Column({nullable: true})
  creationGroupDeadLineDate: Date; //if groupsCreator are students, give a deadline after which groups will be filled it randomly

  @ManyToOne(() => StudentBatch, (batch) => batch.projects, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "studentBatchId" })
  studentBatch: StudentBatch;

  @OneToMany(() => ProjectGroup, (groups) => groups.project)
  groups: ProjectGroup[]
}
