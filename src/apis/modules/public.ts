import ajax from '../ajax'

/**
 * 获取验证码
 * @param email 邮箱（未登录场景需要提供）
 * @param scene 使用场景：register/login/reset/default
 */
function getCode(email?: string, scene: 'register' | 'login' | 'reset' | 'default' = 'default'): PublicApiTypes.getCode {
  const params: Record<string, any> = { scene }
  if (email) {
    params.email = email
  }
  return ajax.get('public/code', {
    params
  })
}

function reportPv(path: string): PublicApiTypes.reportPv {
  return ajax.post<any, BaseResponse>('public/report/pv', {
    path
  })
}

function checkEmail(email: string): PublicApiTypes.checkEmail {
  return ajax.get<any, BaseResponse>('public/check/email', {
    params: {
      email
    }
  })
}

function getTipImageUrl(
  key: string,
  data: {
    uid: number
    name: string
  }[]
) {
  return ajax.post<any, BaseResponse<{ cover: string; preview: string }[]>>(
    'public/tip/image',
    {
      key,
      data
    }
  )
}
export default {
  getCode,
  reportPv,
  checkEmail,
  getTipImageUrl
}
