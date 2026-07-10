export interface Search<T> {
  filter?: T;
  page?: number;
  per_page?: number;
}

export interface SearchResult<T> {
  items: T;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
