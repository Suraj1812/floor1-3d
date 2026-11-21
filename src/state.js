(() => {
  const key = 'floor1-room-preferences-v1';
  let initial = null;
  try { initial = JSON.parse(localStorage.getItem(key) || 'null'); } catch { /* Storage is optional. */ }
  window.roomState = {
    widgetState: initial,
    setWidgetState(snapshot) {
      this.widgetState = snapshot;
      try { localStorage.setItem(key, JSON.stringify(snapshot)); } catch { /* Keep in-memory preferences. */ }
      return Promise.resolve();
    }
  };
  window.addEventListener('storage', (event) => {
    if (event.key !== key) return;
    try {
      const widgetState = JSON.parse(event.newValue || 'null');
      window.roomState.widgetState = widgetState;
      window.dispatchEvent(new CustomEvent('floor1:state', { detail: { globals: { widgetState } } }));
    } catch { /* Ignore incompatible storage from another tab. */ }
  });
})();
