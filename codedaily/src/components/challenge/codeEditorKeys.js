// Teclado del editor de código: Tab indenta (4 espacios, también con selección),
// Shift+Tab desindenta y Retroceso borra una sangría completa.
export function handleCodeEditorKeyDown(event, code, setCode) {
  const textarea = event.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const TAB = '    ';

  if (event.key === 'Tab') {
    event.preventDefault();

    const hasSelection = start !== end;

    if (event.shiftKey) {
      // Shift+Tab: desindenta las líneas seleccionadas (o la línea actual)
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = end;
      const selectedLines = code.substring(lineStart, lineEnd);

      const dedented = selectedLines
        .split('\n')
        .map((line) => (line.startsWith(TAB) ? line.slice(TAB.length) : line.replace(/^ {1,3}/, '')))
        .join('\n');

      const removed = selectedLines.length - dedented.length;
      const newValue = code.substring(0, lineStart) + dedented + code.substring(lineEnd);
      setCode(newValue);

      setTimeout(() => {
        textarea.selectionStart = Math.max(lineStart, start - (hasSelection ? 0 : Math.min(removed, TAB.length)));
        textarea.selectionEnd = end - removed;
      }, 0);

    } else if (hasSelection) {
      // Tab con selección: indenta todas las líneas seleccionadas
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = end;
      const selectedLines = code.substring(lineStart, lineEnd);

      const indented = selectedLines.split('\n').map((line) => TAB + line).join('\n');
      const added = indented.length - selectedLines.length;
      const newValue = code.substring(0, lineStart) + indented + code.substring(lineEnd);
      setCode(newValue);

      setTimeout(() => {
        textarea.selectionStart = start + TAB.length;
        textarea.selectionEnd = end + added;
      }, 0);

    } else {
      // Tab sin selección: inserta 4 espacios en el cursor
      const newValue = code.substring(0, start) + TAB + code.substring(end);
      setCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + TAB.length;
      }, 0);
    }

  } else if (event.key === 'Backspace' && start === end) {
    // Backspace inteligente: borra un TAB completo si el cursor está precedido de espacios
    const lineStart = code.lastIndexOf('\n', start - 1) + 1;
    const textBeforeCursor = code.substring(lineStart, start);
    const trailingSpaces = textBeforeCursor.match(/( +)$/)?.[1] ?? '';

    if (trailingSpaces.length > 0) {
      event.preventDefault();
      const toRemove = ((trailingSpaces.length - 1) % TAB.length) + 1;
      const newValue = code.substring(0, start - toRemove) + code.substring(start);
      setCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start - toRemove;
      }, 0);
    }
  }
}
