import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1752665380418 implements MigrationInterface {
    name = 'InitialSchema1752665380418'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            CREATE TABLE \`administrative_divisions\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(100) NOT NULL,
                \`type\` varchar(50) NOT NULL,
                \`level\` int NOT NULL,
                \`parent_id\` int NULL,
                \`country_code\` varchar(3) NOT NULL,
                \`latitude\` decimal(10,8) NULL,
                \`longitude\` decimal(11,8) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`idx_admin_country\` (\`country_code\`),
                INDEX \`idx_admin_parent\` (\`parent_id\`),
                INDEX \`idx_admin_level\` (\`level\`),
                INDEX \`idx_admin_type\` (\`type\`),
                INDEX \`idx_admin_location\` (\`latitude\`, \`longitude\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`service_types\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(50) NOT NULL,
                \`description\` text NULL,
                \`icon\` varchar(100) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_service_types_name\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`username\` varchar(50) NOT NULL,
                \`email\` varchar(100) NOT NULL,
                \`password_hash\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_users_username\` (\`username\`),
                UNIQUE INDEX \`IDX_users_email\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`services\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(100) NOT NULL,
                \`service_type_id\` int NOT NULL,
                \`street_address\` varchar(255) NOT NULL,
                \`address_components\` json NULL,
                \`country_code\` varchar(3) NOT NULL,
                \`latitude\` decimal(10,8) NOT NULL,
                \`longitude\` decimal(11,8) NOT NULL,
                \`phone\` varchar(20) NULL,
                \`website\` varchar(255) NULL,
                \`rating\` decimal(2,1) NOT NULL DEFAULT '0.0',
                \`is_active\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`idx_services_name\` (\`name\`),
                INDEX \`idx_services_type\` (\`service_type_id\`),
                INDEX \`idx_services_country\` (\`country_code\`),
                INDEX \`idx_services_location\` (\`latitude\`, \`longitude\`),
                INDEX \`idx_services_active\` (\`is_active\`),
                INDEX \`idx_services_address\` (\`street_address\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`user_favorites\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`service_id\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`unique_user_service\` (\`user_id\`, \`service_id\`),
                INDEX \`idx_favorites_user\` (\`user_id\`),
                INDEX \`idx_favorites_service\` (\`service_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            ALTER TABLE \`administrative_divisions\`
            ADD CONSTRAINT \`FK_admin_parent\`
            FOREIGN KEY (\`parent_id\`) REFERENCES \`administrative_divisions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`services\`
            ADD CONSTRAINT \`FK_service_type\`
            FOREIGN KEY (\`service_type_id\`) REFERENCES \`service_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_favorites\`
            ADD CONSTRAINT \`FK_favorite_user\`
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_favorites\`
            ADD CONSTRAINT \`FK_favorite_service\`
            FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_favorites\` DROP FOREIGN KEY \`FK_favorite_service\``);
        await queryRunner.query(`ALTER TABLE \`user_favorites\` DROP FOREIGN KEY \`FK_favorite_user\``);
        await queryRunner.query(`ALTER TABLE \`services\` DROP FOREIGN KEY \`FK_service_type\``);
        await queryRunner.query(`ALTER TABLE \`administrative_divisions\` DROP FOREIGN KEY \`FK_admin_parent\``);

        await queryRunner.query(`DROP TABLE \`user_favorites\``);
        await queryRunner.query(`DROP TABLE \`services\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`service_types\``);
        await queryRunner.query(`DROP TABLE \`administrative_divisions\``);
    }
}
