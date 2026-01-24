export interface ImageResponse {
  success: boolean;
  message: string;
  data: Image[];
}

export interface Image {
  id: number;
  image: string;
  profileId: number;
  created_at: string;
  updated_at: string;
}