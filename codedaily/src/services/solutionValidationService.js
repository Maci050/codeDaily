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
} = {}) {
  return {
    success,
    errorCodes,
    warningCodes,
    testResults,
    passedCount,
    totalTests,
  };
}

function runTestsWithResolver(challenge, resolver) {
  const testResults = challenge.tests.map((test, index) => {
    try {
      const actual = resolver(...test.input);
      const passed = JSON.stringify(actual) === JSON.stringify(test.expected);

      return {
        index,
        passed,
        input: test.input,
        expected: test.expected,
        actual,
      };
    } catch (error) {
      return {
        index,
        passed: false,
        input: test.input,
        expected: test.expected,
        actual: null,
      };
    }
  });

  const passedCount = testResults.filter((test) => test.passed).length;
  const totalTests = testResults.length;
  const success = passedCount === totalTests;

  return createResult({
    success,
    testResults,
    passedCount,
    totalTests,
    errorCodes: success ? [] : ['TESTS_FAILED'],
  });
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

function validateSumTwoNumbers(code, challenge) {
  const compact = code.replace(/\s+/g, '');
  const validPattern =
    compact.includes('returna+b') || compact.includes('returnb+a');

  if (!validPattern) {
    return createResult({
      success: false,
      errorCodes: ['UNSUPPORTED_LOGIC_PATTERN'],
    });
  }

  return runTestsWithResolver(challenge, (a, b) => a + b);
}

function validateIsEven(code, challenge) {
  const compact = code.replace(/\s+/g, '');
  const validPattern =
    compact.includes('returnn%2==0') ||
    compact.includes('return(n%2==0)') ||
    compact.includes('returnn%2==0') ||
    compact.includes('returnnotn%2');

  if (!validPattern) {
    return createResult({
      success: false,
      errorCodes: ['UNSUPPORTED_LOGIC_PATTERN'],
    });
  }

  return runTestsWithResolver(challenge, (n) => n % 2 === 0);
}

function validateMaxOfThree(code, challenge) {
  const compact = code.replace(/\s+/g, '');

  const usesMax =
    compact.includes('returnmax(a,b,c)') ||
    compact.includes('returnmax([a,b,c])') ||
    compact.includes('returnmax((a,b,c))');

  const usesManualComparisons =
    /\bif\b/.test(code) &&
    />/.test(code) &&
    (code.match(/\breturn\b/g) || []).length >= 2;

  if (!usesMax && !usesManualComparisons) {
    return createResult({
      success: false,
      errorCodes: ['UNSUPPORTED_LOGIC_PATTERN'],
    });
  }

  return runTestsWithResolver(challenge, (a, b, c) => Math.max(a, b, c));
}

function validateReverseWord(code, challenge) {
  const compact = code.replace(/\s+/g, '');

  const usesSlice = compact.includes('returntext[::-1]');
  const usesReversed = compact.includes("return''.join(reversed(text))") ||
    compact.includes('return"".join(reversed(text))');

  if (!usesSlice && !usesReversed) {
    return createResult({
      success: false,
      errorCodes: ['UNSUPPORTED_LOGIC_PATTERN'],
    });
  }

  return runTestsWithResolver(challenge, (text) => text.split('').reverse().join(''));
}

function validateCountVowels(code, challenge) {
  const compact = code.replace(/\s+/g, '').toLowerCase();

  const mentionsVowels =
    compact.includes('aeiou') ||
    compact.includes("['a','e','i','o','u']") ||
    compact.includes('{"a","e","i","o","u"}') ||
    compact.includes("{'a','e','i','o','u'}");

  const hasLoop = /\bfor\b/.test(code);
  const usesLower = compact.includes('.lower()');
  const usesCountSum = compact.includes('sum(');

  if ((!mentionsVowels || !hasLoop) && !(mentionsVowels && usesCountSum) && !(mentionsVowels && usesLower)) {
    return createResult({
      success: false,
      errorCodes: ['UNSUPPORTED_LOGIC_PATTERN'],
    });
  }

  return runTestsWithResolver(challenge, (text) => {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    let count = 0;

    for (const char of text.toLowerCase()) {
      if (vowels.has(char)) {
        count += 1;
      }
    }

    return count;
  });
}

function validateSumList(code, challenge) {
  const compact = code.replace(/\s+/g, '');

  const usesBuiltInSum = compact.includes('returnsum(numbers)');
  const usesLoopAccumulator =
    /\bfor\b/.test(code) &&
    /\+=/.test(code) &&
    code.includes('numbers');

  if (!usesBuiltInSum && !usesLoopAccumulator) {
    return createResult({
      success: false,
      errorCodes: ['UNSUPPORTED_LOGIC_PATTERN'],
    });
  }

  return runTestsWithResolver(challenge, (numbers) =>
    numbers.reduce((acc, value) => acc + value, 0)
  );
}

const challengeValidators = {
  sum_two_numbers: validateSumTwoNumbers,
  is_even: validateIsEven,
  max_of_three: validateMaxOfThree,
  reverse_word: validateReverseWord,
  count_vowels: validateCountVowels,
  sum_list: validateSumList,
};

function validateChallengeSolution(challenge, code) {
  const structureValidation = validateCommonStructure(challenge, code);

  if (!structureValidation.valid) {
    return createResult({
      success: false,
      errorCodes: structureValidation.errorCodes,
      totalTests: challenge.tests.length,
      passedCount: 0,
    });
  }

  const challengeValidator = challengeValidators[challenge.id];

  if (!challengeValidator) {
    return createResult({
      success: false,
      errorCodes: ['NO_VALIDATOR_FOR_CHALLENGE'],
      totalTests: challenge.tests.length,
      passedCount: 0,
    });
  }

  const result = challengeValidator(structureValidation.normalizedCode, challenge);

  return {
    ...result,
    totalTests: challenge.tests.length,
  };
}

export { validateChallengeSolution };