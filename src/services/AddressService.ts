import DatabaseConnection from '../database/connection';
import { AdministrativeDivision, AddressComponents, AddressDisplay, AddressFormat } from '../types';
import countriesData from '../data/countries.json';

export class AddressService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  getCountries(): { code: string; name: string; address_format: AddressFormat }[] {
    return countriesData.map(country => ({
      code: country.code,
      name: country.name,
      address_format: country.address_format
    }));
  }

  getCountryByCode(countryCode: string): { code: string; name: string; address_format: AddressFormat } | null {
    const country = countriesData.find(c => c.code === countryCode);
    if (!country) return null;

    return {
      code: country.code,
      name: country.name,
      address_format: country.address_format
    };
  }

  async getAdministrativeDivisions(countryCode: string, parentId?: number): Promise<AdministrativeDivision[]> {
    let query = 'SELECT * FROM administrative_divisions WHERE country_code = ?';
    let params: any[] = [countryCode];

    if (parentId !== undefined) {
      if (parentId === null) {
        query += ' AND parent_id IS NULL';
      } else {
        query += ' AND parent_id = ?';
        params.push(parentId);
      }
    }

    query += ' ORDER BY name ASC';
    return await this.db.query<AdministrativeDivision>(query, params);
  }

  async getAdministrativeDivisionsByLevel(countryCode: string, level: number): Promise<AdministrativeDivision[]> {
    return await this.db.query<AdministrativeDivision>(
      'SELECT * FROM administrative_divisions WHERE country_code = ? AND level = ? ORDER BY name ASC',
      [countryCode, level]
    );
  }

  async formatAddress(
    streetAddress: string,
    addressComponents: AddressComponents,
    countryCode: string
  ): Promise<{ formatted_address: string; address_display: AddressDisplay }> {
    const country = this.getCountryByCode(countryCode);
    if (!country) {
      return {
        formatted_address: streetAddress,
        address_display: {}
      };
    }

    const divisionIds = Object.values(addressComponents).filter(id => typeof id === 'number') as number[];
    const divisions = await this.getAdministrativeDivisionsByIds(divisionIds);

    const divisionMap = new Map<number, AdministrativeDivision>();
    divisions.forEach(div => divisionMap.set(div.id, div));

    const addressDisplay: AddressDisplay = {};
    const formatValues: { [key: string]: string } = { street_address: streetAddress };

    for (const level of country.address_format.levels) {
      const componentKey = Object.keys(addressComponents).find(key => {
        const divisionId = addressComponents[key];
        if (typeof divisionId === 'number') {
          const division = divisionMap.get(divisionId);
          return division && division.type === level.type;
        }
        return false;
      });

      if (componentKey) {
        const divisionId = addressComponents[componentKey] as number;
        const division = divisionMap.get(divisionId);
        if (division) {
          addressDisplay[level.name] = division.name;
          formatValues[level.name] = division.name;
        }
      }
    }

    let formattedAddress = country.address_format.display_format;
    for (const [key, value] of Object.entries(formatValues)) {
      const placeholder = `{${key}}`;
      formattedAddress = formattedAddress.replace(new RegExp(placeholder, 'g'), value || '');
    }

    formattedAddress = formattedAddress
      .replace(/,\s*,/g, ',')
      .replace(/,\s*$/, '')
      .replace(/^\s*,/, '')
      .trim();

    return {
      formatted_address: formattedAddress,
      address_display: addressDisplay
    };
  }

  private async getAdministrativeDivisionsByIds(ids: number[]): Promise<AdministrativeDivision[]> {
    if (ids.length === 0) return [];
    
    const placeholders = ids.map(() => '?').join(',');
    return await this.db.query<AdministrativeDivision>(
      `SELECT * FROM administrative_divisions WHERE id IN (${placeholders})`,
      ids
    );
  }

  async searchAddressComponents(
    countryCode: string,
    searchTerm: string,
    type?: string,
    limit: number = 20
  ): Promise<AdministrativeDivision[]> {
    let query = 'SELECT * FROM administrative_divisions WHERE country_code = ? AND name LIKE ?';
    let params: any[] = [countryCode, `%${searchTerm}%`];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY name ASC LIMIT ?';
    params.push(limit);

    return await this.db.query<AdministrativeDivision>(query, params);
  }

  async validateAddressComponents(
    addressComponents: AddressComponents,
    countryCode: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const country = this.getCountryByCode(countryCode);
    if (!country) {
      return { valid: false, errors: ['Invalid country'] };
    }

    const errors: string[] = [];
    const divisionIds = Object.values(addressComponents).filter(id => typeof id === 'number') as number[];
    const divisions = await this.getAdministrativeDivisionsByIds(divisionIds);
    const divisionMap = new Map<number, AdministrativeDivision>();
    divisions.forEach(div => divisionMap.set(div.id, div));

    for (const level of country.address_format.levels) {
      if (level.required) {
        const hasRequiredLevel = Object.values(addressComponents).some(id => {
          if (typeof id === 'number') {
            const division = divisionMap.get(id);
            return division && division.type === level.type;
          }
          return false;
        });

        if (!hasRequiredLevel) {
          errors.push(`${level.name} is required for ${country.name}`);
        }
      }
    }

    for (const division of divisions) {
      if (division.parent_id) {
        const parentExists = divisions.some(d => d.id === division.parent_id);
        if (!parentExists) {
          errors.push(`Invalid hierarchy: ${division.name} requires its parent division`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
