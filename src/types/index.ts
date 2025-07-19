export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  createdAt: Date;
}



export interface AddressFormat {
  levels: AddressLevel[];
  display_format: string;
  search_fields: string[];
}

export interface AddressLevel {
  name: string;
  type: string;
  level: number;
  required: boolean;
}

export interface AdministrativeDivision {
  id: number;
  name: string;
  type: string;
  level: number;
  parent_id?: number;
  country_code: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
}

export interface AddressComponents {
  [key: string]: number | string;
}

export interface Service {
  id: number;
  name: string;
  service_type_id: number;
  street_address: string;
  address_components: AddressComponents;
  country_id: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserFavorite {
  id: number;
  userId: number;
  serviceId: number;
  createdAt: Date;
}



export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
}

export interface SearchServicesRequest {
  latitude: number;
  longitude: number;
  radius: number;
  service_type?: number;
  name?: string;
  limit?: number;
  page?: number;
}

export interface ServiceWithType extends Service {
  service_type_name: string;
  service_type_icon?: string;
  country_name: string;
  country_code: string;
  formatted_address: string;
  address_display: AddressDisplay;
  distance?: number;
}

export interface AddressDisplay {
  [key: string]: string;
}

export interface SearchServicesResponse {
  services: ServiceWithType[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AddFavoriteRequest {
  service_id: number;
}

export interface FavoriteServiceResponse extends ServiceWithType {
  favorited_at: Date;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PaginationParams {
  limit: number;
  page: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
}
