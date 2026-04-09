export type WatchStatus =
  | "CURRENTLY_WATCHING"
  | "PARTIALLY_WATCHED"
  | "COMPLETED"
  | "PLAN_TO_WATCH";
export type ShowType = "SERIES" | "MOVIE" | "ANIME" | "WEB_DRAMA" | "VARIETY";
export type Country =
  | "KOREAN"
  | "THAI"
  | "VIETNAMESE"
  | "CHINESE_TAIWANESE"
  | "JAPANESE"
  | "AMERICAN";

export interface Keyword {
  id: number;
  code: string;
  label: string;
  color: string;
}

export interface Show {
  id: number;
  title: string;
  country: Country;
  type: ShowType;
  rating: number | null;
  comment: string | null;
  status: WatchStatus;
  current_ep: string | null;
  is_favorite: boolean;
  poster_url: string | null;
  synopsis: string | null;
  created_at: string;
  updated_at: string;
  keywords: Keyword[];
}
