import {useUserStore} from "@/store/useUserStore";

const loginRoute = '/pages/login/index';

const isLogin = () => {
  const userStore = useUserStore();
  return userStore.isLogin;
};

const ignoreList = [
    '/pages/login/index'
]

// 不需要登录的页面
const whitelist = [
  ...ignoreList,
    // 在这里添加不需要登录的页面地址， 类似 '/pages/demo/index'
]

// 黑名单登录拦截器 - （适用于大部分页面不需要登录，少部分页面需要登录）
const navigateToInterceptor = {
  invoke({url}) {
    const path = url.split('?')[0];
    const noNeedLogin = whitelist.includes(path);
    if (noNeedLogin) {
      return true;
    }
    const hasLogin = isLogin();
    if (hasLogin) {
      return true;
    }
    const redirectRoute = `${loginRoute}?redirect=${encodeURIComponent(url)}`;
    uni.navigateTo({url: redirectRoute});
    return false;
  }
};

export const routeInterceptor = {
  install() {
    uni.addInterceptor('navigateTo', navigateToInterceptor);
    uni.addInterceptor('reLaunch', navigateToInterceptor);
    uni.addInterceptor('redirectTo', navigateToInterceptor);
  }
};
