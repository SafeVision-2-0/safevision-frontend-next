import { Position } from '@/types/position';
import { Team } from '@/types/team';
import { Meta } from '@/types/global';

export interface PersonResponse {
  success: boolean;
  message: string;
  meta: Meta;
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
