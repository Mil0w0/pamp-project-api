import {Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn} from "typeorm";
import {Project} from "../project/project.entity";

@Entity()
export class ProjectGroup {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column()
  name: string;

  @ManyToOne(() => Project, (project) => project.groups, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "projectId" })
  project: Project;

  @Column()
  studentsIds: string;
}
