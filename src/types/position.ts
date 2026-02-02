import { Meta } from '@/types/global';

export interface PositionResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: Position[];
}

export interface Position {
  id: number;
  name: string;
  previewImages: string[];
  memberCount: number;
  created_at: string;
  updated_at: string;
}
