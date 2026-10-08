const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/';

let pyodideInstance = null;
let pyodidePromise = null;
let scriptPromise = null;

// El script de Pyodide se inyecta la primera vez que hace falta,
// así la portada y el resto de páginas no lo descargan.
function loadPyodideScript() {
  if (typeof window !== 'undefined' && typeof window.loadPyodide === 'function') {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${PYODIDE_INDEX_URL}pyodide.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        scriptPromise = null;
        reject(new Error('PYODIDE_SCRIPT_NOT_AVAILABLE'));
      };
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

async function ensurePyodideLoaded() {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodidePromise) {
    return pyodidePromise;
  }

  pyodidePromise = (async () => {
    await loadPyodideScript();

    const instance = await window.loadPyodide({
      indexURL: PYODIDE_INDEX_URL,
    });

    pyodideInstance = instance;
    return instance;
  })();

  // Si falla (sin conexión, CDN caído), se permite reintentar más tarde
  pyodidePromise.catch(() => {
    pyodidePromise = null;
  });

  return pyodidePromise;
}

async function runPythonChallengeTests(challenge, code) {
  const pyodide = await ensurePyodideLoaded();

  pyodide.globals.set('USER_CODE', code);
  pyodide.globals.set('FUNCTION_NAME', challenge.functionName);
  pyodide.globals.set('TESTS_JSON', JSON.stringify(challenge.tests));

  try {
    const resultJson = await pyodide.runPythonAsync(`
import json
import traceback

result = {
    "success": False,
    "errorCodes": [],
    "pythonError": None,
    "testResults": [],
    "passedCount": 0,
    "totalTests": 0,
}

try:
    namespace = {}
    exec(USER_CODE, namespace)

    fn = namespace.get(FUNCTION_NAME)

    if not callable(fn):
        result["errorCodes"].append("FUNCTION_NOT_CALLABLE")
    else:
        tests = json.loads(TESTS_JSON)
        result["totalTests"] = len(tests)

        for index, test in enumerate(tests):
            try:
                actual = fn(*test["input"])
                expected = test["expected"]
                passed = actual == expected

                result["testResults"].append({
                    "index": index,
                    "passed": passed,
                    "input": test["input"],
                    "expected": expected,
                    "actual": actual,
                })

                if passed:
                    result["passedCount"] += 1
            except Exception as test_error:
                result["testResults"].append({
                    "index": index,
                    "passed": False,
                    "input": test["input"],
                    "expected": test["expected"],
                    "actual": None,
                    "runtimeError": str(test_error),
                })

        result["success"] = result["passedCount"] == result["totalTests"]

        if not result["success"]:
            result["errorCodes"].append("TESTS_FAILED")

except SyntaxError as syntax_error:
    result["errorCodes"].append("PYTHON_SYNTAX_ERROR")
    result["pythonError"] = f"{syntax_error.__class__.__name__}: {syntax_error}"
except Exception as runtime_error:
    result["errorCodes"].append("PYTHON_RUNTIME_ERROR")
    result["pythonError"] = f"{runtime_error.__class__.__name__}: {runtime_error}"

json.dumps(result)
    `);

    return JSON.parse(resultJson);
  } finally {
    pyodide.globals.delete('USER_CODE');
    pyodide.globals.delete('FUNCTION_NAME');
    pyodide.globals.delete('TESTS_JSON');
  }
}

export { ensurePyodideLoaded, runPythonChallengeTests };