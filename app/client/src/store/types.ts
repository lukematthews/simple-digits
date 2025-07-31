import type { Store } from "@/types";

export type SliceCreator<Slice> = (
  set: (partial: Partial<Store> | ((state: Store) => Partial<Store>)) => void,
  get?: () => Store
) => Slice;
