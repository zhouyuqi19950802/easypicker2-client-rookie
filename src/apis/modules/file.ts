import ajax from '../ajax'

function getUploadToken(): FileApiTypes.getUploadToken {
  return ajax.get('file/token')
}

function uploadFile(file: File, key: string, onProgress?: (percent: number) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('key', key)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = (e.loaded / e.total) * 100
        onProgress(percent)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.code === 0) {
            resolve(response.data)
          }
          else {
            reject(new Error(response.msg || '上传失败'))
          }
        }
        catch (error) {
          reject(error)
        }
      }
      else {
        reject(new Error(`上传失败: ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('上传失败'))
    })

    xhr.open('POST', '/api/file/upload')
    const token = localStorage.getItem('token')
    if (token) {
      xhr.setRequestHeader('token', token)
    }
    xhr.send(formData)
  })
}

function addFile(options: FileApiTypes.FileOptions): FileApiTypes.addFile {
  return ajax.post('file/info', options)
}

function getFileList(): FileApiTypes.getFileList {
  return ajax.get('file/list')
}

function getTemplateUrl(
  template: string,
  key: string,
): FileApiTypes.getTemplateUrl {
  return ajax.get('file/template', {
    params: {
      template,
      key,
    },
  })
}

function getOneFileUrl(id: number): FileApiTypes.getOneFileUrl {
  return ajax.get('file/one', {
    params: {
      id,
    },
  })
}

function deleteOneFile(id: number): FileApiTypes.deleteOneFile {
  return ajax.delete('file/one', {
    params: {
      id,
    },
  })
}

function batchDownload(
  ids: number[],
  zipName?: string,
): FileApiTypes.batchDownload {
  return ajax.post('file/batch/down', {
    ids,
    zipName,
  })
}

function batchDel(ids: number[]): FileApiTypes.batchDel {
  return ajax.delete('file/batch/del', {
    params: {
      ids,
    },
  })
}

function checkCompressStatus(id: string): FileApiTypes.checkCompressStatus {
  return ajax.post('file/compress/status', {
    id,
  })
}
function getCompressDownUrl(key: string): FileApiTypes.getCompressDownUrl {
  return ajax.post('file/compress/down', {
    key,
  })
}
function getCompressFileUrl(id: string): Promise<string> {
  const check = (_r: any, _rej) => {
    checkCompressStatus(id)
      .then((r) => {
        const { code, key } = r.data
        if (code === 0) {
          getCompressDownUrl(key ?? '').then((v) => {
            const { url } = v.data
            _r(url)
          })
        }
        else {
          setTimeout(() => {
            check(_r, _rej)
          }, 1000)
        }
      })
      .catch((err) => {
        _rej(err)
      })
  }

  return new Promise((resolve, rej) => {
    check(resolve, rej)
  })
}

function withdrawFile(
  options: FileApiTypes.WithdrawFileOptions,
): FileApiTypes.withdrawFile {
  return ajax.delete('file/withdraw', {
    params: options,
  })
}

function checkSubmitStatus(
  taskKey: string,
  info: any,
  name = '',
): FileApiTypes.checkSubmitStatus {
  return ajax.post('file/submit/people', {
    taskKey,
    info,
    name,
  })
}

function checkImageFilePreviewUrl(
  ids: number[],
): FileApiTypes.checkImageFilePreviewUrl {
  return ajax.post('file/image/preview', {
    ids,
  })
}

function fileDownloadCount(ids: number[]) {
  return ajax.post('file/download/count', {
    ids,
  })
}

function updateFilename(
  id: number,
  newName: string,
): FileApiTypes.updateFilename {
  return ajax.put('file/name/rewrite', {
    id,
    name: newName,
  })
}
export default {
  getUploadToken,
  uploadFile,
  addFile,
  getFileList,
  getTemplateUrl,
  withdrawFile,
  getOneFileUrl,
  deleteOneFile,
  batchDownload,
  batchDel,
  checkCompressStatus,
  getCompressFileUrl,
  getCompressDownUrl,
  checkSubmitStatus,
  checkImageFilePreviewUrl,
  updateFilename,
  fileDownloadCount,
}
