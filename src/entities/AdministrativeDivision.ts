import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';

@Entity('administrative_divisions')
@Index('idx_admin_country', ['countryCode'])
@Index('idx_admin_parent', ['parentId'])
@Index('idx_admin_level', ['level'])
@Index('idx_admin_type', ['type'])
@Index('idx_admin_location', ['latitude', 'longitude'])
export class AdministrativeDivision {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'int', nullable: true, name: 'parent_id' })
  parentId: number | null;

  @Column({ type: 'varchar', length: 3, name: 'country_code' })
  countryCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => AdministrativeDivision, division => division.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: AdministrativeDivision | null;

  @OneToMany(() => AdministrativeDivision, division => division.parent)
  children: AdministrativeDivision[];
}
