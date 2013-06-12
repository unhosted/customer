exports.config = {
  db: {
    host: 'localhost',
    user: 'root',
    password: 'something',
    database: 'customer'
  },
  memcache: {
    port: 11211,
    host: 'localhost'
  },
  sendgrid: {
    user: 'yoursendgriduser',
    password: 'yoursendgridpassword'
  },
  captchaSolutionSalt: 'salt n peppa',
  serverRoot: ['https://storage.example.com/'],
  deploy: '/usr/bin/deploy.sh'
};
