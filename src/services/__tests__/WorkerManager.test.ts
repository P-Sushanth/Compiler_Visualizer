import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorkerManager } from '../WorkerManager';

describe('WorkerManager', () => {
  let mockWorker: any;

  beforeEach(() => {
    vi.useFakeTimers();
    mockWorker = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
      onerror: null,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve the promise when the worker succeeds', async () => {
    const manager = new WorkerManager<string, string>(() => mockWorker);
    
    const promise = manager.execute('test-input');
    
    // Check that postMessage was called with a request envelope
    expect(mockWorker.postMessage).toHaveBeenCalled();
    const sentRequest = mockWorker.postMessage.mock.calls[0][0];
    expect(sentRequest.payload).toBe('test-input');

    // Simulate worker success response
    mockWorker.onmessage({
      data: {
        requestId: sentRequest.requestId,
        success: true,
        data: 'test-output',
        error: null,
      }
    });

    const result = await promise;
    expect(result).toBe('test-output');
  });

  it('should reject the promise when the worker sends an error', async () => {
    const manager = new WorkerManager<string, string>(() => mockWorker);
    
    const promise = manager.execute('test-input');
    const sentRequest = mockWorker.postMessage.mock.calls[0][0];

    mockWorker.onmessage({
      data: {
        requestId: sentRequest.requestId,
        success: false,
        data: null,
        error: 'Failed execution',
      }
    });

    await expect(promise).rejects.toThrow('Failed execution');
  });

  it('should cancel previous pending request when a new one is sent', async () => {
    const manager = new WorkerManager<string, string>(() => mockWorker);
    
    const promise1 = manager.execute('first');
    const promise2 = manager.execute('second');

    // First request should be rejected with cancellation error
    await expect(promise1).rejects.toThrow('Request cancelled');
    
    // Worker should have been terminated and recreated
    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  it('should reject on timeout after 5 seconds', async () => {
    const manager = new WorkerManager<string, string>(() => mockWorker);
    
    const promise = manager.execute('timeout-test');
    
    // Advance timers by 5001ms
    vi.advanceTimersByTime(5001);

    await expect(promise).rejects.toThrow('Worker execution timed out');
    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  it('should handle worker.onerror by rejecting pending promises', async () => {
    const manager = new WorkerManager<string, string>(() => mockWorker);
    
    const promise = manager.execute('error-test');
    
    // Simulate raw worker crash
    mockWorker.onerror(new ErrorEvent('error', { message: 'Web worker crashed' }));

    await expect(promise).rejects.toThrow();
    expect(mockWorker.terminate).toHaveBeenCalled();
  });
});
