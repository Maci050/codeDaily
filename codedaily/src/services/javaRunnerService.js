const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY;

// Java language ID en Judge0
const JAVA_LANGUAGE_ID = 62;

// Tiempo máximo de espera para polling (ms)
const MAX_POLL_TIME = 10000;
const POLL_INTERVAL = 800;

/**
 * Construye el código Java completo que Judge0 ejecutará.
 * Envuelve el código del usuario en un harness que:
 * 1. Llama a Solution.solve() con cada test
 * 2. Compara el resultado con el esperado
 * 3. Imprime un JSON con los resultados por stdout
 */
function buildJavaHarness(userCode, tests) {
  const testsJson = JSON.stringify(tests)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

  return `
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) throws Exception {
        String testsJson = "${testsJson}";

        // Parse tests manually para evitar dependencias externas
        // Usamos un enfoque simple con los tests hardcodeados
        runTests();
    }

    static void runTests() {
        List<Map<String, Object>> testResults = new ArrayList<>();
        int passedCount = 0;
        int totalTests = ${tests.length};

        ${tests.map((test, index) => {
          const inputs = test.input.map(v => JSON.stringify(v)).join(', ');
          const expected = JSON.stringify(test.expected);
          return `
        // Test ${index}
        try {
            Object actual${index} = Solution.solve(${inputs});
            Object expected${index} = ${expected};
            boolean passed${index} = String.valueOf(actual${index}).equals(String.valueOf(expected${index}));
            if (passed${index}) passedCount++;
            testResults.add(Map.of(
                "index", ${index},
                "passed", passed${index},
                "input", List.of(${inputs}),
                "expected", expected${index},
                "actual", actual${index}
            ));
        } catch (Exception e) {
            testResults.add(Map.of(
                "index", ${index},
                "passed", false,
                "input", List.of(${inputs}),
                "expected", ${expected},
                "runtimeError", e.getMessage() != null ? e.getMessage() : e.getClass().getName()
            ));
        }`;
        }).join('\n')}

        boolean success = passedCount == totalTests;
        List<String> errorCodes = new ArrayList<>();
        if (!success) errorCodes.add("TESTS_FAILED");

        // Construir JSON manualmente para no depender de librerías
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\\"success\\":").append(success).append(",");
        sb.append("\\"passedCount\\":").append(passedCount).append(",");
        sb.append("\\"totalTests\\":").append(totalTests).append(",");
        sb.append("\\"errorCodes\\":[");
        for (int i = 0; i < errorCodes.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\\"").append(errorCodes.get(i)).append("\\"");
        }
        sb.append("],");
        sb.append("\\"testResults\\":[");
        for (int i = 0; i < testResults.size(); i++) {
            if (i > 0) sb.append(",");
            Map<String, Object> r = testResults.get(i);
            sb.append("{");
            sb.append("\\"index\\":").append(r.get("index")).append(",");
            sb.append("\\"passed\\":").append(r.get("passed")).append(",");
            sb.append("\\"expected\\":").append(r.get("expected")).append(",");
            if (r.containsKey("actual")) {
                sb.append("\\"actual\\":").append(r.get("actual"));
            } else {
                sb.append("\\"runtimeError\\":\\"").append(r.get("runtimeError")).append("\\"");
            }
            sb.append("}");
        }
        sb.append("]}");

        System.out.println(sb.toString());
    }
}
`;
}

/**
 * Envía el código a Judge0 y devuelve el token de la submission
 */
async function submitToJudge0(fullCode) {
  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
    body: JSON.stringify({
      language_id: JAVA_LANGUAGE_ID,
      source_code: fullCode,
      cpu_time_limit: 5,
      memory_limit: 128000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Judge0 submit failed: ${response.status}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Hace polling a Judge0 hasta que la ejecución termina
 */
async function pollResult(token) {
  const start = Date.now();

  while (Date.now() - start < MAX_POLL_TIME) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

    const response = await fetch(
      `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
      {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Judge0 poll failed: ${response.status}`);
    }

    const data = await response.json();

    // Status IDs: 1 = In Queue, 2 = Processing, 3 = Accepted, resto = error
    if (data.status.id > 2) {
      return data;
    }
  }

  throw new Error('JUDGE0_TIMEOUT');
}

/**
 * Ejecuta los tests de un reto Java usando Judge0.
 * Devuelve el mismo formato que runPythonChallengeTests.
 */
async function runJavaChallengeTests(challenge, code) {
  const fullCode = buildJavaHarness(code, challenge.tests);

  const token = await submitToJudge0(fullCode);
  const result = await pollResult(token);

  const statusId = result.status.id;

  // Status 3 = Accepted (compiló y ejecutó sin errores de sistema)
  if (statusId === 3) {
    try {
      const parsed = JSON.parse(result.stdout.trim());
      return {
        success: parsed.success,
        errorCodes: parsed.errorCodes || [],
        testResults: parsed.testResults || [],
        passedCount: parsed.passedCount || 0,
        totalTests: parsed.totalTests || challenge.tests.length,
        runtimeError: null,
      };
    } catch {
      return {
        success: false,
        errorCodes: ['JAVA_OUTPUT_PARSE_ERROR'],
        testResults: [],
        passedCount: 0,
        totalTests: challenge.tests.length,
        runtimeError: result.stdout,
      };
    }
  }

  // Status 6 = Compilation Error
  if (statusId === 6) {
    return {
      success: false,
      errorCodes: ['JAVA_COMPILE_ERROR'],
      testResults: [],
      passedCount: 0,
      totalTests: challenge.tests.length,
      runtimeError: result.compile_output || 'Compilation error',
    };
  }

  // Status 5 = Time Limit Exceeded
  if (statusId === 5) {
    return {
      success: false,
      errorCodes: ['JAVA_TIME_LIMIT'],
      testResults: [],
      passedCount: 0,
      totalTests: challenge.tests.length,
      runtimeError: 'Time limit exceeded',
    };
  }

  // Cualquier otro error de ejecución
  return {
    success: false,
    errorCodes: ['JAVA_RUNTIME_ERROR'],
    testResults: [],
    passedCount: 0,
    totalTests: challenge.tests.length,
    runtimeError: result.stderr || result.message || 'Runtime error',
  };
}

export { runJavaChallengeTests };