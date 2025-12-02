<script lang="ts">
import { defineComponent, ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ConfigServiceAPI } from '@/apis'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

interface InitializeMysqlPayload {
  host: string
  port: string
  database: string
  username: string
  password: string
  adminEmail: string
  adminPassword: string
}

interface RedisConfigPayload {
  host: string
  port: string
  password: string
}

interface MongoFormState {
  host: string
  port: string
  database: string
  useAuth: boolean
  username: string
  password: string
}

interface MailConfigPayload {
  smtpHost: string
  smtpPort: string
  useSSL: boolean
  account: string
  password: string
  from: string
  senderName: string
  subject: string
  template: string
}

interface MailTestPayload {
  target: string
}

interface AdminForm {
  username: string
  email: string
  password: string
}

export default defineComponent({
  name: 'SystemInitialization',
  
  setup() {
    const $router = useRouter()
    const $store = useStore()
    
    const steps = [
      {
        title: 'MySQL',
        icon: '🗄️',
      },
      {
        title: '管理员',
        icon: '👤',
      },
      {
        title: 'Redis',
        icon: '⚡',
      },
      {
        title: 'MongoDB',
        icon: '🍃',
      },
      {
        title: '邮箱设置',
        icon: '📧',
      },
      {
        title: '完成初始化',
        icon: '✅',
      },
    ]

    const activeStep = ref(0)
    const stepStatus = reactive<boolean[]>(steps.map(() => false))

    // MySQL 配置
    const mysqlForm = reactive<InitializeMysqlPayload>({
      host: '127.0.0.1',
      port: '3306',
      database: 'easypicker',
      username: 'root',
      password: '',
      adminEmail: '',
      adminPassword: '',
    })

    // 管理员配置
    const adminForm = reactive<AdminForm>({
      username: '',
      email: '',
      password: '',
    })

    // 管理员确认密码（仅前端校验使用）
    const adminPasswordConfirm = ref('')

    const redisForm = reactive<RedisConfigPayload>({
      host: '127.0.0.1',
      port: '6379',
      password: '',
    })

    const mongoForm = reactive<MongoFormState>({
      host: '127.0.0.1',
      port: '27017',
      database: 'easypicker',
      useAuth: false,
      username: '',
      password: '',
    })

    const mailForm = reactive<MailConfigPayload>({
      smtpHost: '',
      smtpPort: '465',
      useSSL: true,
      account: '',
      password: '',
      from: '',
      senderName: 'EasyPicker',
      subject: 'EasyPicker 验证码',
      template: '您好，验证码为 {{ code }}，请在 2 分钟内使用。',
    })

    const mailTest = reactive<MailTestPayload>({
      target: '',
    })

    const verificationMessage = ref('')

    const loadingMap = reactive({
      mysqlTest: false,
      mysqlInit: false,
      adminSave: false,
      redisTest: false,
      redisSave: false,
      mongoTest: false,
      mongoSave: false,
      mailTest: false,
      mailSave: false,
      verification: false,
      finish: false,
    })

    const canGoPrev = computed(() => activeStep.value > 0)
    const currentStepCompleted = computed(() => stepStatus[activeStep.value])
    const isLastStep = computed(() => activeStep.value === steps.length - 1)

    function markStepDone(stepIndex: number) {
      stepStatus[stepIndex] = true
      if (stepIndex < steps.length - 1)
        activeStep.value = stepIndex + 1
    }

    function goPrev() {
      if (canGoPrev.value)
        activeStep.value -= 1
    }

    async function handleMysqlInit() {
      try {
        await ElMessageBox.confirm(
          '该操作会清空并重建当前填写的数据库，请确认已备份数据。如继续，将无法恢复原有数据。',
          '数据库初始化提示',
          {
            type: 'warning',
            confirmButtonText: '仍要初始化',
            cancelButtonText: '取消',
          },
        )
      }
      catch (error) {
        return
      }
      const dbConfig = {
        host: mysqlForm.host,
        port: mysqlForm.port,
        database: mysqlForm.database,
        username: mysqlForm.username,
        password: mysqlForm.password,
        adminEmail: '',
        adminPassword: '',
      }
      
      loadingMap.mysqlInit = true
      try {
        await ConfigServiceAPI.initializeMysql(dbConfig)
        ElMessage.success('MySQL 数据库初始化成功，系统连接已刷新')
        markStepDone(0)
      } finally {
        loadingMap.mysqlInit = false
      }
    }

    async function handleAdminConfig() {
      if (!adminForm.username) {
        ElMessage.warning('请填写管理员账号')
        return
      }
      
      if (!adminForm.email) {
        ElMessage.warning('请填写管理员邮箱')
        return
      }
      
      if (!adminForm.password || !adminPasswordConfirm.value) {
        ElMessage.warning('请填写管理员密码并确认密码')
        return
      }
      
      if (adminForm.password !== adminPasswordConfirm.value) {
        ElMessage.error('两次输入的密码不一致')
        return
      }
      
      loadingMap.adminSave = true
      try {
        // 这里需要调用配置管理员信息的接口
        await ConfigServiceAPI.configureAdmin({
          username: adminForm.username,
          email: adminForm.email,
          password: adminForm.password
        })
        ElMessage.success('管理员配置已保存')
        markStepDone(1)
      } finally {
        loadingMap.adminSave = false
      }
    }

    async function testMysqlConnection() {
      loadingMap.mysqlTest = true
      try {
        await ConfigServiceAPI.testMysqlConnection(mysqlForm)
        ElMessage.success('MySQL 连通性正常')
      } finally {
        loadingMap.mysqlTest = false
      }
    }

    async function handleRedisConfig() {
      loadingMap.redisSave = true
      try {
        await ConfigServiceAPI.configureRedis(redisForm)
        ElMessage.success('Redis 配置保存成功')
        markStepDone(2)
      } finally {
        loadingMap.redisSave = false
      }
    }

    async function testRedisConnection() {
      loadingMap.redisTest = true
      try {
        await ConfigServiceAPI.testRedisConnection(redisForm)
        ElMessage.success('Redis 连通性正常')
      } finally {
        loadingMap.redisTest = false
      }
    }

    function buildMongoUri() {
      const base = `mongodb://${mongoForm.host}:${mongoForm.port}/${mongoForm.database}`
      if (!mongoForm.useAuth || !mongoForm.username) {
        return base
      }
      const authPart = encodeURIComponent(mongoForm.username)
      const pwd = encodeURIComponent(mongoForm.password || '')
      return `mongodb://${authPart}:${pwd}@${mongoForm.host}:${mongoForm.port}/${mongoForm.database}`
    }

    async function handleMongoConfig() {
      loadingMap.mongoSave = true
      try {
        await ConfigServiceAPI.configureMongo({
          uri: buildMongoUri(),
        })
        ElMessage.success('MongoDB 链接保存成功')
        markStepDone(3)
      } finally {
        loadingMap.mongoSave = false
      }
    }

    async function testMongoConnection() {
      loadingMap.mongoTest = true
      try {
        await ConfigServiceAPI.testMongoConnection({
          uri: buildMongoUri(),
        })
        ElMessage.success('MongoDB 连通性正常')
      } finally {
        loadingMap.mongoTest = false
      }
    }

    async function handleMailConfig() {
      loadingMap.mailSave = true
      try {
        await ConfigServiceAPI.configureMail({
          ...mailForm,
          account: mailForm.from,
        })
        ElMessage.success('邮箱与模板配置成功')
        markStepDone(4)
      } finally {
        loadingMap.mailSave = false
      }
    }

    function validateMailConfigForTest() {
      if (!mailForm.smtpHost) {
        ElMessage.warning('请填写 SMTP 地址')
        return false
      }
      if (!mailForm.smtpPort) {
        ElMessage.warning('请填写 SMTP 端口')
        return false
      }
      if (!mailForm.from) {
        ElMessage.warning('请填写发信邮箱')
        return false
      }
      if (!mailForm.password) {
        ElMessage.warning('请填写授权码/密码')
        return false
      }
      return true
    }

    async function sendMailTest() {
      if (!mailTest.target) {
        ElMessage.warning('请填写测试邮箱地址')
        return
      }
      if (!validateMailConfigForTest()) {
        return
      }
      loadingMap.mailTest = true
      try {
        await ConfigServiceAPI.sendLiveTestMail({
          ...mailForm,
          account: mailForm.from,
          target: mailTest.target,
          template: '这是一封测试邮件，如果您收到此邮件，说明邮箱配置成功！',
        })
        ElMessage.success(`测试邮件已发送至 ${mailTest.target}`)
      } finally {
        loadingMap.mailTest = false
      }
    }

    async function sendAdminVerification() {
      if (!adminForm.email) {
        ElMessage.warning('请先填写管理员邮箱')
        return
      }
      loadingMap.verification = true
      try {
        await ConfigServiceAPI.sendAdminVerification({ email: adminForm.email })
        verificationMessage.value = `验证码已发送到 ${adminForm.email}`
        ElMessage.success(verificationMessage.value)
        markStepDone(5)
      } finally {
        loadingMap.verification = false
      }
    }

    async function finishInitialization() {
      if (!adminForm.email) {
        ElMessage.warning('请先在上一步填写并保存管理员邮箱')
        return
      }
      loadingMap.finish = true
      try {
        await ConfigServiceAPI.finishInitialization({
          email: adminForm.email,
          mysql: {
            host: mysqlForm.host,
            port: mysqlForm.port,
            database: mysqlForm.database,
            username: mysqlForm.username,
            password: mysqlForm.password,
          },
          admin: {
            username: adminForm.username,
            email: adminForm.email,
            password: adminForm.password,
          },
        })
        
        // 清除登录状态
        $store.commit('user/setToken', '')
        $store.commit('user/setSystem', false)
        $store.commit('user/setSuperAdmin', false)
        
        ElMessage.success('初始化完成，即将跳转到登录页面')
        setTimeout(() => {
          $router.push('/login')
        }, 1500)
      } finally {
        loadingMap.finish = false
      }
    }

    return {
      steps,
      activeStep,
      stepStatus,
      mysqlForm,
      adminForm,
      adminPasswordConfirm,
      redisForm,
      mongoForm,
      mailForm,
      mailTest,
      verificationMessage,
      loadingMap,
      canGoPrev,
      currentStepCompleted,
      isLastStep,
      markStepDone,
      goPrev,
      handleMysqlInit,
      handleAdminConfig,
      testMysqlConnection,
      handleRedisConfig,
      testRedisConnection,
      handleMongoConfig,
      testMongoConnection,
      handleMailConfig,
      sendMailTest,
      sendAdminVerification,
      finishInitialization,
    }
  }
})
</script>

