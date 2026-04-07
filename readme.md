## 注意事项（请认真查看）

> 框架目录结构

![base.png](https://s2.loli.net/2024/10/09/bxdWC37APVfOGsp.png)

#### 技术栈及文档

- Pinia: https://pinia.vuejs.org/
- uni-use: https://github.com/uni-helper/uni-use/blob/main/src/readme.md
- z-paging: https://z-paging.zxlee.cn/start/intro.html
- moment: https://momentjs.cn/

#### 环境文件

- .env: 基础环境配置，所有环境共享
- .env.development: 开发环境
- .env.production: 生产环境，正式环境

```dotenv
# 应用名称
VITE_APP_TITLE=''
# 开发端口
VITE_APP_PORT=9000
# uniapp Id
VITE_UNI_APPID=''
# 微信小程序Id
VITE_WX_APPID=''
# h5部署网站的base
VITE_APP_PUBLIC_BASE=/
# 接口地址
VITE_SERVER_BASEURL=''
# 文件上传地址
VITE_UPLOAD_BASEURL=''
# h5是否需要配置代理
VITE_APP_PROXY=false
# 代理前缀
VITE_APP_PROXY_PREFIX='/api'
```

### 组件库

> 框架内置Wot Design Uni
> 文档: https://wot-design-uni.pages.dev/

##### 可选

- TuniaoUI 组件库: https://vue3.tuniaokj.com/
- nutui-uniapp 组件库: https://nutui-uniapp.netlify.app/

## 自动化

### 根据接口文档自动生成接口

修改脚本配置, 查看并修改项目根目录下的 `/config/api-config.js`

```js
module.exports = {
  // 把这个地址换成你的接口文档地址，只支持 apipost的
  apiUrl: 'https://doc.apipost.net/docs/detail/2f4f184a2864000?target_id=3758dd32b9a00c',  // 接口文档地址
  autoImport: true,  // 是否自动插入 request
  requestPath: '@/utils/request',  // request 函数的路径
  outputFileName: 'api/index.js',  // 输出的接口文件名
  markdownFileName: 'doc/API_Documentation.md'  // 输出的 Markdown 文档名
};

```

**运行**

```cmd
node scripts/generate-api.js
```

### 编写pages.json 生成页面文件

编写pages.json

```json
{
    "pages": [
        {
            "path": "pages/index/index",
            "name": "首页"
        },
        {
            "path": "pages/login/index",
            "name": "登录"
        }
    ]
}
```

执行脚本

```cmd
node scripts/generate-view.js
```

### 自动提取中文生成翻译语言包(测试中)

> 此方案测试中

#### 前言

使用此方案时，需保证需要提取生成语言包的中文字符被标签包裹，且模板没有使用三元表达式, 比如下面这样

```vue
<!--下面这样可以-->
<template>
	<view>
		<text v-if="test">中文1</text>
		<text v-else>中文2</text>
	</view>
</template>


<!--下面这样不可以-->
<template>
	<view>
		{{test ? '中文1' : '中文2'}}
	</view>
</template>
```

脚本的中文也是可以提取生成的, 比如下面这样

```vue

<script setup>
	const a = ref('中文变量一')
	
	const b = () => {
		return '中文返回值'
	}
	// 上面两种都会被识别并替换
</script>
```

#### 使用

> 建议在初版完成后再使用此脚本（静态页面和接口接入完成后）

**使用此命令进行语言包的生成和替换**

```cmd
npm run auto:translate 
```

#### 例子

- 假设有需要生成语言包的vue文件如下

```vue

<template>
	<view>
		测试中文
		哈哈哈
		<button>按钮</button>
	</view>
</template>
<script setup>
</script>
<style scoped lang="scss">
</style>

```

- 执行脚本后该vue文件会被替换成类似下面这样的

```vue

<template>
	<view>
		{{t('TRANSLATION-868569700')}}
		{{t('TRANSLATION-21552072')}}
		<button>{{t('TRANSLATION-824005')}}</button>
	</view>
</template>
<script setup>
	const {t} = useI18n();
</script>
<style scoped lang="scss">
</style>

```

```json
//zh.json
{
    "TRANSLATION-868569700": "测试中文",
    "TRANSLATION-21552072": "哈哈哈",
    "TRANSLATION-824005": "按钮"
}
```

生成好后去创建对应的外语json, 比如en.json,然后在 `/language/index.js` 里面添加一个语言

```js
// 引入语言包
import zh from './zh.json';
// 中文会自动生成,外语则拿中文的语言包复制粘贴找ChatGPT翻译后自己创建
import en from './en.json';

// 添加语言包
const messages = {
  'zh-Hans': zh,
  'en': en
};

export const i18nConfig = {
  locale: uni.getLocale(),// 获取已设置的语言
  messages,
};


// 在其他地方切换语言, 传入message的key
useLanguage('zh-Hans');
useLanguage('en');
```

## 内置组件

### 自定义底部Tabbar

在需要tabbar的地方引入 `	<CustomTabbar/>` 即可，具体的tab内容到组件里修改，比较简单，这里不做过多演示

### 瀑布流容器

```vue

<template>
	<!--引入组件-->
	<!--props解释-->
	<!--items: 数据-->
	<!--gap: 列表元素间隔-->
	<!--column-count: 瀑布流列数-->
	<WaterfallList :items="dataSource" :gap="8" :column-count="2">
		<!--这个插槽表示每条数据-->
		<template #default="{ item }">
			<!-- 自定义的子组件或内容 -->
			<!--图片必须使用  mode="widthFix"-->
			<image :src="item.img" class="item-img" mode="widthFix"/>
			<text class="item-text">{{ item.text }}</text>
		</template>
	</WaterfallList>

</template>
<script setup>
	
	// 需要展示的数据
	const dataSource = ref([
		{img: 'https://via.placeholder.com/300x400', text: 'Item 1'},
		{img: 'https://via.placeholder.com/300x500', text: 'Item 2'},
		{img: 'https://via.placeholder.com/300x600', text: 'Item 3'},
		{img: 'https://via.placeholder.com/300x300', text: 'Item 4'},
		{img: 'https://via.placeholder.com/300x400', text: 'Item 5'},
		{img: 'https://via.placeholder.com/300x500', text: 'Item 6'}
	])

</script>
<style lang="scss" scoped>
	//参考样式
	.item-img {
		width: 100%;
		height: auto;
	}
	
	.item-text {
		margin-top: 5px;
		font-size: 14px;
	}
</style>

```

### 登录包装器

```vue
<!--props解释-->
<!--login-type: 登陆类型1: 头像昵称、2: 手机号-->
<LoginWrapper :login-type="2">
	<!--默认插槽，自定义按钮样式-->
	<button>点击登录</button>
</LoginWrapper>
```

### 全文件全平台的文件上传

待补充...

## 全局状态机

### 定义

#### 方式一

```js
// 初始状态
const initState = {
  nickname: "",
  avatar: "",
  openid: "",
  token: ""
}

// 定义store
export const useUserStore = defineStore(
  // 名字要取且唯一
  "user",
  () => {
    // state, 可多个，业务需要几个就定义几个，例如下面这样
    const userInfo = ref(initState);
    const userInfo1 = ref(initState);
    const userInfo2 = ref(initState);

    // actions
    const setUserInfo = (val) => {
      userInfo.value = val;
    };

    const clearUserInfo = () => {
      userInfo.value = {...initState};
    };

    // getter
    const isLogin = computed(() => !!userInfo.value.token);

    // 定义好后需返回
    return {
      userInfo,
      userInfo1,
      userInfo2,
      isLogin,
      setUserInfo,
      clearUserInfo
    };
  }
);

```

#### 方式二

```js
export const useUserStore = defineStore('user', {
  state: () => {
    return {
      firstName: 'allen',
      lastName: 'ttk',
      accessToken: 'xxxxxxxxxxxxx',
    }
  },
  actions: {
    setToken(value: string) {
      this.accessToken = value
    },
  },
})
```

### 使用

```vue
<!--需要state的页面, 比如用户中心-->
<template>
	<!--可以在模板直接使用-->
	<view>{{userStore.userInfo.nickname}}</view>
</template>
<script setup>
	// 导入使用store
	const userStore = useUserStore();
	
	onMounted(() => {
		// 给state复制
		userStore.userInfo.nickname = "可直接赋值"
		// 调用action
		userStore.clearUserInfo()
	})
</script>
```

### 持久化

```js
export const useUserStore = defineStore(
  // 名字要取且唯一
  "user",
  () => {
    // state, 可多个，业务需要几个就定义几个，例如下面这样
    const userInfo = ref({});
    // actions
    const setUserInfo = (val) => {
      userInfo.value = val;
    };

    const clearUserInfo = () => {
      userInfo.value = {...initState};
    };

    // getter
    const isLogin = computed(() => !!userInfo.value.token);

    // 定义好后需返回
    return {
      userInfo,
      isLogin,
      setUserInfo,
      clearUserInfo
    };
  },
  // 定义时添加此配置即可
  {
    persist: {
      enabled: true
    },
  }
);
```

### 字典的使用
```vue
      <el-form-item label="性别" prop="gender">
        <el-select v-model="formData.gender" placeholder="请选择性别">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
```
```js
// 获取数字类型的字典数据
// DICT_TYPE.SYSTEM_USER_SEX 对应的是后台设置的字段key
 getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)

// 获取字符串类型的 
getStrDictOptions(DICT_TYPE.SYSTEM_USER_SEX)

// 其他方法看 utils/dict.js 这个文件
```
