import {Entity, Column, PrimaryColumn, OneToMany} from "typeorm";
import {Project} from "../project/project.entity";
@Entity()
export class StudentBatch {
  @PrimaryColumn({ generated: "uuid" })
  id: string;

  @Column({ default: "active" })
  state: string;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column()
  name: string;

  @Column({ default: "" })
  tags: string;

  @Column({ default: "" })
  students: string;

  @OneToMany(() => Project, (project) => project.studentBatch , {
    nullable: true,
    onDelete: 'CASCADE', //delete the projects associated
  })
  projects: Project[];
}
