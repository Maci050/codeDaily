const JUDGE0_API_URL = 'https://ce.judge0.com';
const JAVA_LANGUAGE_ID = 62;
const MAX_POLL_TIME = 15000;
const POLL_INTERVAL = 1000;

function toJavaLiteral(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'new int[]{}';
    if (Array.isArray(value[0])) {
      const rows = value.map(row => `new int[]{${row.map(toJavaLiteral).join(', ')}}`);
      return `new int[][]{${rows.join(', ')}}`;
    }
    if (typeof value[0] === 'string') return `new String[]{${value.map(toJavaLiteral).join(', ')}}`;
    return `new int[]{${value.map(toJavaLiteral).join(', ')}}`;
  }
  return String(value);
}

function toExpectedString(value) {
  if (Array.isArray(value)) return '"' + JSON.stringify(value).replace(/"/g, '').replace(/, /g, ',') + '"';
  if (typeof value === 'string') return '"' + value + '"';
  return '"' + value + '"';
}

function buildTestBlock(test, index) {
  const args = test.input.map(toJavaLiteral).join(', ');
  const expectedStr = toExpectedString(test.expected);
  const isArray = Array.isArray(test.expected);
  const isMatrix = isArray && test.expected.length > 0 && Array.isArray(test.expected[0]);

  const actualToString = isMatrix
    ? `java.util.Arrays.deepToString(actual${index}).replace(", ",",")`
    : isArray
      ? `java.util.Arrays.toString(actual${index}).replace(", ",",")`
      : `String.valueOf(actual${index})`;

  const expectedNorm = isArray
    ? `${expectedStr}.replace(", ",",")`
    : expectedStr;

  return (
    `\n        // Test ${index}\n` +
    `        try {\n` +
    `            var actual${index} = Solution.solve(${args});\n` +
    `            String actualStr${index} = ${actualToString};\n` +
    `            String expStr${index} = ${expectedNorm};\n` +
    `            boolean passed${index} = actualStr${index}.equals(expStr${index});\n` +
    `            if (passed${index}) passedCount++;\n` +
    `            if (testCount > 0) sb.append(",");\n` +
    `            sb.append("{\\"index\\":${index},\\"passed\\":").append(passed${index});\n` +
    `            sb.append(",\\"expected\\":").append(jsonStr(expStr${index}));\n` +
    `            sb.append(",\\"actual\\":").append(jsonStr(actualStr${index}));\n` +
    `            sb.append("}");\n` +
    `            testCount++;\n` +
    `        } catch (Exception e${index}) {\n` +
    `            if (testCount > 0) sb.append(",");\n` +
    `            sb.append("{\\"index\\":${index},\\"passed\\":false,\\"expected\\":").append(jsonStr(${expectedStr}));\n` +
    `            sb.append(",\\"runtimeError\\":").append(jsonStr(e${index}.getMessage() != null ? e${index}.getMessage() : e${index}.getClass().getName()));\n` +
    `            sb.append("}");\n` +
    `            testCount++;\n` +
    `        }`
  );
}

function buildJavaHarness(userCode, tests) {
  const testBlocks = tests.map((t, i) => buildTestBlock(t, i)).join('\n');
  const total = tests.length;

  return (
    `${userCode}\n\n` +
    `public class Main {\n` +
    `    static String jsonStr(String s) {\n` +
    `        if (s == null) return "null";\n` +
    `        return "\\"" + s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"") + "\\"";\n` +
    `    }\n\n` +
    `    public static void main(String[] args) {\n` +
    `        int passedCount = 0;\n` +
    `        int totalTests = ${total};\n` +
    `        int testCount = 0;\n` +
    `        StringBuilder sb = new StringBuilder();\n` +
    `        sb.append("[");\n` +
    `${testBlocks}\n` +
    `        sb.append("]");\n` +
    `        boolean success = passedCount == totalTests;\n` +
    `        System.out.println("{\\"success\\":" + success + ",\\"passedCount\\":" + passedCount + ",\\"totalTests\\":" + totalTests + ",\\"errorCodes\\":" + (success ? "[]" : "[\\"TESTS_FAILED\\"]") + ",\\"testResults\\":" + sb.toString() + "}");\n` +
    `    }\n` +
    `}\n`
  );
}

async function submitToJudge0(fullCode) {
  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language_id: JAVA_LANGUAGE_ID,
      source_code: fullCode,
      cpu_time_limit: 5,
      memory_limit: 128000,
    }),
  });
  if (!response.ok) throw new Error(`Judge0 submit failed: ${response.status}`);
  const data = await response.json();
  return data.token;
}

async function pollResult(token) {
  const start = Date.now();
  while (Date.now() - start < MAX_POLL_TIME) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
    const response = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Judge0 poll failed: ${response.status}`);
    const data = await response.json();
    if (data.status.id > 2) return data;
  }
  throw new Error('JUDGE0_TIMEOUT');
}

async function runJavaChallengeTests(challenge, code) {
  const fullCode = buildJavaHarness(code, challenge.tests);
  const token = await submitToJudge0(fullCode);
  const result = await pollResult(token);
  const statusId = result.status.id;

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