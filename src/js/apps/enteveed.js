const FlowEnteveed = {
  appId: 'enteveed',

  init() {
    // Nothing to initialize for now
  },

  open() {
    if (FlowWindows.exists(this.appId)) {
      FlowWindows.bringToFront(this.appId);
      return;
    }

    const template = document.getElementById('enteveed-app-template');
    const content = template.content.cloneNode(true);

    FlowWindows.create(this.appId, 'Enteveed', content, {
      width: 1000,
      height: 600
    });
  }
};
