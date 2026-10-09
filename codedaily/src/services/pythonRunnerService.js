// Habla con el worker de Python (src/workers/pythonWorker.js).
// Si una ejecución supera el tiempo límite, el worker se termina y se crea otro:
// así un bucle infinito o una recursión sin fin no bloquean la página.

const DEFAULT_TIMEOUT_MS = 8000;

let worker = null;
let readyPromise = null;
let nextId = 0;
const pending = new Map();

function rejectAll(error) {
  pending.forEach(({ reject, timer }) => {
    clearTimeout(timer);
    reject(error);
  });
  pending.clear();
}

function resetWorker() {
  worker?.terminate();
  worker = null;
  readyPromise = null;
}

function spawnWorker() {
  worker = new Worker(new URL('../workers/pythonWorker.js', import.meta.url), { type: 'module' });

  worker.onmessage = (event) => {
    const { id, ok, result, error } = event.data;
    const request = pending.get(id);
    if (!request) return;
    pending.delete(id);
    clearTimeout(request.timer);
    if (ok) request.resolve(result);
    else request.reject(new Error(error));
  };

  worker.onerror = (event) => {
    event.preventDefault?.();
    rejectAll(new Error('PYODIDE_WORKER_ERROR'));
    resetWorker();
  };
}

function send(type, payload, timeoutMs = null) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const request = { resolve, reject, timer: null };

    if (timeoutMs) {
      request.timer = setTimeout(() => {
        if (!pending.has(id)) return;
        pending.delete(id);
        // No se puede interrumpir Python a medias: se descarta el worker entero
        rejectAll(new Error('PYODIDE_WORKER_RESET'));
        resetWorker();
        const timeout = new Error('PYTHON_TIMEOUT');
        timeout.name = 'TimeoutError';
        reject(timeout);
      }, timeoutMs);
    }

    pending.set(id, request);
    worker.postMessage({ id, type, payload });
  });
}

// Carga Pyodide en el worker (la primera vez descarga ~5 MB, luego queda en caché del navegador)
function ensurePyodideLoaded() {
  if (!readyPromise) {
    spawnWorker();
    readyPromise = send('init').catch((error) => {
      resetWorker();
      throw error;
    });
  }
  return readyPromise;
}

async function runPythonChallengeTests(challenge, code, { constraints = null, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  await ensurePyodideLoaded();

  try {
    return await send(
      'run',
      { code, functionName: challenge.functionName, tests: challenge.tests, constraints },
      timeoutMs
    );
  } catch (error) {
    if (error.name === 'TimeoutError') {
      return {
        success: false,
        errorCodes: ['PYTHON_TIMEOUT'],
        pythonError: null,
        testResults: [],
        passedCount: 0,
        totalTests: challenge.tests.length,
        violations: [],
        timeLimitMs: timeoutMs,
      };
    }
    throw error;
  }
}

export { ensurePyodideLoaded, runPythonChallengeTests };
