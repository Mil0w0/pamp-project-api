import { Entity, Column, PrimaryColumn } from "typeorm";
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
}
