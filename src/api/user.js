import axios from "@/utils/request";

// 测试用户登陆
export function test_login(uid) {
  return axios({
    url: "/login_test/" + uid,
    method: "get"
  });
}

// 用户登录
export function login(data) {
  return axios({
    url: "/login",
    method: "post",
    data
  });
}

// 获取用户信息
export function getInfo() {
  return axios({
    url: "/user/info",
    method: "get"
  });
}

// 获取审核人
export function getAuditors() {
  return axios({
    url: "/user/getAuditors",
    method: "get"
  });
}

// 获取用户本周周报
export function getReport() {
  return axios({
    url: "/report",
    method: "get"
  });
}
