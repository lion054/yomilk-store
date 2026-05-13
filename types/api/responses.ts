export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errorCode?: 'DUPLICATE_ACCOUNT' | 'VALIDATION_ERROR' | 'NETWORK_OR_SERVER' | 'MAX_RETRIES' | 'UNKNOWN';
}

export interface PaginatedResponse<T> {
  values: T[];
  recordCount: number;
  pageCount: number;
  pageNumber: number;
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}
