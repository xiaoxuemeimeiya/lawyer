import Request from '../utils/request'

const request=new Request()

/**
 * 主页-用户信息-微信端
 *
 * @export
 * @returns
 */
export function my(){
  return new Promise((resolve,reject)=>{ 
    request.post('/miniapp/my/home')
      .then(res=>{ 
        res.data={...res.data,...res.data.userinfo}
        resolve(res)
      })   
      .catch(()=>{
        reject("获取用户信息失败!")
      }) 
  }) 
}
