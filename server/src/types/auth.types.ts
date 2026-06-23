import type { Types } from "mongoose";

export type UserRole = "owner" | "admin" | "member";

export interface Image {
  image_url: string;
  public_alt: string;
}
