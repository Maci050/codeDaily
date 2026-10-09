"""Genera y valida los desafíos semanales de Python.

Uso (desde codedaily/):  python scripts/weekly/build_weekly.py

Cada desafío se define aquí. El script:
  1. calcula el resultado esperado de cada test ejecutando la solución de referencia,
  2. comprueba con el mismo motor que usa la web (src/workers/python/harness.py) que
     la solución pasa todos los tests y cumple las restricciones,
  3. comprueba que el código inicial NO pasa y que cada trampa de `reject` se rechaza
     (por restricciones, por tests o por tiempo),
  4. escribe src/data/challenges/weekly_python.json.
Si algo falla, no escribe el JSON y explica qué desafío hay que corregir.
"""
import json
import subprocess
import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'src' / 'workers' / 'python'))
import harness  # noqa: E402

OUTPUT = ROOT / 'src' / 'data' / 'challenges' / 'weekly_python.json'
MAX_SAFE_INTEGER = 2 ** 53 - 1  # los tests pasan por JavaScript: más allá se pierde precisión


def code(block):
    return textwrap.dedent(block).strip('\n')


STARTER_TODO = '    # TODO: replace this with your solution\n    pass'

CHALLENGES = [
    # ── 1 ─────────────────────────────────────────────────────────────────────
    {
        'id': 'digit_sum_recursive',
        'kind': 'transform',
        'functionName': 'solve',
        'timeLimitMs': 4000,
        'title': {
            'es': 'Suma de dígitos, versión recursiva',
            'en': 'Digit sum, recursive version',
        },
        'description': {
            'es': 'Esta función suma los dígitos de un número con un bucle `while`. Reescríbela de forma **recursiva**: la función tiene que llamarse a sí misma, sin bucles y sin convertir el número a texto.',
            'en': 'This function adds up the digits of a number with a `while` loop. Rewrite it **recursively**: the function must call itself, with no loops and without turning the number into text.',
        },
        'referenceTitle': {'es': 'Versión iterativa', 'en': 'Iterative version'},
        'referenceCode': code('''
            def solve(n):
                total = 0
                while n > 0:
                    total += n % 10
                    n //= 10
                return total
        '''),
        'instructions': {
            'es': '`solve(n)` recibe un entero `n >= 0` y devuelve la suma de sus dígitos. `n % 10` te da el último dígito y `n // 10` lo quita.',
            'en': '`solve(n)` takes an integer `n >= 0` and returns the sum of its digits. `n % 10` gives you the last digit and `n // 10` removes it.',
        },
        'rules': {
            'es': ['La función debe llamarse a sí misma.', 'Sin `for`, `while` ni comprensiones.', 'Sin `str()`, `sum()`, `map()` ni `import`.'],
            'en': ['The function must call itself.', 'No `for`, `while` or comprehensions.', 'No `str()`, `sum()`, `map()` or `import`.'],
        },
        'constraints': {
            'requireRecursion': True,
            'forbiddenSyntax': ['for', 'while', 'comprehension'],
            'forbiddenCalls': ['str', 'sum', 'map', 'repr', 'format'],
            'forbidImports': True,
        },
        'hints': {
            'es': ['Caso base: si `n` es `0`, la suma es `0`.', 'La suma de dígitos de `n` es `n % 10` más la suma de dígitos de `n // 10`.', 'Cabe en una línea: `return 0 if n == 0 else n % 10 + solve(n // 10)`.'],
            'en': ['Base case: if `n` is `0`, the sum is `0`.', 'The digit sum of `n` is `n % 10` plus the digit sum of `n // 10`.', 'It fits in one line: `return 0 if n == 0 else n % 10 + solve(n // 10)`.'],
        },
        'starterCode': 'def solve(n):\n' + STARTER_TODO,
        'solution': code('''
            def solve(n):
                if n == 0:
                    return 0
                return n % 10 + solve(n // 10)
        '''),
        'inputs': [[0], [7], [1234], [99999], [1000000], [987654321]],
        'reject': [
            ('usa str y sum', 'def solve(n):\n    return sum(int(d) for d in str(n))'),
            ('iterativa (la de referencia)', None),
        ],
    },
    # ── 2 ─────────────────────────────────────────────────────────────────────
    {
        'id': 'sort_without_shortcuts',
        'kind': 'restricted',
        'functionName': 'solve',
        'timeLimitMs': 6000,
        'title': {'es': 'Ordena sin atajos', 'en': 'Sort without shortcuts'},
        'description': {
            'es': 'Devuelve una lista nueva con los números ordenados de menor a mayor **sin las herramientas de ordenación de Python**. Tendrás que implementar tú el algoritmo: inserción, selección, burbuja o el que prefieras.',
            'en': 'Return a new list with the numbers sorted from smallest to largest **without Python\'s sorting tools**. You will have to implement the algorithm yourself: insertion, selection, bubble or whichever you prefer.',
        },
        'instructions': {
            'es': '`solve(nums)` recibe una lista de enteros (puede tener repetidos y negativos) y devuelve una lista nueva ordenada. Hay un test con 400 números: un algoritmo cuadrático llega de sobra.',
            'en': '`solve(nums)` takes a list of integers (it may contain duplicates and negatives) and returns a new sorted list. One test has 400 numbers: a quadratic algorithm is more than enough.',
        },
        'rules': {
            'es': ['Sin `sorted()` ni `.sort()`.', 'Sin `min()` ni `max()`.', 'Sin `import`.'],
            'en': ['No `sorted()` or `.sort()`.', 'No `min()` or `max()`.', 'No `import`.'],
        },
        'constraints': {
            'forbiddenCalls': ['sorted', 'min', 'max'],
            'forbiddenMethods': ['sort'],
            'forbidImports': True,
        },
        'hints': {
            'es': ['Ordenación por inserción: recorre la lista y coloca cada número en su sitio dentro de una lista ya ordenada.', 'Para colocar `x`, avanza por la lista ordenada mientras sus elementos sean menores que `x` y usa `.insert(i, x)`.', 'No modifiques la lista original: empieza con `result = []` y ve insertando.'],
            'en': ['Insertion sort: walk through the list and put each number in its place inside an already sorted list.', 'To place `x`, move forward in the sorted list while its elements are smaller than `x`, then use `.insert(i, x)`.', 'Do not modify the original list: start with `result = []` and keep inserting.'],
        },
        'starterCode': 'def solve(nums):\n' + STARTER_TODO,
        'solution': code('''
            def solve(nums):
                result = []
                for x in nums:
                    i = 0
                    while i < len(result) and result[i] < x:
                        i += 1
                    result.insert(i, x)
                return result
        '''),
        'inputs': [
            [[5, 3, 8, 1]],
            [[]],
            [[2, 2, 1, 1]],
            [[-3, 10, 0, -7]],
            [[(i * 7919) % 401 - 200 for i in range(400)]],
        ],
        'reject': [
            ('sorted', 'def solve(nums):\n    return sorted(nums)'),
            ('alias de sorted', 'def solve(nums):\n    order = sorted\n    return order(nums)'),
            ('.sort()', 'def solve(nums):\n    result = list(nums)\n    result.sort()\n    return result'),
            ('heapq', 'import heapq\ndef solve(nums):\n    return heapq.nsmallest(len(nums), nums)'),
            ('selección con min', 'def solve(nums):\n    rest, out = list(nums), []\n    while rest:\n        m = min(rest)\n        rest.remove(m)\n        out.append(m)\n    return out'),
        ],
    },
    # ── 3 ─────────────────────────────────────────────────────────────────────
    {
        'id': 'fibonacci_iterative',
        'kind': 'transform',
        'functionName': 'solve',
        'timeLimitMs': 4000,
        'title': {'es': 'Fibonacci sin recursión', 'en': 'Fibonacci without recursion'},
        'description': {
            'es': 'Esta versión recursiva de Fibonacci es elegante pero lentísima: recalcula los mismos valores una y otra vez. Reescríbela de forma **iterativa**. Los tests llegan hasta `n = 78`, imposible a tiempo con la versión recursiva.',
            'en': 'This recursive Fibonacci is elegant but painfully slow: it recomputes the same values again and again. Rewrite it **iteratively**. The tests go up to `n = 78`, impossible in time with the recursive version.',
        },
        'referenceTitle': {'es': 'Versión recursiva', 'en': 'Recursive version'},
        'referenceCode': code('''
            def solve(n):
                if n < 2:
                    return n
                return solve(n - 1) + solve(n - 2)
        '''),
        'instructions': {
            'es': '`solve(n)` devuelve el n-ésimo número de Fibonacci, con `solve(0) = 0` y `solve(1) = 1`.',
            'en': '`solve(n)` returns the n-th Fibonacci number, with `solve(0) = 0` and `solve(1) = 1`.',
        },
        'rules': {
            'es': ['Ninguna función puede llamarse a sí misma.', 'Sin `import` (nada de `functools.cache`).'],
            'en': ['No function may call itself.', 'No `import` (no `functools.cache`).'],
        },
        'constraints': {'forbidRecursion': True, 'forbidImports': True},
        'hints': {
            'es': ['Solo necesitas recordar los dos últimos valores.', 'Empieza con `a, b = 0, 1` y repite `n` veces.', 'En cada paso: `a, b = b, a + b`. Al terminar, `a` es el resultado.'],
            'en': ['You only need to remember the last two values.', 'Start with `a, b = 0, 1` and repeat `n` times.', 'At each step: `a, b = b, a + b`. When you finish, `a` is the answer.'],
        },
        'starterCode': 'def solve(n):\n' + STARTER_TODO,
        'solution': code('''
            def solve(n):
                a, b = 0, 1
                for _ in range(n):
                    a, b = b, a + b
                return a
        '''),
        'inputs': [[0], [1], [2], [10], [30], [50], [78]],
        'reject': [
            ('recursiva (la de referencia)', None),
            ('recursiva con caché', 'from functools import lru_cache\n@lru_cache(None)\ndef solve(n):\n    return n if n < 2 else solve(n - 1) + solve(n - 2)'),
        ],
    },
    # ── 4 ─────────────────────────────────────────────────────────────────────
    {
        'id': 'pair_sum_linear',
        'kind': 'efficiency',
        'functionName': 'solve',
        'timeLimitMs': 3000,
        'title': {'es': 'Parejas que suman X, en tiempo lineal', 'en': 'Pairs that add up to X, in linear time'},
        'description': {
            'es': 'Cuenta cuántas parejas de posiciones `i < j` cumplen `nums[i] + nums[j] == target`. Lo difícil: uno de los tests tiene 20.000 números y hay límite de tiempo, así que comparar todas las parejas con dos bucles anidados **no llega a tiempo**.',
            'en': 'Count how many pairs of positions `i < j` satisfy `nums[i] + nums[j] == target`. The hard part: one test has 20,000 numbers and there is a time limit, so comparing every pair with two nested loops **will not finish in time**.',
        },
        'instructions': {
            'es': '`solve(nums, target)` devuelve el número de parejas. Las posiciones cuentan: en `[1, 1, 1]` con `target = 2` hay 3 parejas.',
            'en': '`solve(nums, target)` returns the number of pairs. Positions count: in `[1, 1, 1]` with `target = 2` there are 3 pairs.',
        },
        'rules': {
            'es': ['Límite de tiempo: 3 segundos para todos los tests.', 'Sin `import` (nada de `itertools` ni `collections`).'],
            'en': ['Time limit: 3 seconds for all the tests.', 'No `import` (no `itertools` or `collections`).'],
        },
        'constraints': {'forbidImports': True},
        'hints': {
            'es': ['Recorre la lista una sola vez llevando la cuenta de cuántas veces has visto cada número.', 'Para cada `x`, las parejas nuevas son las veces que ya has visto `target - x`.', 'Con un diccionario: suma `seen.get(target - x, 0)` al total y después haz `seen[x] = seen.get(x, 0) + 1`.'],
            'en': ['Walk through the list once, keeping count of how many times you have seen each number.', 'For each `x`, the new pairs are the times you have already seen `target - x`.', 'With a dictionary: add `seen.get(target - x, 0)` to the total, then do `seen[x] = seen.get(x, 0) + 1`.'],
        },
        'starterCode': 'def solve(nums, target):\n' + STARTER_TODO,
        'solution': code('''
            def solve(nums, target):
                seen = {}
                total = 0
                for x in nums:
                    total += seen.get(target - x, 0)
                    seen[x] = seen.get(x, 0) + 1
                return total
        '''),
        'inputs': [
            [[1, 5, 7, -1], 6],
            [[1, 1, 1], 2],
            [[], 5],
            [[3, 3, 3, 3], 6],
            [[(i * 37) % 1000 for i in range(20000)], 999],
        ],
        'reject': [
            ('dos bucles anidados (debe agotar el tiempo)', 'def solve(nums, target):\n    count = 0\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                count += 1\n    return count'),
            ('itertools', 'from itertools import combinations\ndef solve(nums, target):\n    return sum(1 for a, b in combinations(nums, 2) if a + b == target)'),
        ],
    },
    # ── 5 ─────────────────────────────────────────────────────────────────────
    {
        'id': 'flatten_recursive',
        'kind': 'transform',
        'functionName': 'solve',
        'timeLimitMs': 4000,
        'title': {'es': 'Aplana cualquier lista, recursivamente', 'en': 'Flatten any list, recursively'},
        'description': {
            'es': 'Esta función aplana listas anidadas a cualquier profundidad usando una pila explícita. Reescríbela con **recursión** en lugar de la pila: cuando encuentres una sublista, aplánala llamando a la propia función.',
            'en': 'This function flattens lists nested to any depth using an explicit stack. Rewrite it with **recursion** instead of the stack: when you find a sublist, flatten it by calling the function itself.',
        },
        'referenceTitle': {'es': 'Versión con pila', 'en': 'Stack version'},
        'referenceCode': code('''
            def solve(nested):
                result = []
                stack = [nested]
                while stack:
                    current = stack.pop()
                    if isinstance(current, list):
                        for item in reversed(current):
                            stack.append(item)
                    else:
                        result.append(current)
                return result
        '''),
        'instructions': {
            'es': '`solve(nested)` recibe una lista que puede contener números y otras listas (a cualquier profundidad) y devuelve una lista plana con todos los números en el mismo orden.',
            'en': '`solve(nested)` takes a list that may contain numbers and other lists (at any depth) and returns a flat list with all the numbers in the same order.',
        },
        'rules': {
            'es': ['La función debe llamarse a sí misma.', 'Sin `while`.', 'Sin `str()`, `repr()` ni `import`.'],
            'en': ['The function must call itself.', 'No `while`.', 'No `str()`, `repr()` or `import`.'],
        },
        'constraints': {
            'requireRecursion': True,
            'forbiddenSyntax': ['while'],
            'forbiddenCalls': ['str', 'repr'],
            'forbidImports': True,
        },
        'hints': {
            'es': ['Recorre los elementos con un `for`.', 'Si un elemento es una lista (`isinstance(item, list)`), añade el resultado de `solve(item)` con `.extend(...)`.', 'Si no es una lista, añádelo con `.append(item)`.'],
            'en': ['Loop over the elements with a `for`.', 'If an element is a list (`isinstance(item, list)`), add the result of `solve(item)` with `.extend(...)`.', 'If it is not a list, add it with `.append(item)`.'],
        },
        'starterCode': 'def solve(nested):\n' + STARTER_TODO,
        'solution': code('''
            def solve(nested):
                result = []
                for item in nested:
                    if isinstance(item, list):
                        result.extend(solve(item))
                    else:
                        result.append(item)
                return result
        '''),
        'inputs': [
            [[1, [2, 3], [4, [5]]]],
            [[]],
            [[[[[[[7]]]]]]],
            [[1, [], [2, []], 3]],
            [[[1, 2], [3, [4, [5, [6]]]], 7]],
        ],
        'reject': [
            ('con pila (la de referencia)', None),
            ('truco con texto', 'def solve(nested):\n    flat = str(nested).replace("[", "").replace("]", "")\n    return [int(x) for x in flat.split(",") if x.strip()]'),
        ],
    },
    # ── 6 ─────────────────────────────────────────────────────────────────────
    {
        'id': 'palindrome_two_pointers',
        'kind': 'restricted',
        'functionName': 'solve',
        'timeLimitMs': 4000,
        'title': {'es': '¿Palíndromo? Sin darle la vuelta', 'en': 'Palindrome? Without flipping it'},
        'description': {
            'es': 'Comprueba si una frase es un palíndromo ignorando mayúsculas, espacios y signos de puntuación. La trampa: **no puedes construir la cadena al revés**. Compara desde los dos extremos hacia el centro.',
            'en': 'Check whether a sentence is a palindrome, ignoring case, spaces and punctuation. The catch: **you cannot build the reversed string**. Compare from both ends towards the middle.',
        },
        'instructions': {
            'es': '`solve(text)` devuelve `True` si, teniendo en cuenta solo letras y números y sin distinguir mayúsculas, el texto se lee igual en los dos sentidos. Una cadena vacía es un palíndromo.',
            'en': '`solve(text)` returns `True` if, counting only letters and digits and ignoring case, the text reads the same both ways. An empty string is a palindrome.',
        },
        'rules': {
            'es': ['Sin `reversed()` ni `.reverse()`.', 'Sin cortes con paso negativo como `[::-1]`.', 'Sin `import`.'],
            'en': ['No `reversed()` or `.reverse()`.', 'No slices with a negative step such as `[::-1]`.', 'No `import`.'],
        },
        'constraints': {
            'forbiddenCalls': ['reversed'],
            'forbiddenMethods': ['reverse'],
            'forbiddenSyntax': ['negative_step_slice'],
            'forbidImports': True,
        },
        'hints': {
            'es': ['Usa dos índices: `i` empieza en `0` y `j` en el último carácter.', 'Salta los caracteres que no sean letras ni números con `.isalnum()`.', 'Compara `text[i].lower()` con `text[j].lower()` y acerca los índices hasta que se crucen.'],
            'en': ['Use two indices: `i` starts at `0` and `j` at the last character.', 'Skip characters that are not letters or digits with `.isalnum()`.', 'Compare `text[i].lower()` with `text[j].lower()` and move the indices closer until they cross.'],
        },
        'starterCode': 'def solve(text):\n' + STARTER_TODO,
        'solution': code('''
            def solve(text):
                i, j = 0, len(text) - 1
                while i < j:
                    if not text[i].isalnum():
                        i += 1
                    elif not text[j].isalnum():
                        j -= 1
                    elif text[i].lower() != text[j].lower():
                        return False
                    else:
                        i += 1
                        j -= 1
                return True
        '''),
        'inputs': [
            ['Anita lava la tina'],
            ['A man, a plan, a canal: Panama'],
            ['hola'],
            [''],
            ["No 'x' in Nixon"],
            ['12321'],
            ['123ab321'],
        ],
        'reject': [
            ('[::-1]', 'def solve(text):\n    clean = "".join(c.lower() for c in text if c.isalnum())\n    return clean == clean[::-1]'),
            ('reversed', 'def solve(text):\n    clean = [c.lower() for c in text if c.isalnum()]\n    return clean == list(reversed(clean))'),
        ],
    },
    # ── 7 ─────────────────────────────────────────────────────────────────────
    {
        'id': 'binary_search_iterative',
        'kind': 'transform',
        'functionName': 'solve',
        'timeLimitMs': 4000,
        'title': {'es': 'Búsqueda binaria sin recursión', 'en': 'Binary search without recursion'},
        'description': {
            'es': 'Esta búsqueda binaria recursiva funciona, pero va pasando los extremos de llamada en llamada. Reescríbela de forma **iterativa**, con un bucle que vaya acotando el intervalo.',
            'en': 'This recursive binary search works, but it passes the bounds from call to call. Rewrite it **iteratively**, with a loop that keeps narrowing the range.',
        },
        'referenceTitle': {'es': 'Versión recursiva', 'en': 'Recursive version'},
        'referenceCode': code('''
            def solve(nums, target):
                def search(lo, hi):
                    if lo > hi:
                        return -1
                    mid = (lo + hi) // 2
                    if nums[mid] == target:
                        return mid
                    if nums[mid] < target:
                        return search(mid + 1, hi)
                    return search(lo, mid - 1)
                return search(0, len(nums) - 1)
        '''),
        'instructions': {
            'es': '`solve(nums, target)` recibe una lista ordenada sin repetidos y devuelve la posición de `target`, o `-1` si no está.',
            'en': '`solve(nums, target)` takes a sorted list without duplicates and returns the position of `target`, or `-1` if it is not there.',
        },
        'rules': {
            'es': ['Ninguna función puede llamarse a sí misma.', 'Sin `for` ni comprensiones: un solo `while`.', 'Sin `.index()`, el operador `in` ni `import`.'],
            'en': ['No function may call itself.', 'No `for` or comprehensions: a single `while`.', 'No `.index()`, the `in` operator or `import`.'],
        },
        'constraints': {
            'forbidRecursion': True,
            'forbiddenMethods': ['index', 'count'],
            'forbiddenSyntax': ['for', 'comprehension', 'in_operator'],
            'forbidImports': True,
        },
        'hints': {
            'es': ['Guarda los extremos en dos variables: `lo = 0` y `hi = len(nums) - 1`.', 'Repite mientras `lo <= hi`: calcula `mid` y compara `nums[mid]` con `target`.', 'Si `nums[mid]` es menor que `target`, `lo = mid + 1`; si es mayor, `hi = mid - 1`.'],
            'en': ['Keep the bounds in two variables: `lo = 0` and `hi = len(nums) - 1`.', 'Repeat while `lo <= hi`: compute `mid` and compare `nums[mid]` with `target`.', 'If `nums[mid]` is smaller than `target`, `lo = mid + 1`; if it is larger, `hi = mid - 1`.'],
        },
        'starterCode': 'def solve(nums, target):\n' + STARTER_TODO,
        'solution': code('''
            def solve(nums, target):
                lo, hi = 0, len(nums) - 1
                while lo <= hi:
                    mid = (lo + hi) // 2
                    if nums[mid] == target:
                        return mid
                    if nums[mid] < target:
                        lo = mid + 1
                    else:
                        hi = mid - 1
                return -1
        '''),
        'inputs': [
            [[1, 3, 5, 7, 9, 11], 7],
            [[1, 3, 5, 7, 9, 11], 4],
            [[], 1],
            [[42], 42],
            [[2, 4, 6, 8], 2],
            [[2, 4, 6, 8], 8],
            [list(range(0, 2000, 2)), 1356],
        ],
        'reject': [
            ('recursiva (la de referencia)', None),
            ('index + in', 'def solve(nums, target):\n    return nums.index(target) if target in nums else -1'),
            ('recorrido con for', 'def solve(nums, target):\n    for i, x in enumerate(nums):\n        if x == target:\n            return i\n    return -1'),
        ],
    },
    # ── 8 ─────────────────────────────────────────────────────────────────────
    {
        'id': 'fast_power_recursive',
        'kind': 'transform',
        'functionName': 'solve',
        'timeLimitMs': 4000,
        'title': {'es': 'Potencia rápida, recursiva', 'en': 'Fast power, recursively'},
        'description': {
            'es': 'Calcula `base^exp mod m` sin `pow` ni `**`. La versión de abajo multiplica `exp` veces: con exponentes de 15 cifras no terminaría nunca. Escribe una versión **recursiva** que parta el exponente por la mitad en cada llamada (exponenciación rápida).',
            'en': 'Compute `base^exp mod m` without `pow` or `**`. The version below multiplies `exp` times: with 15-digit exponents it would never finish. Write a **recursive** version that halves the exponent at every call (fast exponentiation).',
        },
        'referenceTitle': {'es': 'Versión lenta', 'en': 'Slow version'},
        'referenceCode': code('''
            def solve(base, exp, mod):
                result = 1
                for _ in range(exp):
                    result = result * base % mod
                return result
        '''),
        'instructions': {
            'es': '`solve(base, exp, mod)` devuelve `(base ** exp) % mod`. `exp` puede ser enorme (hasta 10^15), así que necesitas un número de pasos proporcional a las cifras de `exp`, no a su valor.',
            'en': '`solve(base, exp, mod)` returns `(base ** exp) % mod`. `exp` can be huge (up to 10^15), so you need a number of steps proportional to the digits of `exp`, not to its value.',
        },
        'rules': {
            'es': ['La función debe llamarse a sí misma.', 'Sin bucles ni comprensiones.', 'Sin `pow()` ni el operador `**`.', 'Sin `import`.'],
            'en': ['The function must call itself.', 'No loops or comprehensions.', 'No `pow()` or the `**` operator.', 'No `import`.'],
        },
        'constraints': {
            'requireRecursion': True,
            'forbiddenSyntax': ['for', 'while', 'comprehension', 'pow_operator'],
            'forbiddenCalls': ['pow'],
            'forbidImports': True,
        },
        'hints': {
            'es': ['Si `exp` es par, `base^exp = (base^(exp/2))²`.', 'Si `exp` es impar, multiplica una vez más por `base`.', 'Calcula `half = solve(base, exp // 2, mod)` **una sola vez** y devuelve `half * half % mod` (por `base` si `exp` es impar). Ojo con el caso `exp == 0`: devuelve `1 % mod`.'],
            'en': ['If `exp` is even, `base^exp = (base^(exp/2))²`.', 'If `exp` is odd, multiply by `base` once more.', 'Compute `half = solve(base, exp // 2, mod)` **only once** and return `half * half % mod` (times `base` if `exp` is odd). Careful with `exp == 0`: return `1 % mod`.'],
        },
        'starterCode': 'def solve(base, exp, mod):\n' + STARTER_TODO,
        'solution': code('''
            def solve(base, exp, mod):
                if exp == 0:
                    return 1 % mod
                half = solve(base, exp // 2, mod)
                result = half * half % mod
                if exp % 2 == 1:
                    result = result * base % mod
                return result
        '''),
        'inputs': [
            [2, 10, 1000],
            [3, 0, 7],
            [5, 3, 1],
            [7, 13, 11],
            [123456789, 10 ** 15, 1000000007],
            [2, 999999999999999, 998244353],
        ],
        'reject': [
            ('lenta con bucle (la de referencia)', None),
            ('pow', 'def solve(base, exp, mod):\n    return pow(base, exp, mod)'),
            ('operador **', 'def solve(base, exp, mod):\n    return base ** exp % mod'),
            ('recursiva pero lineal (agota la recursión)', 'def solve(base, exp, mod):\n    if exp == 0:\n        return 1 % mod\n    return base * solve(base, exp - 1, mod) % mod'),
        ],
    },
]

