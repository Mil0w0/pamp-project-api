import {Entity, Column, PrimaryColumn, OneToMany, ManyToOne} from "typeorm";
import {StudentBatch} from "../studentBatch/studentBatch.entity";
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

  @Column()
  description: Text;

  @ManyToOne(() => StudentBatch, (batch) => batch.projects, { onDelete: 'SET NULL' })
  studentBatch: StudentBatch;
}
