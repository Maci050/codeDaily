import { runPythonChallengeTests } from './pythonRunnerService';

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
} = {}) {
  return {
    success,
    errorCodes,
    warningCodes,
    testResults,
    passedCount,
    totalTests,
    pythonError,
  };
}

function validateCommonStructure(challenge, code) {
  const normalized = normalizeCode(code);
  const errorCodes = [];

  if (!normalized) {
    errorCodes.push('EMPTY_CODE');
    return { valid: false, normalizedCode: normalized, errorCodes };
  }

  const functionRegex = /^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*:/m;
  const functionMatch = normalized.match(functionRegex);

  if (!functionMatch) {
    errorCodes.push('MISSING_FUNCTION_DEFINITION');
    return { valid: false, normalizedCode: normalized, errorCodes };
  }

  const functionName = functionMatch[1];

  if (functionName !== challenge.functionName) {
    errorCodes.push('WRONG_FUNCTION_NAME');
  }

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

  if (/\bpass\b/.test(normalized)) {
    errorCodes.push('PASS_LEFT_IN_CODE');
  }

  if (!/\breturn\b/.test(normalized)) {
    errorCodes.push('MISSING_RETURN');
  }

  return {
    valid: errorCodes.length === 0,
    normalizedCode: normalized,
    errorCodes,
  };
}

async function validateChallengeSolution(challenge, code) {
  const structureValidation = validateCommonStructure(challenge, code);

  if (!structureValidation.valid) {
    return createResult({
      success: false,
      errorCodes: structureValidation.errorCodes,
      totalTests: challenge.tests.length,
      passedCount: 0,
    });
  }

  try {
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
    return createResult({
      success: false,
      errorCodes: ['PYODIDE_LOAD_ERROR'],
      totalTests: challenge.tests.length,
      passedCount: 0,
      pythonError: error?.message || 'Unknown Pyodide error',
    });
  }
}

export { validateChallengeSolution };