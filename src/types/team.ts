import { Meta } from '@/types/global';

export interface TeamResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: Team[];
}

export interface Team {
  id: number;
  name: string;
  previewImages: string[];
  memberCount: number;
  created_at: string;
  updated_at: string;
}
