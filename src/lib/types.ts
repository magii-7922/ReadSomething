import type {
  BookRating,
  Category,
  EventRating,
  GameRating,
  MovieRating,
} from "./ratings";

export type CheckIn = {
  id: string;
  check_date: string;
  category: Category;
  created_at: string;
};

export type WishItem = {
  id: string;
  category: Category;
  title: string;
  note: string;
  is_done: boolean;
  is_watching: boolean;
  done_at: string | null;
  created_at: string;
};

export type BookReview = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  link: string | null;
  tags: string[];
  rating: BookRating;
  review: string;
  excerpt: string;
  experience_date: string | null;
  serial_no: number | null;
  created_at: string;
  updated_at: string;
};

export type MovieReview = {
  id: string;
  title: string;
  director: string;
  studio: string;
  original_work: string;
  tags: string[];
  rating: MovieRating;
  review: string;
  excerpt: string;
  ticket_stub_path: string | null;
  experience_date: string | null;
  serial_no: number | null;
  created_at: string;
  updated_at: string;
};

export type GameReview = {
  id: string;
  title: string;
  company: string;
  publisher: string;
  price: string;
  tags: string[];
  rating: GameRating;
  review: string;
  screenshot_paths: string[];
  experience_date: string | null;
  serial_no: number | null;
  created_at: string;
  updated_at: string;
};

export type EventReview = {
  id: string;
  title: string;
  organizer: string;
  location: string;
  ticket_price: string;
  tags: string[];
  rating: EventRating;
  review: string;
  photo_paths: string[];
  experience_date: string | null;
  serial_no: number | null;
  created_at: string;
  updated_at: string;
};

export type Draft = {
  id: string;
  category: Category;
  title: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      check_ins: TableDef<
        CheckIn,
        {
          id?: string;
          check_date: string;
          category: Category;
          created_at?: string;
        },
        {
          id?: string;
          check_date?: string;
          category?: Category;
          created_at?: string;
        }
      >;
      wish_items: TableDef<
        WishItem,
        {
          id?: string;
          category: Category;
          title: string;
          note?: string;
          is_done?: boolean;
          is_watching?: boolean;
          done_at?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          category?: Category;
          title?: string;
          note?: string;
          is_done?: boolean;
          is_watching?: boolean;
          done_at?: string | null;
          created_at?: string;
        }
      >;
      book_reviews: TableDef<
        BookReview,
        {
          id?: string;
          title: string;
          author?: string;
          publisher?: string;
          link?: string | null;
          tags?: string[];
          rating: BookRating;
          review?: string;
          excerpt?: string;
          experience_date?: string | null;
          serial_no?: number | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<BookReview>
      >;
      movie_reviews: TableDef<
        MovieReview,
        {
          id?: string;
          title: string;
          director?: string;
          studio?: string;
          original_work?: string;
          tags?: string[];
          rating: MovieRating;
          review?: string;
          excerpt?: string;
          ticket_stub_path?: string | null;
          experience_date?: string | null;
          serial_no?: number | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<MovieReview>
      >;
      game_reviews: TableDef<
        GameReview,
        {
          id?: string;
          title: string;
          company?: string;
          publisher?: string;
          price?: string;
          tags?: string[];
          rating: GameRating;
          review?: string;
          screenshot_paths?: string[];
          experience_date?: string | null;
          serial_no?: number | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<GameReview>
      >;
      event_reviews: TableDef<
        EventReview,
        {
          id?: string;
          title: string;
          organizer?: string;
          location?: string;
          ticket_price?: string;
          tags?: string[];
          rating: EventRating;
          review?: string;
          photo_paths?: string[];
          experience_date?: string | null;
          serial_no?: number | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<EventReview>
      >;
      drafts: TableDef<
        Draft,
        {
          id?: string;
          category: Category;
          title?: string;
          payload?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Draft>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
