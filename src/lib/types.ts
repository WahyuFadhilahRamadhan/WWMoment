export type FilterStyle = "original" | "warm" | "soft" | "bw" | "vivid";

export interface GuestbookPhoto {
  id: string;
  guest_name: string;
  message: string | null;
  photo_url: string;
  filter_style: FilterStyle;
  created_at: string;
}

export interface GuestbookPhotoInsert {
  guest_name?: string;
  message?: string | null;
  photo_url: string;
  filter_style?: FilterStyle;
}
