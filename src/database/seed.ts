import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { AppDataSource } from '../config/database';
import { User, AdministrativeDivision, ServiceType, Service } from '../entities';
import countriesData from '../data/countries.json';
import administrativeDivisionsData from '../data/administrative_divisions.json';
import { SERVICE_TYPES } from './metadata/service-types';

const SERVICES_COUNT = process.env.NODE_ENV === 'test' ? 20 : 200;
const USERS_COUNT = process.env.NODE_ENV === 'test' ? 5 : 50;

const HANOI_LAT = 21.0285;
const HANOI_LNG = 105.8542;
const SEARCH_RADIUS_KM = 10;

const generateCoordinatesAroundHanoi = (radiusKm: number = SEARCH_RADIUS_KM) => {
  const radiusInDegrees = radiusKm / 111.32;

  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusInDegrees;

  const lat = HANOI_LAT + (distance * Math.cos(angle));
  const lng = HANOI_LNG + (distance * Math.sin(angle));

  return {
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6))
  };
};

const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Starting database seeding...');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const countryIdToCode: { [key: number]: string } = {};
    countriesData.forEach((country, index) => {
      countryIdToCode[index + 1] = country.code;
    });

    const userRepository = AppDataSource.getRepository(User);
    const adminDivisionRepository = AppDataSource.getRepository(AdministrativeDivision);
    const serviceTypeRepository = AppDataSource.getRepository(ServiceType);
    const serviceRepository = AppDataSource.getRepository(Service);

    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await serviceRepository.clear();
    await serviceTypeRepository.clear();
    await adminDivisionRepository.clear();
    await userRepository.clear();
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleared existing data');

    for (const divisionData of administrativeDivisionsData) {
      const division = adminDivisionRepository.create({
        name: divisionData.name,
        type: divisionData.type,
        level: divisionData.level,
        parentId: divisionData.parent_id,
        countryCode: countryIdToCode[divisionData.country_id],
        latitude: divisionData.latitude,
        longitude: divisionData.longitude
      });
      await adminDivisionRepository.save(division);
    }
    console.log('Administrative divisions seeded');

    for (const serviceTypeData of SERVICE_TYPES) {
      const serviceType = serviceTypeRepository.create({
        name: serviceTypeData.name,
        description: serviceTypeData.description,
        icon: serviceTypeData.icon
      });
      await serviceTypeRepository.save(serviceType);
    }
    console.log('Service types seeded');

    const allServiceTypes = await serviceTypeRepository.find();
    const allDivisions = await adminDivisionRepository.find();
    const availableCountryCodes = countriesData.map(c => c.code);

    for (let i = 0; i < SERVICES_COUNT; i++) {
      const serviceType = faker.helpers.arrayElement(allServiceTypes);

      const countryCode = i < SERVICES_COUNT * 0.8 ? 'VN' : faker.helpers.arrayElement(availableCountryCodes);
      const countryDivisions = allDivisions.filter(d => d.countryCode === countryCode);

      const addressComponents: any = {};
      if (countryDivisions.length > 0) {
        const selectedDivisions = faker.helpers.arrayElements(countryDivisions, { min: 1, max: Math.min(3, countryDivisions.length) });
        selectedDivisions.forEach(division => {
          if (division.level === 1) addressComponents.province = division.id;
          if (division.level === 2) addressComponents.district = division.id;
          if (division.level === 3) addressComponents.ward = division.id;
        });
      }

      const coordinates = generateCoordinatesAroundHanoi();

      const service = serviceRepository.create({
        name: faker.company.name() + ' ' + serviceType.name,
        serviceTypeId: serviceType.id,
        streetAddress: faker.location.streetAddress(),
        addressComponents,
        countryCode: countryCode,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        phone: faker.datatype.boolean() ? faker.phone.number().slice(0, 15) : undefined,
        website: faker.datatype.boolean() ? faker.internet.url() : undefined,
        rating: faker.number.float({ min: 1.0, max: 5.0, fractionDigits: 1 })
      });
      await serviceRepository.save(service);
    }
    console.log(`Generated and seeded ${SERVICES_COUNT} services`);

    const rootPassword = await bcrypt.hash('root123', 10);
    const rootUser = userRepository.create({
      username: 'root',
      email: 'root@admin.com',
      passwordHash: rootPassword
    });
    await userRepository.save(rootUser);
    console.log('Root account created (username: root, email: root@admin.com, password: root123)');

    for (let i = 0; i < USERS_COUNT - 1; i++) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = userRepository.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        passwordHash: hashedPassword
      });
      await userRepository.save(user);
    }
    console.log(`Generated and seeded ${USERS_COUNT} users (including root account)`);

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    if (require.main === module && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };
