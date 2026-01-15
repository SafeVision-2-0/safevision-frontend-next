export interface TeamResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
