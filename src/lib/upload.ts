/** XHR 上传并回报进度（fetch 无进度事件，用于上传进度条） */
export function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", url)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      const res = new Response(xhr.responseText, {
        status: xhr.status,
        headers: {
          "Content-Type":
            xhr.getResponseHeader("Content-Type") || "application/json",
        },
      })
      resolve(res)
    }
    xhr.onerror = () => reject(new Error("网络错误，上传失败"))
    xhr.send(formData)
  })
}