<template>
  <div class="config-container">
    <div class="config-header">
      <div class="header-icon">🚀</div>
      <h1 class="header-title">系统初始化</h1>
      <p class="header-subtitle">请依次完成下面各项配置，推荐从左往右逐步进行</p>
    </div>

    <div class="steps-progress">
      <div class="steps-list">
        <div
          v-for="(step, index) in steps"
          :key="index"
          :class="[
            'step-item',
            { active: activeStep === index },
            { completed: stepStatus[index] }
          ]"
          @click="activeStep = index"
        >
          <div class="step-icon">{{ step.icon }}</div>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
          </div>
          <div class="step-status">
            <div v-if="stepStatus[index]" class="status-check">✓</div>
          </div>
        </div>
      </div>
    </div>

    <div class="config-content">
      <Transition name="slide-fade" mode="out-in">
        <!-- 步骤 1：MySQL 初始化 -->
        <div
          v-if="activeStep === 0"
          key="step-0"
          class="config-card"
        >
          <div class="card-header">
            <div class="card-icon">🗄️</div>
            <h2 class="card-title">MySQL 初始化</h2>
          </div>
          <div class="card-body">
            <el-form class="config-form" label-width="140px">
              <el-form-item label="📍 MySQL 地址">
                <el-input v-model="mysqlForm.host" placeholder="如 127.0.0.1" />
              </el-form-item>
              <el-form-item label="🔌 端口">
                <el-input v-model="mysqlForm.port" />
              </el-form-item>
              <el-form-item label="📊 数据库名称">
                <el-input v-model="mysqlForm.database" />
              </el-form-item>
              <el-form-item label="👤 用户名">
                <el-input v-model="mysqlForm.username" />
              </el-form-item>
              <el-form-item label="🔐 密码">
                <el-input v-model="mysqlForm.password" type="password" show-password />
              </el-form-item>
            </el-form>
            <div class="action-buttons">
              <el-button
                :loading="loadingMap.mysqlTest"
                class="test-btn"
                @click="testMysqlConnection"
              >
                连通测试
              </el-button>
              <el-button
                type="primary"
                class="primary-btn"
                :loading="loadingMap.mysqlInit"
                @click="handleMysqlInit"
              >
                数据库初始化
              </el-button>
            </div>
          </div>
        </div>

        <!-- 步骤 2：管理员配置 -->
        <div
          v-else-if="activeStep === 1"
          key="step-1"
          class="config-card"
        >
          <div class="card-header">
            <div class="card-icon">👤</div>
            <h2 class="card-title">管理员配置</h2>
          </div>
          <div class="card-body">
            <el-form class="config-form" label-width="140px">
              <el-form-item label="👤 管理员账号">
                <el-input v-model="adminForm.username" placeholder="输入管理员登录账号" />
              </el-form-item>
              <el-form-item label="📧 管理员邮箱">
                <el-input v-model="adminForm.email" placeholder="admin@example.com" />
              </el-form-item>
              <el-form-item label="🔑 管理员密码">
                <el-input v-model="adminForm.password" type="password" show-password />
              </el-form-item>
              <el-form-item label="🔑 确认密码">
                <el-input v-model="adminPasswordConfirm" type="password" show-password />
              </el-form-item>
            </el-form>
            <div class="action-buttons">
              <el-button
                type="primary"
                class="primary-btn"
                :loading="loadingMap.adminSave"
                @click="handleAdminConfig"
              >
                保存管理员配置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 步骤 3：Redis -->
        <div
          v-else-if="activeStep === 2"
          key="step-2"
          class="config-card"
        >
          <div class="card-header">
            <div class="card-icon">⚡</div>
            <h2 class="card-title">Redis 初始化</h2>
          </div>
          <div class="card-body">
            <el-form class="config-form" label-width="140px">
              <el-form-item label="📍 Redis 地址">
                <el-input v-model="redisForm.host" />
              </el-form-item>
              <el-form-item label="🔌 端口">
                <el-input v-model="redisForm.port" />
              </el-form-item>
              <el-form-item label="🔐 密码">
                <el-input v-model="redisForm.password" type="password" show-password />
              </el-form-item>
            </el-form>
            <div class="action-buttons">
              <el-button
                :loading="loadingMap.redisTest"
                class="test-btn"
                @click="testRedisConnection"
              >
                连通测试
              </el-button>
              <el-button
                type="primary"
                class="primary-btn"
                :loading="loadingMap.redisSave"
                @click="handleRedisConfig"
              >
                保存配置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 步骤 4：MongoDB -->
        <div
          v-else-if="activeStep === 3"
          key="step-3"
          class="config-card"
        >
          <div class="card-header">
            <div class="card-icon">🍃</div>
            <h2 class="card-title">MongoDB 初始化</h2>
          </div>
          <div class="card-body">
            <el-form class="config-form" label-width="140px">
              <el-form-item label="📍 Mongo 地址">
                <el-input v-model="mongoForm.host" placeholder="如 127.0.0.1" />
              </el-form-item>
              <el-form-item label="🔌 端口">
                <el-input v-model="mongoForm.port" />
              </el-form-item>
              <el-form-item label="📊 数据库名称">
                <el-input v-model="mongoForm.database" />
              </el-form-item>
              <el-form-item label="🔐 需要鉴权">
                <el-switch v-model="mongoForm.useAuth" />
              </el-form-item>
              <el-form-item
                label="👤 用户名"
                v-if="mongoForm.useAuth"
              >
                <el-input v-model="mongoForm.username" placeholder="输入Mongo用户名" />
              </el-form-item>
              <el-form-item
                label="🔑 密码"
                v-if="mongoForm.useAuth"
              >
                <el-input v-model="mongoForm.password" type="password" show-password />
              </el-form-item>
            </el-form>
            <div class="action-buttons">
              <el-button
                :loading="loadingMap.mongoTest"
                class="test-btn"
                @click="testMongoConnection"
              >
                连通测试
              </el-button>
              <el-button
                type="primary"
                class="primary-btn"
                :loading="loadingMap.mongoSave"
                @click="handleMongoConfig"
              >
                保存配置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 步骤 5：系统邮箱 -->
        <div
          v-else-if="activeStep === 4"
          key="step-4"
          class="config-card"
        >
          <div class="card-header">
            <div class="card-icon">📧</div>
            <h2 class="card-title">系统邮箱设置</h2>
          </div>
          <div class="card-body">
            <el-form class="config-form" label-width="140px">
              <el-form-item label="📮 SMTP 地址">
                <el-input v-model="mailForm.smtpHost" />
              </el-form-item>
              <el-form-item label="🔌 端口">
                <el-input v-model="mailForm.smtpPort" />
              </el-form-item>
              <el-form-item label="🔒 SSL/TLS">
                <el-switch v-model="mailForm.useSSL" />
              </el-form-item>
              <el-form-item label="📤 发信邮箱">
                <el-input v-model="mailForm.from" />
              </el-form-item>
              <el-form-item label="🔑 授权码/密码">
                <el-input v-model="mailForm.password" type="password" show-password />
              </el-form-item>
              <el-form-item label="🪪 发信人名称">
                <el-input v-model="mailForm.senderName" placeholder="如 EasyPicker 通知中心" />
              </el-form-item>
              <el-form-item label="📝 默认主题">
                <el-input v-model="mailForm.subject" />
              </el-form-item>
              <el-form-item label="📄 邮件模板">
                <el-input
                  v-model="mailForm.template"
                  type="textarea"
                  :autosize="{ minRows: 4, maxRows: 8 }"
                />
              </el-form-item>
            </el-form>
            <div class="test-section">
              <h3>测试邮件</h3>
              <el-form label-width="140px" class="test-form">
                <el-form-item label="📧 测试邮箱">
                  <el-input
                    v-model="mailTest.target"
                    placeholder="输入测试邮箱地址"
                    class="test-input"
                  />
                </el-form-item>
              </el-form>
              <p class="test-tip">
                测试邮件将发送固定内容："这是一封测试邮件，如果您收到此邮件，说明邮箱配置成功！"
              </p>
            </div>
            <div class="action-buttons">
              <el-button
                :loading="loadingMap.mailTest"
                class="test-btn"
                @click="sendMailTest"
              >
                发送测试邮件
              </el-button>
              <el-button
                type="primary"
                class="primary-btn"
                :loading="loadingMap.mailSave"
                @click="handleMailConfig"
              >
                保存配置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 步骤 6：系统初始化完成 -->
        <div
          v-else
          key="step-5"
          class="config-card"
        >
          <div class="card-header">
            <div class="card-icon">✅</div>
            <h2 class="card-title">系统初始化完成</h2>
          </div>
          <div class="card-body">
            <div class="verify-section">
              <div class="verify-info">
                <div class="info-item section-title">
                  <span class="info-label">管理员信息</span>
                </div>
                <div class="info-item">
                  <span class="info-label">账号：</span>
                  <span class="info-value">{{ adminForm.username || '未填写' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">密码：</span>
                  <span class="info-value">
                    {{ adminForm.password ? '已设置' : '未填写' }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">邮箱：</span>
                  <span class="info-value">{{ adminForm.email || '未填写' }}</span>
                </div>

                <div class="section-line" />

                <div class="info-item section-divider">
                  <span class="info-label">数据库信息</span>
                </div>
                <div class="info-item">
                  <span class="info-label">数据库地址：</span>
                  <span class="info-value">{{ mysqlForm.host }}:{{ mysqlForm.port }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">数据库名称：</span>
                  <span class="info-value">{{ mysqlForm.database }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">用户名：</span>
                  <span class="info-value">{{ mysqlForm.username || '未填写' }}</span>
                </div>
              </div>
              
              
              <div v-if="verificationMessage" class="verification-message">
                <div class="message-icon">✅</div>
                <p>{{ verificationMessage }}</p>
              </div>
              
              <div class="verify-actions">
                <div class="action-buttons verify-buttons">
                   <el-button
                    type="success"
                    class="success-btn"
                    :loading="loadingMap.finish"
                    @click="finishInitialization"
                  >
                    完成初始化
                  </el-button>
                </div>
              </div>
              
              <el-alert
                v-if="adminForm.email"
                title="请使用服务器返回的账号配合邮箱验证码登录后台。"
                type="success"
                show-icon
                class="success-alert"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>

    
  </div>
</template>

<style scoped lang="scss">
.config-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
  padding: 30px 20px;
}

.config-header {
  text-align: center;
  margin-bottom: 25px;
  
  .header-icon {
    font-size: 48px;
    margin-bottom: 16px;
    animation: bounce 2s infinite;
  }
  
  .header-title {
    font-size: 32px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .header-subtitle {
    font-size: 16px;
    color: #64748b;
    margin: 0;
  }
}

.steps-progress {
  max-width: 1200px;
  margin: 0 auto 25px;
  
  .steps-list {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    padding: 16px 12px;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 85px;
    flex: 0 0 auto;
    position: relative;
    
    &.active {
      border-color: #2563eb;
      background: #dbeafe;
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.2);
    }
    
    &.completed {
      border-color: #10b981;
      background: #ecfdf5;
      
      .step-title {
        color: #059669;
      }
    }
  }
  
  .step-icon {
    font-size: 24px;
  }
  
  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .step-title {
    font-weight: 600;
    font-size: 14px;
    color: #1e293b;
    margin-bottom: 2px;
  }
  
  .step-status {
    position: absolute;
    top: 8px;
    right: 8px;
    
    .status-check {
      width: 20px;
      height: 20px;
      border-radius: 999px;
      border: 2px solid #16a34a;
      color: #16a34a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      background: #ecfdf5;
    }
  }
}

.config-content {
  max-width: 800px;
  margin: 0 auto 25px;
}

.config-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  animation: slideUp 0.5s ease;
}

.card-header {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  padding: 32px;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  
  .card-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .card-title {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
  }
}

.card-body {
  padding: 32px;
}

.config-form {
  margin-bottom: 24px;
  
  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #374151;
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    border: 2px solid #e5e7eb;
    box-shadow: none;
    transition: all 0.3s ease;
    height: 40px;
    
    &:hover {
      border-color: #3b82f6;
    }
    
    &.is-focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
  
  :deep(.el-switch) {
    --el-switch-on-color: #3b82f6;
  }
  
  :deep(.el-textarea) {
    .el-textarea__inner {
      border-radius: 10px;
    }
  }
}

.test-section {
  margin: 24px 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  
  h3 {
    margin: 0 0 16px 0;
    color: #374151;
    font-size: 16px;
  }
}

.test-form {
  .test-input {
    :deep(.el-input__wrapper) {
      border-radius: 12px;
    }
  }
}

.test-tip {
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
}

.verify-section {
  .verify-info {
    margin-bottom: 24px;
    padding: 20px 20px 16px;
    background: linear-gradient(135deg, #f8fafc, #ffffff);
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
  }
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-item.section-title,
  .info-item.section-divider {
    margin-bottom: 6px;
    margin-top: 4px;
  }

  .info-item.section-title .info-label,
  .info-item.section-divider .info-label {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
  }

  .section-line {
    border-top: 1px dashed #e2e8f0;
    margin: 10px 0 14px;
  }
  
  .info-label {
    font-weight: 600;
    color: #64748b;
    min-width: 96px;
  }
  
  .info-value {
    color: #0f172a;
    font-weight: 500;
  }
  
  .verify-description {
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 32px 0;
  }
}

.verification-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  border-radius: 12px;
  margin: 0 0 32px 0;
  
  .message-icon {
    font-size: 20px;
  }
  
  p {
    margin: 0;
    color: #059669;
    font-weight: 500;
  }
}

.success-alert {
  margin-top: 32px;
  border-radius: 12px;
}

.verify-actions {
  margin-top: 32px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
  
  &.verify-buttons {
    margin-top: 0;
  }
  
  .el-button {
    border-radius: 10px;
    font-weight: 600;
    padding: 9px 20px;
    transition: all 0.3s ease;
    min-width: 110px;
    height: 38px;
    white-space: nowrap;
    font-size: 14px;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  .test-btn {
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #374151;
    
    &:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
  }
  
  .primary-btn {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
    }
  }
  
  .success-btn {
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    color: #ffffff !important;
    
    &:hover {
      background: linear-gradient(135deg, #059669, #047857);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &.is-loading {
      color: #ffffff !important;
    }
  }
}

.navigation-bar {
  max-width: 800px;
  width: 100%;
  margin: 0 auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  
  .last-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    font-size: 14px;
    
    .tip-icon {
      font-size: 16px;
    }
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media screen and (max-width: 768px) {
  .config-container {
    padding: 20px 16px;
  }
  
  .steps-progress .steps-list {
    flex-direction: row;
    overflow-x: auto;
    
    .step-item {
      width: 70px;
      padding: 12px 8px;
    }
  }
  
  .card-header,
  .card-body {
    padding: 20px;
  }
  
  .navigation-bar {
    flex-direction: column;
    gap: 16px;
  }
  
  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
    
    .el-button {
      flex: 1;
      min-width: 100px;
      padding: 8px 16px;
      height: 36px;
      font-size: 13px;
    }
  }
  
  .config-form {
    margin-bottom: 20px;
    
    :deep(.el-form-item__label) {
      font-size: 13px;
    }
  }
}
</style>