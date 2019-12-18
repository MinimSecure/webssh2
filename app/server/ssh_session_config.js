var validator = require('validator')
const myutil = require('./util')

module.exports = (appConfig, opts) => {
  const sshSessionConfig = {
    host: (validator.isIP(opts.host + '') && opts.host) ||
      (validator.isFQDN(opts.host) && opts.host) ||
      (/^(([a-z]|[A-Z]|[0-9]|[!^(){}\-_~])+)?\w$/.test(opts.host) &&
      opts.host) || appConfig.ssh.host,
    port: (validator.isInt(opts.port + '', { min: 1, max: 65535 }) &&
      opts.port) || appConfig.ssh.port,
    localAddress: appConfig.ssh.localAddress,
    localPort: appConfig.ssh.localPort,
    header: {
      name: opts.header || appConfig.header.text,
      background: opts.headerBackground || appConfig.header.background
    },
    algorithms: appConfig.algorithms,
    keepaliveInterval: appConfig.ssh.keepaliveInterval,
    keepaliveCountMax: appConfig.ssh.keepaliveCountMax,
    allowedSubnets: appConfig.ssh.allowedSubnets,
    term: (/^(([a-z]|[A-Z]|[0-9]|[!^(){}\-_~])+)?\w$/.test(opts.sshterm) &&
      opts.sshterm) || appConfig.ssh.term,
    terminal: {
      cursorBlink: (validator.isBoolean(opts.cursorBlink + '') ? myutil.parseBool(opts.cursorBlink) : appConfig.terminal.cursorBlink),
      scrollback: (validator.isInt(opts.scrollback + '', { min: 1, max: 200000 }) && opts.scrollback) ? opts.scrollback : appConfig.terminal.scrollback,
      tabStopWidth: (validator.isInt(opts.tabStopWidth + '', { min: 1, max: 100 }) && opts.tabStopWidth) ? opts.tabStopWidth : appConfig.terminal.tabStopWidth,
      bellStyle: ((opts.bellStyle) && (['sound', 'none'].indexOf(opts.bellStyle) > -1)) ? opts.bellStyle : appConfig.terminal.bellStyle
    },
    allowreplay: appConfig.options.challengeButton || (validator.isBoolean(opts.allowreplay + '') ? myutil.parseBool(opts.allowreplay) : false),
    allowreauth: appConfig.options.allowreauth || false,
    mrhsession: ((validator.isAlphanumeric(opts.mrhsession + '') && opts.mrhsession) ? opts.mrhsession : 'none'),
    serverlog: {
      client: appConfig.serverlog.client || false,
      server: appConfig.serverlog.server || false
    },
    readyTimeout: (validator.isInt(opts.readyTimeout + '', { min: 1, max: 300000 }) &&
      opts.readyTimeout) || appConfig.ssh.readyTimeout
  }
  if (sshSessionConfig.header.name) validator.escape(sshSessionConfig.header.name)
  if (sshSessionConfig.header.background) validator.escape(sshSessionConfig.header.background)

  return sshSessionConfig
}
