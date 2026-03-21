const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/';

let pyodideInstance = null;
let pyodidePromise = null;

async function ensurePyodideLoaded() {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodidePromise) {
    return pyodidePromise;
  }

  pyodidePromise = (async () => {
    if (typeof window === 'undefined' || typeof window.loadPyodide !== 'function') {
      throw new Error('PYODIDE_SCRIPT_NOT_AVAILABLE');
    }

    const instance = await window.loadPyodide({
      indexURL: PYODIDE_INDEX_URL,
    });

    pyodideInstance = instance;
    return instance;
  })();

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