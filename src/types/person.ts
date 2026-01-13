import { Position } from '@/types/position';
import { Team } from '@/types/team';

export interface PersonResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Person[];
}

export interface Person {
  id: number;
  name: string;
  gender: string;
  birth: string;
  position: Position[];
  team: Team[];
  profileImage?: string | null;
}
