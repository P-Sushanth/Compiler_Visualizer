import type { WorkerRequest, WorkerResponse } from '@/types/worker';

export class WorkerManager<TPayload, TData> {
  private worker: Worker | null = null;
  private workerCreator: () => Worker;
  private pendingRequests: Map<string, { resolve: (val: TData) => void, reject: (err: any) => void }>;
  private latestRequestId: string | null = null;

  constructor(workerCreator: () => Worker) {
    this.workerCreator = workerCreator;
    this.pendingRequests = new Map();
  }

  private getOrInitWorker(): Worker {
    if (!this.worker) {
      this.worker = this.workerCreator();

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
    return this.worker;
  }

  public execute(payload: TPayload): Promise<TData> {
    return new Promise((resolve, reject) => {
      // Real task cancellation: if there is a running request, terminate the worker
      // to abort any synchronous loop running in that worker thread, and then start a new one.
      if (this.latestRequestId && this.pendingRequests.has(this.latestRequestId)) {
        const previousHandlers = this.pendingRequests.get(this.latestRequestId);
        if (previousHandlers) {
          previousHandlers.reject(new Error('Request cancelled by newer request'));
          this.pendingRequests.delete(this.latestRequestId);
        }
        
        if (this.worker) {
          this.worker.terminate();
          this.worker = null; // Forces recreation on next call to getOrInitWorker()
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

      try {
        const worker = this.getOrInitWorker();
        worker.postMessage(request);
      } catch (err) {
        reject(err);
      }
    });
  }
  
  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.forEach(({ reject }) => reject(new Error('Worker terminated')));
    this.pendingRequests.clear();
  }
}

