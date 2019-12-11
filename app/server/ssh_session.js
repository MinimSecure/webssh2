var SSH = require('ssh2').Client
var debug = require('debug')

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class SshSession {
  constructor(ssh_config, creds) {
    this.token = uuidv4();
    this.banner = "";
    this.ssh_config = ssh_config;
    this.creds = creds;

    this.stream;
    this.termCols;
    this.termRows;

    let ssh_conn = new SSH()

    ssh_conn.on('banner', this.setBanner.bind(this));
    ssh_conn.on('end', this.onError.bind(this));
    ssh_conn.on('close', this.onError.bind(this));
    ssh_conn.on('error', this.onError.bind(this));
    ssh_conn.on('keyboard-interactive', this.onError.bind(this));

    this.ssh_conn = ssh_conn;
  }

  setBanner(data) {
    // need to convert to cr/lf for proper formatting
    this.banner = data.replace(/\r?\n/g, '\r\n').toString('utf-8');
    console.log(this.banner);
    this.streamToSocket(this.banner);
  }

  streamToSocket() {
    if(!this.client_socket) return;
    this.client_socket.emit('data', data.toString('utf-8'))
  }

  onError(err) {
    console.log(err);
  }

  connect() {
    console.log('Connecting to host...');
    this.ssh_conn.on('ready', () => {
      console.log('connection ready!');
      this.ssh_conn.shell({
        term: this.ssh_conn.term,
        cols: 80,
        rows: 100
      }, function connShell (err, stream) {

        console.log(err);
        stream.on('data', function streamOnData (data) { console.log(data.toString('utf-8')) });
      });
    });

    this.ssh_conn.connect({
      host: this.ssh_config.host,
      port: this.ssh_config.port,
      localAddress: this.ssh_config.localAddress,
      localPort: this.ssh_config.localport,
      username: this.creds.username,
      password: this.creds.userpassword,
      privateKey: this.creds.privatekey,
      tryKeyboard: true,
      algorithms: this.ssh_config.algorithms,
      readyTimeout: this.ssh_config.readyTimeout,
      keepaliveInterval: this.ssh_config.keepaliveInterval,
      keepaliveCountMax: this.ssh_config.keepaliveCountMax,
      debug: debug('ssh2')
    });
  }
}

module.exports = SshSession;
