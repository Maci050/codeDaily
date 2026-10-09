import Window from '../ui/Window';
import PixelIcon from '../ui/PixelIcon';
import RichText from '../ui/RichText';

const TEXT = {
  es: {
    title: 'Cómo se resuelve',
    steps: 'Paso a paso',
    solution: 'La solución',
    tests: 'Qué devuelve con cada test',
    input: 'Entrada',
    expected: 'Resultado esperado',
    yours: 'Tu código',
    notChecked: 'sin comprobar',
    error: 'error',
    compare: 'Tu código y la solución',
    changed: 'Líneas de la solución que no estaban en tu código',
  },
  en: {
    title: 'How it is solved',
    steps: 'Step by step',
    solution: 'The solution',
    tests: 'What it returns for each test',
    input: 'Input',
    expected: 'Expected',
    yours: 'Your code',
    notChecked: 'not checked',
    error: 'error',
    compare: 'Your code and the solution',
    changed: 'Solution lines that were not in your code',
  },
};

// Escribe un valor como se vería en el lenguaje del reto (True/None en Python)
function formatValue(value, isPython) {
  if (value === null || value === undefined) return isPython ? 'None' : 'null';
  if (typeof value === 'boolean') return isPython ? (value ? 'True' : 'False') : String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => formatValue(item, isPython)).join(', ')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}: ${formatValue(item, isPython)}`).join(', ')}}`;
  }
  return String(value);
}

function CodeLines({ code, markLines = null }) {
  return (
    <pre className="code-block code-lines">
      <code>
        {code.split('\n').map((line, i) => (
          <span key={i} className={`code-line ${markLines?.has(i) ? 'is-new' : ''}`}>
            {line || ' '}
          </span>
        ))}
      </code>
    </pre>
  );
}

// Explicación al rendirse, hecha solo con datos del reto: pistas, solución, tests y tu código.
function SolutionWalkthrough({ challenge, hints, userCode, testResults, language }) {
  const text = TEXT[language] || TEXT.es;
  const isPython = challenge.language === 'python';
  const solution = challenge.solution || '';

  // Líneas de la solución que no aparecen (ignorando sangría) en el código del jugador
  const userLines = new Set((userCode || '').split('\n').map((line) => line.trim()).filter(Boolean));
  const newLines = new Set(
    solution.split('\n').flatMap((line, i) => (line.trim() && !userLines.has(line.trim()) ? [i] : []))
  );

  const resultByIndex = new Map((testResults || []).map((result) => [result.index, result]));

  return (
    <Window className="walkthrough" title={text.title} icon="bulb" style={{ '--zoom-delay': '0.1s' }}>
      <div className="walkthrough-body">
        {hints.length > 0 && (
          <section className="section-block">
            <h3>{text.steps}</h3>
            <ol className="hint-list">
              {hints.map((hint, i) => (
                <li key={`${i}-${hint}`}>
                  <span className="hint-num">{i + 1}</span>
                  <span><RichText text={hint} /></span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {solution && (
          <section className="section-block">
            <h3>{text.solution}</h3>
            <CodeLines code={solution} />
          </section>
        )}

        <section className="section-block">
          <h3>{text.tests}</h3>
          <div className="test-table-wrap">
            <table className="test-table">
              <thead>
                <tr>
                  <th scope="col">{text.input}</th>
                  <th scope="col">{text.expected}</th>
                  <th scope="col">{text.yours}</th>
                </tr>
              </thead>
              <tbody>
                {challenge.tests.map((test, index) => {
                  const result = resultByIndex.get(index);
                  return (
                    <tr key={index}>
                      <td><code>{`${challenge.functionName}(${test.input.map((value) => formatValue(value, isPython)).join(', ')})`}</code></td>
                      <td><code>{formatValue(test.expected, isPython)}</code></td>
                      <td>
                        {result ? (
                          <span className={`test-outcome ${result.passed ? 'passed' : 'failed'}`}>
                            <PixelIcon name={result.passed ? 'check' : 'cross'} size={16} />
                            <code>{result.actual !== undefined ? formatValue(result.actual, isPython) : text.error}</code>
                          </span>
                        ) : (
                          <span className="test-outcome muted">{text.notChecked}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {solution && userCode && (
          <section className="section-block">
            <h3>{text.compare}</h3>
            <div className="compare-grid">
              <div>
                <p className="compare-label">{text.yours}</p>
                <CodeLines code={userCode} />
              </div>
              <div>
                <p className="compare-label">{text.solution}</p>
                <CodeLines code={solution} markLines={newLines} />
              </div>
            </div>
            {newLines.size > 0 && (
              <p className="compare-legend">
                <span className="compare-swatch" aria-hidden="true" />
                {text.changed}
              </p>
            )}
          </section>
        )}
      </div>
    </Window>
  );
}

export default SolutionWalkthrough;
