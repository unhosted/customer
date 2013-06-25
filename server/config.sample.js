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
  deploy: {
    domain: '/home/customer-backend/add_subdomain.sh',
    zone: '/home/customer-backend/deploy_zone.sh'
  }
};
