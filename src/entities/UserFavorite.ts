import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';

import type { User } from './User';
import type { Service } from './Service';

@Entity('user_favorites')
@Unique('unique_user_service', ['userId', 'serviceId'])
@Index('idx_favorites_user', ['userId'])
@Index('idx_favorites_service', ['serviceId'])
export class UserFavorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'int', name: 'service_id' })
  serviceId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('User', 'favorites', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne('Service', 'favorites', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
