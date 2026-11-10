export type WorkerCategory = 'AC' | 'Ledeng' | 'Listrik' | 'Bangunan';

export interface Worker {
  id: string;
  name: string;
  category: WorkerCategory;
  rating: number;
  phone: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
}
