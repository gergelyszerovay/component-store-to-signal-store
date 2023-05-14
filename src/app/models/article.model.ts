import { DeepReadonly } from "ts-essentials";

export type Profile = DeepReadonly<{
  bio: string;
  following: boolean;
  image: string;
  username: string;
}>;

export type Article = DeepReadonly<{
  author: Profile;
  body: string;
  createdAt: string;
  description: string;
  favorited: boolean;
  favoritesCount: number;
  slug: string;
  tagList: Array<string>;
  title: string;
  updatedAt: string;
}>;

export type Articles = ReadonlyArray<Article>;
