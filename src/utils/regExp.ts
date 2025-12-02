// 邮箱
export const rEmail =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// 账号
export const rAccount = /^(\d|[a-zA-Z]){4,11}$/

// 密码 支持字母/数字/下划线/连字符(6-16)
export const rPassword = /^[a-zA-Z0-9_-]{6,16}$/

// 验证码
export const rVerCode = /^\d{4}$/
