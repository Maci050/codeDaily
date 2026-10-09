// Compartir resultados: en móvil abre el menú nativo (WhatsApp, Telegram...);
// en escritorio copia al portapapeles, que es lo que se espera allí.

export const SITE_ORIGIN = 'https://codedaily-nu.vercel.app';

function shouldUseNativeShare() {
  return typeof navigator !== 'undefined'
    && typeof navigator.share === 'function'
    && window.matchMedia?.('(pointer: coarse)').matches;
}

async function copyToClipboard(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Alternativa para navegadores o contextos sin la API asíncrona del portapapeles
    const helper = document.createElement('textarea');
    helper.value = value;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(helper);
    return ok;
  }
}

// Devuelve 'shared', 'copied', 'failed' o null si el jugador cerró el menú sin compartir
export async function shareText(text) {
  if (shouldUseNativeShare()) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return null;
    }
  }
  return (await copyToClipboard(text)) ? 'copied' : 'failed';
}
