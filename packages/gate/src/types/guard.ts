export type Guard<T = unknown, D = unknown> = (
    representative: T,
    inject: (name: string, dependency: D) => void
  ) => boolean | undefined;
  
  export type LazyGuard<T = unknown, E = unknown, D = unknown> = (
    representative: T,
    entity: E,
    inject: (name: string, dependency: D) => void
  ) => boolean | undefined;
  
  export type AsyncGuard<T = unknown, D = unknown> = (
    representative: T,
    inject: (name: string, dependency: D) => void
  ) => Promise<boolean | undefined>;
  
  export type AsyncLazyGuard<T = unknown, E = unknown, D = unknown> = (
    representative: T,
    entity: E,
    inject: (name: string, dependency: D) => void
  ) => Promise<boolean | undefined>;
  