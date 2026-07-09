import type { WorkerRequest, WorkerResponse } from '@/types/worker';

export class WorkerManager<TPayload, TData> {
  private worker: Worker;
  private pendingRequests: Map<string, { resolve: (val: TData) => void, reject: (err: any) => void }>;
  private latestRequestId: string | null = null;

  constructor(worker: Worker) {
    this.worker = worker;
    this.pendingRequests = new Map();

    this.worker.onmessage = (event: MessageEvent<WorkerResponse<TData>>) => {
      const response = event.data;
      
      // Stale request handling: only process if it's the latest request
      if (response.requestId !== this.latestRequestId) {
        return; // Ignore stale response
      }

      const handlers = this.pendingRequests.get(response.requestId);
      if (handlers) {
        this.pendingRequests.delete(response.requestId);
        if (response.success && response.data !== null) {
          handlers.resolve(response.data);
        } else {
          handlers.reject(new Error(response.error || 'Unknown worker error'));
        }
      }
    };

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
      // Reject all pending requests
      this.pendingRequests.forEach(({ reject }) => reject(error));
      this.pendingRequests.clear();
    };
  }

  public execute(payload: TPayload): Promise<TData> {
    return new Promise((resolve, reject) => {
      // Cancel previous request if any (latestRequestId concept inherently handles this by ignoring older ones,
      // but we could also send a specific cancellation message if the worker supported it)
      if (this.latestRequestId) {
        const previousHandlers = this.pendingRequests.get(this.latestRequestId);
        if (previousHandlers) {
          previousHandlers.reject(new Error('Request cancelled by newer request'));
          this.pendingRequests.delete(this.latestRequestId);
        }
      }

      const requestId = crypto.randomUUID();
      this.latestRequestId = requestId;
      this.pendingRequests.set(requestId, { resolve, reject });

      const request: WorkerRequest<TPayload> = {
        requestId,
        timestamp: Date.now(),
        payload,
      };

      this.worker.postMessage(request);
    });
  }
  
  public terminate() {
    this.worker.terminate();
    this.pendingRequests.forEach(({ reject }) => reject(new Error('Worker terminated')));
    this.pendingRequests.clear();
  }
}
