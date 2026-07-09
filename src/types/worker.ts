export type WorkerRequest<TPayload = any> = {
  requestId: string;
  timestamp: number;
  payload: TPayload;
};

export type WorkerResponse<TData = any> = {
  requestId: string;
  success: boolean;
  data: TData | null;
  error: string | null;
};
