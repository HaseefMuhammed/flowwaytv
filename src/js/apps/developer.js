const FlowDeveloper = {
  appId: 'developer',

  init() {
    // Nothing to initialize for now
  },

  open() {
    if (FlowWindows.exists(this.appId)) {
      FlowWindows.bringToFront(this.appId);
      return;
    }

    const template = document.getElementById('developer-app-template');
    const content = template.content.cloneNode(true);

    FlowWindows.create(this.appId, 'Developer', content, {
      width: 1000,
      height: 600
    });
  }
};
