var validator = require('validator')

module.exports = (app_config, opts) => {
  let ssh_session_config = {
    host: (validator.isIP(opts.host + '') && opts.host) ||
      (validator.isFQDN(opts.host) && opts.host) ||
      (/^(([a-z]|[A-Z]|[0-9]|[!^(){}\-_~])+)?\w$/.test(opts.host) &&
      opts.host) || app_config.ssh.host,
    port: (validator.isInt(opts.port + '', { min: 1, max: 65535 }) &&
      opts.port) || app_config.ssh.port,
    localAddress: app_config.ssh.localAddress,
    localPort: app_config.ssh.localPort,
    header: {
      name: opts.header || app_config.header.text,
      background: opts.headerBackground || app_config.header.background
    },
    algorithms: app_config.algorithms,
    keepaliveInterval: app_config.ssh.keepaliveInterval,
    keepaliveCountMax: app_config.ssh.keepaliveCountMax,
    allowedSubnets: app_config.ssh.allowedSubnets,
    term: (/^(([a-z]|[A-Z]|[0-9]|[!^(){}\-_~])+)?\w$/.test(opts.sshterm) &&
      opts.sshterm) || app_config.ssh.term,
    terminal: {
      cursorBlink: (validator.isBoolean(opts.cursorBlink + '') ? myutil.parseBool(opts.cursorBlink) : app_config.terminal.cursorBlink),
      scrollback: (validator.isInt(opts.scrollback + '', { min: 1, max: 200000 }) && opts.scrollback) ? opts.scrollback : app_config.terminal.scrollback,
      tabStopWidth: (validator.isInt(opts.tabStopWidth + '', { min: 1, max: 100 }) && opts.tabStopWidth) ? opts.tabStopWidth : app_config.terminal.tabStopWidth,
      bellStyle: ((opts.bellStyle) && (['sound', 'none'].indexOf(opts.bellStyle) > -1)) ? opts.bellStyle : app_config.terminal.bellStyle
    },
    allowreplay: app_config.options.challengeButton || (validator.isBoolean(opts.allowreplay + '') ? myutil.parseBool(opts.allowreplay) : false),
    allowreauth: app_config.options.allowreauth || false,
    mrhsession: ((validator.isAlphanumeric(opts.mrhsession + '') && opts.mrhsession) ? opts.mrhsession : 'none'),
    serverlog: {
      client: app_config.serverlog.client || false,
      server: app_config.serverlog.server || false
    },
    readyTimeout: (validator.isInt(opts.readyTimeout + '', { min: 1, max: 300000 }) &&
      opts.readyTimeout) || app_config.ssh.readyTimeout
  }
  if (ssh_session_config.header.name) validator.escape(ssh_session_config.header.name)
  if (ssh_session_config.header.background) validator.escape(ssh_session_config.header.background)

  return ssh_session_config;
};
