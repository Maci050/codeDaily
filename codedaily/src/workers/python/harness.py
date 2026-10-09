"""Ejecuta el código del jugador contra los tests y comprueba las restricciones del reto.

Se carga en Pyodide dentro de un Web Worker (ver pythonWorker.js) y también se usa
desde scripts/validate-weekly.py para validar los desafíos con CPython.
"""
import ast
import json
import time

# Con restricciones activas, estos nombres permitirían saltárselas (eval("sor" + "ted")...)
ESCAPE_NAMES = {
    'eval', 'exec', 'compile', 'getattr', 'setattr', 'delattr', '__import__',
    'globals', 'locals', 'vars', 'breakpoint', '__builtins__',
}

COMPREHENSIONS = (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)


def _is_negative_number(node):
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
        return True
    return isinstance(node, ast.Constant) and isinstance(node.value, (int, float)) and node.value < 0


def _syntax_matches(node, kind):
    if kind == 'for':
        return isinstance(node, (ast.For, ast.AsyncFor))
    if kind == 'while':
        return isinstance(node, ast.While)
    if kind == 'comprehension':
        return isinstance(node, COMPREHENSIONS)
    if kind == 'lambda':
        return isinstance(node, ast.Lambda)
    if kind == 'pow_operator':
        return (isinstance(node, ast.BinOp) and isinstance(node.op, ast.Pow)) or (
            isinstance(node, ast.AugAssign) and isinstance(node.op, ast.Pow)
        )
    if kind == 'slice':
        return isinstance(node, ast.Slice)
    if kind == 'negative_step_slice':
        return isinstance(node, ast.Slice) and node.step is not None and _is_negative_number(node.step)
    if kind == 'in_operator':
        return isinstance(node, ast.Compare) and any(isinstance(op, (ast.In, ast.NotIn)) for op in node.ops)
    return False


def _calls_itself(function_node):
    return any(
        isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == function_node.name
        for node in ast.walk(function_node)
    )


def count_code_lines(code):
    return sum(1 for line in code.splitlines() if line.strip() and not line.strip().startswith('#'))


def check_constraints(code, constraints):
    """Devuelve una lista de infracciones: {"code", "detail", "line"}."""
    if not constraints:
        return []
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return []  # el error de sintaxis se informa al ejecutar

    forbidden_calls = set(constraints.get('forbiddenCalls', []))
    forbidden_methods = set(constraints.get('forbiddenMethods', []))
    forbidden_syntax = list(constraints.get('forbiddenSyntax', []))
    violations = []
    seen = set()

    def add(code_, detail, line):
        key = (code_, detail)
        if key not in seen:
            seen.add(key)
            violations.append({'code': code_, 'detail': detail, 'line': line})

    for node in ast.walk(tree):
        line = getattr(node, 'lineno', None)

        # Cualquier mención (no solo la llamada): así `f = sorted; f(x)` también cuenta
        if isinstance(node, ast.Name):
            if node.id in forbidden_calls:
                add('FORBIDDEN_CALL', node.id, line)
            elif node.id in ESCAPE_NAMES:
                add('FORBIDDEN_NAME', node.id, line)

        if isinstance(node, ast.Attribute):
            if node.attr in forbidden_methods:
                add('FORBIDDEN_METHOD', node.attr, line)
            elif node.attr in forbidden_calls:
                add('FORBIDDEN_CALL', node.attr, line)
            elif node.attr.startswith('__') and node.attr.endswith('__'):
                add('FORBIDDEN_NAME', node.attr, line)

        if constraints.get('forbidImports') and isinstance(node, (ast.Import, ast.ImportFrom)):
            add('FORBIDDEN_SYNTAX', 'import', line)

        for kind in forbidden_syntax:
            if _syntax_matches(node, kind):
                add('FORBIDDEN_SYNTAX', kind, line)

    recursive = [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef) and _calls_itself(n)]
    if constraints.get('requireRecursion') and not recursive:
        add('RECURSION_REQUIRED', '', None)
    if constraints.get('forbidRecursion') and recursive:
        add('RECURSION_FORBIDDEN', recursive[0].name, recursive[0].lineno)

    max_lines = constraints.get('maxLines')
    if max_lines:
        lines = count_code_lines(code)
        if lines > max_lines:
            add('TOO_MANY_LINES', f'{lines}/{max_lines}', None)

    violations.sort(key=lambda v: (v['line'] is None, v['line'] or 0))
    return violations


def _jsonable(value):
    """Valor serializable para devolver al navegador (repr si no lo es, p. ej. un set)."""
    try:
        json.dumps(value)
        return value
    except (TypeError, ValueError):
        return repr(value)


def run_challenge(user_code, function_name, tests_json, constraints_json='null'):
    tests = json.loads(tests_json)
    constraints = json.loads(constraints_json) if constraints_json else None
    result = {
        'success': False,
        'errorCodes': [],
        'pythonError': None,
        'testResults': [],
        'passedCount': 0,
        'totalTests': len(tests),
        'violations': [],
        'durationMs': 0,
    }

    result['violations'] = check_constraints(user_code, constraints)
    started = time.perf_counter()

    # Si incumple las reglas no se ejecuta: la respuesta es inmediata y clara
    # (y se evita esperar a código como `base ** 10**15` que no terminaría)
    if result['violations']:
        result['errorCodes'].append('CONSTRAINT_VIOLATION')
        return json.dumps(result)

    try:
        namespace = {'__name__': '__codedaily__'}
        exec(user_code, namespace)
        fn = namespace.get(function_name)

        if not callable(fn):
            result['errorCodes'].append('FUNCTION_NOT_CALLABLE')
        else:
            for index, test in enumerate(tests):
                # Cada test recibe su propia copia de la entrada
                args = json.loads(json.dumps(test['input']))
                try:
                    actual = fn(*args)
                    passed = actual == test['expected']
                    result['testResults'].append({
                        'index': index,
                        'passed': passed,
                        'input': test['input'],
                        'expected': test['expected'],
                        'actual': _jsonable(actual),
                    })
                    if passed:
                        result['passedCount'] += 1
                except RecursionError:
                    result['testResults'].append({
                        'index': index, 'passed': False, 'input': test['input'],
                        'expected': test['expected'], 'actual': None,
                        'runtimeError': 'RecursionError: maximum recursion depth exceeded',
                    })
                    if 'RECURSION_DEPTH' not in result['errorCodes']:
                        result['errorCodes'].append('RECURSION_DEPTH')
                except Exception as test_error:  # noqa: BLE001 - se informa al jugador
                    result['testResults'].append({
                        'index': index, 'passed': False, 'input': test['input'],
                        'expected': test['expected'], 'actual': None,
                        'runtimeError': f'{test_error.__class__.__name__}: {test_error}',
                    })

            if result['passedCount'] != result['totalTests']:
                result['errorCodes'].append('TESTS_FAILED')
    except SyntaxError as syntax_error:
        result['errorCodes'].append('PYTHON_SYNTAX_ERROR')
        result['pythonError'] = f'{syntax_error.__class__.__name__}: {syntax_error}'
    except Exception as runtime_error:  # noqa: BLE001
        result['errorCodes'].append('PYTHON_RUNTIME_ERROR')
        result['pythonError'] = f'{runtime_error.__class__.__name__}: {runtime_error}'

    result['durationMs'] = round((time.perf_counter() - started) * 1000)

    result['success'] = (
        result['totalTests'] > 0
        and result['passedCount'] == result['totalTests']
        and not result['pythonError']
    )
    return json.dumps(result)
