const {remote} = require('electron');
const isElevated = require('is-elevated');
const {createAnimator} = require('./lib/animator');
const {getBorderColors} = require('./lib/colorhelpers');

let unloadAnimator = null;

module.exports.onRendererWindow = async window => {
  const browserWindow = remote.getCurrentWindow();

  browserWindow.on('blur', () => window.document.documentElement.classList.add('blurred'));
  browserWindow.on('focus', () => window.document.documentElement.classList.remove('blurred'));

  if (!browserWindow.isFocused()) {
    window.document.documentElement.classList.add('blurred');
  }

  if (await isElevated()) {
    window.document.documentElement.classList.add('elevated');
  }

  const config = window.config.getConfig();

  if (config.hyperBorder && config.hyperBorder.animate) {
    unloadAnimator = createAnimator(window, browserWindow);
  }
};

module.exports.onUnload = async () => {
  if (unloadAnimator) {
    unloadAnimator();
  }
};

module.exports.decorateConfig = config => {
  const defaultColors = ['#fc1da7', '#fba506'];

  const configObj = Object.assign({
    animate: false,
    coverBackgroundColor: 'rgba(0, 0, 0, .8)',
    headerMarginTop: '38px',
    borderWidth: '4px',
    borderColors: defaultColors,
    adminBorderColors: (config.hyperBorder && config.hyperBorder.borderColors) || defaultColors,
    blurredAdminColors: (config.hyperBorder && (config.hyperBorder.blurredColors || config.hyperBorder.adminBorderColors)) || defaultColors,
    blurredColors: defaultColors,
    borderAngle: '180deg'
  }, config.hyperBorder);

  return Object.assign({}, config, {
    css: `
      ${config.css || ''}
      .hyper_main {
        background: linear-gradient(${configObj.animate ? '269deg' : configObj.borderAngle}, ${getBorderColors(configObj.borderColors).join(',')});
        border-width: 0px;
      }
      html.elevated .hyper_main {
        background: linear-gradient(${configObj.animate ? '269deg' : configObj.borderAngle}, ${getBorderColors(configObj.adminBorderColors).join(',')});
      }
      html.blurred .hyper_main {
        background: linear-gradient(${configObj.animate ? '269deg' : configObj.borderAngle}, ${getBorderColors(configObj.blurredColors).join(',')});
      }
      html.blurred.elevated .hyper_main{
        background: linear-gradient(${configObj.animate ? '269deg' : configObj.borderAngle}, ${getBorderColors(configObj.blurredAdminColors).join(',')});
      }
      .hyper_main .header_header {
        background: ${configObj.coverBackgroundColor};
        border-radius: ${configObj.borderWidth} ${configObj.borderWidth} 0 0;
        top: ${configObj.borderWidth};
        left: ${configObj.borderWidth};
        right: ${configObj.borderWidth};
      }
      .hyper_main .tabs_list {
        border-bottom-color: ${config.borderColor};
        border-top-left-radius: ${configObj.borderWidth};
        border-top-right-radius: ${configObj.borderWidth};
      }
      .hyper_main .tab_tab:last-child {
        border-top-right-radius: ${configObj.borderWidth};
      }
      .hyper_main .terms_terms {
        background: ${configObj.coverBackgroundColor};
        border-radius: 0 0 ${configObj.borderWidth} ${configObj.borderWidth};
        bottom: ${configObj.borderWidth};
        left: ${configObj.borderWidth};
        right: ${configObj.borderWidth};
        margin-top: ${configObj.headerMarginTop};
        margin-bottom: 0;
      }
      .hyper_main .footer_footer {
        border-radius: 0 0 ${configObj.borderWidth} ${configObj.borderWidth};
        bottom: ${configObj.borderWidth};
        left: ${configObj.borderWidth};
        right: ${configObj.borderWidth};
      }
      .header_windowHeaderWithBorder {
        left: ${configObj.borderWidth};
        width: calc(100% - ${configObj.borderWidth} - ${configObj.borderWidth});
      }
    `
  });
};
