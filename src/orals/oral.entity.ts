import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ProjectGroup} from "../projectGroup/projectGroup.entity";

@Entity()
export class Oral {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        type: "timestamp"
    })
    startTime: Date

    @Column({
        type: "timestamp"
    })
    endTime: Date

    @OneToOne(() => ProjectGroup, (group) => group.oral)
    @JoinColumn({name: "groupId"})
    group: ProjectGroup
}
