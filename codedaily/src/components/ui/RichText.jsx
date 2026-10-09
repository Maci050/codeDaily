// Muestra el formato mínimo que usan los textos de los retos:
// `código` en la fuente de código y **negrita**. Lo que va dentro de `...`
// se muestra literal (por ejemplo `a ** b` sigue siendo el operador potencia).
function renderBold(segment, keyPrefix) {
  return segment.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-b${i}`}>{part}</strong> : part
  );
}

function RichText({ text }) {
  if (!text) return null;
  return text.split('`').map((segment, i) =>
    i % 2 === 1
      ? <code key={`c${i}`} className="inline-code">{segment}</code>
      : renderBold(segment, `t${i}`)
  );
}

export default RichText;