REQUIRED_LANGS = ('es', 'en')


def run(challenge, user_code, tests):
    """Ejecuta en un proceso aparte para poder cortar por tiempo, como hace la web."""
    script = (
        'import sys, json; sys.path.insert(0, sys.argv[1]); import harness;'
        'd = json.loads(sys.stdin.read());'
        'print(harness.run_challenge(d["code"], d["fn"], json.dumps(d["tests"]), json.dumps(d["constraints"])))'
    )
    payload = json.dumps({'code': user_code, 'fn': challenge['functionName'], 'tests': tests, 'constraints': challenge['constraints']})
    try:
        out = subprocess.run(
            [sys.executable, '-c', script, str(ROOT / 'src' / 'workers' / 'python')],
            input=payload, capture_output=True, text=True, encoding='utf-8',
            timeout=challenge['timeLimitMs'] / 1000,
        )
    except subprocess.TimeoutExpired:
        return {'timeout': True}
    if out.returncode != 0:
        raise RuntimeError(out.stderr)
    return json.loads(out.stdout)


def check_safe_numbers(value, path):
    if isinstance(value, bool):
        return
    if isinstance(value, int) and abs(value) > MAX_SAFE_INTEGER:
        raise ValueError(f'{path}: {value} supera el entero seguro de JavaScript (2^53 - 1)')
    if isinstance(value, list):
        for i, item in enumerate(value):
            check_safe_numbers(item, f'{path}[{i}]')


def build():
    problems = []
    output = []

    for number, ch in enumerate(CHALLENGES, start=1):
        label = f'#{number} {ch["id"]}'
        for field in ('title', 'description', 'instructions', 'rules', 'hints'):
            for lang in REQUIRED_LANGS:
                if not ch[field].get(lang):
                    problems.append(f'{label}: falta {field}.{lang}')
        if len(ch['hints']['es']) != len(ch['hints']['en']):
            problems.append(f'{label}: distinto número de pistas en es/en')

        # Resultados esperados calculados con la solución de referencia
        namespace = {}
        exec(ch['solution'], namespace)
        reference_fn = namespace[ch['functionName']]
        tests = []
        for args in ch['inputs']:
            expected = reference_fn(*json.loads(json.dumps(args)))
            tests.append({'input': args, 'expected': expected})
        try:
            for i, test in enumerate(tests):
                check_safe_numbers(test['input'], f'{label} test {i + 1} input')
                check_safe_numbers(test['expected'], f'{label} test {i + 1} expected')
        except ValueError as error:
            problems.append(str(error))

        # 1) la solución pasa todo y cumple las restricciones
        result = run(ch, ch['solution'], tests)
        if result.get('timeout') or not result['success']:
            problems.append(f'{label}: la solución no pasa ({result})')
        else:
            print(f'  ok  {label}: solución pasa {result["passedCount"]}/{result["totalTests"]} en {result["durationMs"]} ms')

        # 2) el código inicial no pasa
        result = run(ch, ch['starterCode'], tests)
        if not result.get('timeout') and result['success']:
            problems.append(f'{label}: el código inicial pasa (no debería)')

        # 3) cada trampa se rechaza
        for name, cheat in ch['reject']:
            cheat_code = cheat if cheat is not None else ch['referenceCode']
            result = run(ch, cheat_code, tests)
            if result.get('timeout'):
                reason = 'tiempo agotado'
            elif not result['success']:
                reasons = [f'{v["code"]}:{v["detail"]}' for v in result['violations']] or result['errorCodes']
                reason = ', '.join(reasons)
            else:
                problems.append(f'{label}: la trampa «{name}» se acepta')
                continue
            print(f'      rechaza «{name}» → {reason}')

        entry = {key: ch[key] for key in ('id', 'kind', 'functionName', 'timeLimitMs', 'title', 'description', 'instructions', 'rules', 'constraints', 'hints', 'starterCode', 'solution')}
        entry['language'] = 'python'
        if ch.get('referenceCode'):
            entry['referenceTitle'] = ch['referenceTitle']
            entry['referenceCode'] = ch['referenceCode']
        entry['tests'] = tests
        output.append(entry)

    if problems:
        print('\nNO se ha escrito el JSON. Problemas:')
        for problem in problems:
            print('  -', problem)
        sys.exit(1)

    # Archivo generado: compacto (la fuente legible es este script)
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'\nEscrito {OUTPUT.relative_to(ROOT)} con {len(output)} desafíos.')


if __name__ == '__main__':
    build()
