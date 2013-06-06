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
  }
  captchaSolutionSalt: 'salt n peppa',
  serverRoot: ['https://storage.example.com/']
};
