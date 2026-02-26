import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('attendances')
@Unique(['user', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.attendances)
  user: User;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', nullable: true })
  checkInTime?: string;

  @Column({ type: 'time', nullable: true })
  checkOutTime?: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
