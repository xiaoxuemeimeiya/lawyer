import Request from '../utils/request'

const request=new Request()

export function advert(){
  return request.post('/miniapp/index')
}
