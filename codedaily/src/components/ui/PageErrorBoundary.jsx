import { Component } from 'react';
import Window from './Window';
import PixelIcon from './PixelIcon';

// Si una página cargada bajo demanda no llega (sin conexión, o un despliegue nuevo
// dejó obsoleta la pestaña abierta), muestra un aviso en lugar de dejar la app en blanco.
class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    const es = this.props.language === 'es';
    return (
      <Window title={es ? 'Error' : 'Error'} icon="alert">
        <div className="alert-layout">
          <PixelIcon name="alert" size={40} />
          <div>
            <h3>{es ? 'No se pudo cargar esta página' : 'This page could not be loaded'}</h3>
            <p>
              {es
                ? 'Comprueba tu conexión. Si acabamos de publicar una versión nueva, recargar lo arregla.'
                : 'Check your connection. If a new version was just published, reloading fixes it.'}
            </p>
            <div className="dialog-actions">
              <button className="primary-button" onClick={() => window.location.reload()}>
                {es ? 'Recargar' : 'Reload'}
              </button>
            </div>
          </div>
        </div>
      </Window>
    );
  }
}

export default PageErrorBoundary;
