import { User } from "../entities/user.entity";

export type UserKeys = Extract<keyof User, string>;
export type WhereUser = Partial<Record<UserKeys, unknown>>;
