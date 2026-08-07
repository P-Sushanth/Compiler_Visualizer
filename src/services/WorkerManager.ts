import type { WorkerRequest, WorkerResponse } from '@/types/worker';

export class WorkerManager<TPayload, TData> {
  private worker: Worker | null = null;
  private workerCreator: () => Worker;
  private pendingRequests: Map<string, { 
    resolve: (val: TData) => void; 
    reject: (err: any) => void;
    timeoutId: any;
  }>;
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
          clearTimeout(handlers.timeoutId);
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
        // Reject all pending requests and clear timeouts
        this.pendingRequests.forEach(({ reject, timeoutId }) => {
          clearTimeout(timeoutId);
          reject(error);
        });
        this.pendingRequests.clear();
        
        // Auto-recovery: terminate crashed worker and set to null to force recreate next execution
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
      };
    }
    return this.worker;
  }

  public execute(payload: TPayload): Promise<TData> {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();

      // Real task cancellation
      if (this.latestRequestId && this.pendingRequests.has(this.latestRequestId)) {
        const previousHandlers = this.pendingRequests.get(this.latestRequestId);
        if (previousHandlers) {
          clearTimeout(previousHandlers.timeoutId);
          previousHandlers.reject(new Error('Request cancelled by newer request'));
          this.pendingRequests.delete(this.latestRequestId);
        }
        
        if (this.worker) {
          this.worker.terminate();
          this.worker = null; // Forces recreation on next call to getOrInitWorker()
        }
      }

      // 5-second Timeout Guard
      const timeoutId = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          const handlers = this.pendingRequests.get(requestId);
          if (handlers) {
            handlers.reject(new Error('Worker execution timed out (exceeded 5000ms)'));
            this.pendingRequests.delete(requestId);
          }
          console.warn(`Worker timed out on request ${requestId}. Recovering worker thread.`);
          if (this.worker) {
            this.worker.terminate();
            this.worker = null; // Auto-recovery: force recreate on next execution
          }
        }
      }, 5000);

      this.latestRequestId = requestId;
      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });

      const request: WorkerRequest<TPayload> = {
        requestId,
        timestamp: Date.now(),
        payload,
      };

      try {
        const worker = this.getOrInitWorker();
        worker.postMessage(request);
      } catch (err) {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);
        reject(err);
      }
    });
  }
  
  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.forEach(({ reject, timeoutId }) => {
      clearTimeout(timeoutId);
      reject(new Error('Worker terminated'));
    });
    this.pendingRequests.clear();
  }
}

