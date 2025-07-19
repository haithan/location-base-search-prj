import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { ServiceType } from './ServiceType';
import { AddressComponents } from '../types';

interface UserFavorite {
  id: number;
  userId: number;
  serviceId: number;
  createdAt: Date;
}

@Entity('services')
@Index('idx_services_name', ['name'])
@Index('idx_services_type', ['serviceTypeId'])
@Index('idx_services_country', ['countryCode'])
@Index('idx_services_location', ['latitude', 'longitude'])
@Index('idx_services_active', ['isActive'])
@Index('idx_services_address', ['streetAddress'])
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', name: 'service_type_id' })
  serviceTypeId: number;

  @Column({ type: 'varchar', length: 255, name: 'street_address' })
  streetAddress: string;

  @Column({ type: 'json', name: 'address_components', nullable: true })
  addressComponents: AddressComponents | null;

  @Column({ type: 'varchar', length: 3, name: 'country_code' })
  countryCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0.0 })
  rating: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ServiceType, serviceType => serviceType.services)
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;



  @OneToMany('UserFavorite', 'service')
  favorites: UserFavorite[];
}
