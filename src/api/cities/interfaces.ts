export interface City {
  id: number;
  slug: string;
  name: string;
  active: boolean;
  sortOrder: number;
}

export interface CityRequestBody {
  slug: string;
  name: string;
  active: boolean;
  sortOrder: number;
}
