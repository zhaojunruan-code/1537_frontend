import {useUserStore} from "@/store/useUserStore";

const loginRoute = '/pages/login/index';

const isLogin = () => {
  const userStore = useUserStore();
  return userStore.isLogin;
};

const ignoreList = [
    '/pages/login/index'
]

const whitelist = [
  ...ignoreList,
]

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
