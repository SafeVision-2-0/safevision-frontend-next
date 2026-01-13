export interface PositionResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Position[];
}

export interface Position {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
