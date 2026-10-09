// Ejecuta Python (Pyodide) fuera del hilo principal: un bucle infinito del jugador
// ya no congela la página, y el hilo principal puede terminar este worker si se pasa de tiempo.
import HARNESS from './python/harness.py?raw';

const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/';

let pyodidePromise = null;

function loadRuntime() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const { loadPyodide } = await import(/* @vite-ignore */ `${PYODIDE_INDEX_URL}pyodide.mjs`);
      const pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });
      await pyodide.runPythonAsync(HARNESS);
      return pyodide;
    })();
  }
  return pyodidePromise;
}

self.onmessage = async (event) => {
  const { id, type, payload } = event.data;

  try {
    if (type === 'init') {
      await loadRuntime();
      self.postMessage({ id, ok: true });
      return;
    }

    if (type === 'run') {
      const pyodide = await loadRuntime();
      const runChallenge = pyodide.globals.get('run_challenge');
      try {
        const json = runChallenge(
          payload.code,
          payload.functionName,
          JSON.stringify(payload.tests),
          JSON.stringify(payload.constraints ?? null)
        );
        self.postMessage({ id, ok: true, result: JSON.parse(json) });
      } finally {
        runChallenge.destroy();
      }
    }
  } catch (error) {
    self.postMessage({ id, ok: false, error: error?.message || String(error) });
  }
};
