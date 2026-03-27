import { runPythonChallengeTests } from './pythonRunnerService';
import { runJavaChallengeTests } from './javaRunnerService';

function normalizeCode(code = '') {
  return code.replace(/\r\n/g, '\n').trim();
}

function createResult({
  success = false,
  errorCodes = [],
  warningCodes = [],
  testResults = [],
  passedCount = 0,
  totalTests = 0,
  pythonError = null,
  runtimeError = null,
} = {}) {
  return {
    success,
    errorCodes,
    warningCodes,
    testResults,
    passedCount,
    totalTests,
    pythonError,
    runtimeError,
  };
}

// ─── Validación estructural Python ───────────────────────────────────────────

function validatePythonStructure(challenge, normalized) {
  const errorCodes = [];

  const functionRegex = /^def\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*:/m;
  const functionMatch = normalized.match(functionRegex);

  if (!functionMatch) {
    errorCodes.push('MISSING_FUNCTION_DEFINITION');
    return { valid: false, errorCodes };
  }

  if (functionMatch[1] !== challenge.functionName) {
    errorCodes.push('WRONG_FUNCTION_NAME');
  }

  if (/\bpass\b/.test(normalized)) {
    errorCodes.push('PASS_LEFT_IN_CODE');
  }

  if (!/\breturn\b/.test(normalized)) {
    errorCodes.push('MISSING_RETURN');
  }

  return { valid: errorCodes.length === 0, errorCodes };
}

// ─── Validación estructural Java ─────────────────────────────────────────────

function validateJavaStructure(challenge, normalized) {
  const errorCodes = [];

  // Debe tener una clase Solution
  if (!/class\s+Solution/.test(normalized)) {
    errorCodes.push('MISSING_CLASS_DEFINITION');
    return { valid: false, errorCodes };
  }

  // Debe tener el método solve como public static
  const methodRegex = /public\s+static\s+\w[\w<>\[\]]*\s+solve\s*\(/;
  if (!methodRegex.test(normalized)) {
    errorCodes.push('MISSING_METHOD_DEFINITION');
    return { valid: false, errorCodes };
  }

  // No debe tener el cuerpo sin implementar (solo llaves vacías o TODO)
  if (/\/\/\s*TODO/.test(normalized)) {
    errorCodes.push('PASS_LEFT_IN_CODE');
  }

  if (!/\breturn\b/.test(normalized)) {
    errorCodes.push('MISSING_RETURN');
  }

  return { valid: errorCodes.length === 0, errorCodes };
}

// ─── Validación de tokens (requiredTokens / forbiddenTokens) ─────────────────

function validateTokens(challenge, normalized) {
  const errorCodes = [];
  const requiredTokens = challenge.solutionShape?.requiredTokens || [];
  const forbiddenTokens = challenge.solutionShape?.forbiddenTokens || [];

  requiredTokens.forEach((token) => {
    if (!normalized.includes(token)) {
      errorCodes.push(`MISSING_REQUIRED_TOKEN:${token}`);
    }
  });

  forbiddenTokens.forEach((token) => {
    if (normalized.includes(token)) {
      errorCodes.push(`FORBIDDEN_TOKEN_USED:${token}`);
    }
  });

  return errorCodes;
}

// ─── Validación estructural por lenguaje ─────────────────────────────────────

function validateStructure(challenge, code) {
  const normalized = normalizeCode(code);
  const errorCodes = [];

  if (!normalized) {
    errorCodes.push('EMPTY_CODE');
    return { valid: false, normalizedCode: normalized, errorCodes };
  }

  const languageValidation =
    challenge.language === 'java'
      ? validateJavaStructure(challenge, normalized)
      : validatePythonStructure(challenge, normalized);

  errorCodes.push(...languageValidation.errorCodes);

  if (!languageValidation.valid) {
    return { valid: false, normalizedCode: normalized, errorCodes };
  }

  const tokenErrors = validateTokens(challenge, normalized);
  errorCodes.push(...tokenErrors);

  return {
    valid: errorCodes.length === 0,
    normalizedCode: normalized,
    errorCodes,
  };
}

// ─── Punto de entrada principal ───────────────────────────────────────────────

async function validateChallengeSolution(challenge, code) {
  const structureValidation = validateStructure(challenge, code);

  if (!structureValidation.valid) {
    return createResult({
      success: false,
      errorCodes: structureValidation.errorCodes,
      totalTests: challenge.tests.length,
      passedCount: 0,
    });
  }

  try {
    if (challenge.language === 'java') {
      const javaResult = await runJavaChallengeTests(
        challenge,
        structureValidation.normalizedCode
      );

      return createResult({
        success: javaResult.success,
        errorCodes: javaResult.errorCodes || [],
        testResults: javaResult.testResults || [],
        passedCount: javaResult.passedCount || 0,
        totalTests: javaResult.totalTests || challenge.tests.length,
        runtimeError: javaResult.runtimeError || null,
      });
    }

    // Python (default)
    const pythonResult = await runPythonChallengeTests(
      challenge,
      structureValidation.normalizedCode
    );

    return createResult({
      success: pythonResult.success,
      errorCodes: pythonResult.errorCodes || [],
      testResults: pythonResult.testResults || [],
      passedCount: pythonResult.passedCount || 0,
      totalTests: pythonResult.totalTests || challenge.tests.length,
      pythonError: pythonResult.pythonError || null,
    });
  } catch (error) {
    const isJava = challenge.language === 'java';
    return createResult({
      success: false,
      errorCodes: [isJava ? 'JUDGE0_ERROR' : 'PYODIDE_LOAD_ERROR'],
      totalTests: challenge.tests.length,
      passedCount: 0,
      runtimeError: error?.message || 'Unknown error',
    });
  }
}

export { validateChallengeSolution };