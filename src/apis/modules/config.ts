import ajax from '../ajax'

function getServiceOverview(): ConfigServiceAPITypes.getServiceOverview {
  return ajax.get('/config/service/overview')
}

function getServiceConfig(): ConfigServiceAPITypes.getServiceConfig {
  return ajax.get('/config/service/config')
}

function updateCfg(data: ConfigServiceAPITypes.ServiceConfigItem) {
  return ajax.put('/config/service/config', data)
}

function initializeMysql(data: ConfigServiceAPITypes.InitializeMysqlPayload) {
  return ajax.post('/config/init/mysql', data)
}

function testMysqlConnection(data: ConfigServiceAPITypes.InitializeMysqlPayload) {
  return ajax.post('/config/init/mysql/test', data)
}

function configureRedis(data: ConfigServiceAPITypes.RedisConfigPayload) {
  return ajax.post('/config/init/redis', data)
}

function testRedisConnection(data: ConfigServiceAPITypes.RedisConfigPayload) {
  return ajax.post('/config/init/redis/test', data)
}

function configureMongo(data: ConfigServiceAPITypes.MongoConfigPayload) {
  return ajax.post('/config/init/mongo', data)
}

function testMongoConnection(data: ConfigServiceAPITypes.MongoConfigPayload) {
  return ajax.post('/config/init/mongo/test', data)
}

function configureMail(data: ConfigServiceAPITypes.MailConfigPayload) {
  return ajax.post('/config/init/mail', data)
}

function configureAdmin(data: {
  username: string
  email: string
  password: string
}) {
  return ajax.post('/config/init/admin', data)
}

function sendTestMail(data: ConfigServiceAPITypes.MailTestPayload) {
  return ajax.post('/config/init/mail/test', data)
}

function sendLiveTestMail(data: ConfigServiceAPITypes.MailLiveTestPayload) {
  return ajax.post('/config/init/mail/test/live', data)
}

function sendAdminVerification(data: ConfigServiceAPITypes.AdminVerificationPayload) {
  return ajax.post('/config/init/admin/verification', data)
}

function finishInitialization(data: {
  email: string
  mysql: {
    host: string
    port: string
    database: string
  }
  admin: {
    username: string
    email: string
  }
}) {
  return ajax.post('/config/init/finish', data)
}

export default {
  getServiceOverview,
  getServiceConfig,
  updateCfg,
  initializeMysql,
  testMysqlConnection,
  configureRedis,
  testRedisConnection,
  configureMongo,
  testMongoConnection,
  configureMail,
  configureAdmin,
  sendTestMail,
  sendLiveTestMail,
  sendAdminVerification,
  finishInitialization
}
