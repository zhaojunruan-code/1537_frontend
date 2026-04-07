/**
 * usePermissions APP 权限管理 Hook（适配 Android / iOS）
 *
 * 快速示例：
 * ```js
 * import { usePermissions } from '@/hooks/app/usePermission'
 *
 * const { ensurePermission, gotoAppPermissionSetting } = usePermissions()
 *
 * // 在需要用到相机之前调用
 * try {
 *   // {('camera'|'record'|'location'|'photo'|'storage'|'push')} type 权限类型
 *   await ensurePermission('camera')
 *   // 已授权，可以继续使用摄像头 API
 * } catch (e) {
 *   // 未授权，引导去设置
 *   gotoAppPermissionSetting()
 * }
 * ```
 */
export function usePermissions() {
  const isIos = ref(false);

  // #ifdef APP-PLUS
  isIos.value = plus.os.name === 'iOS';
  // #endif

  // 判断推送权限是否开启
  const judgeIosPermissionPush = () => {
    let result = false;
    const UIApplication = plus.ios.import('UIApplication');
    const app = UIApplication.sharedApplication();
    let enabledTypes = 0;

    if (app.currentUserNotificationSettings) {
      const settings = app.currentUserNotificationSettings();
      enabledTypes = settings.plusGetAttribute('types');
      result = enabledTypes !== 0;
      plus.ios.deleteObject(settings);
    } else {
      enabledTypes = app.enabledRemoteNotificationTypes();
      result = enabledTypes !== 0;
    }

    plus.ios.deleteObject(app);
    plus.ios.deleteObject(UIApplication);
    return result;
  };

  // 判断定位权限是否开启
  const judgeIosPermissionLocation = () => {
    const cllocationManger = plus.ios.import('CLLocationManager');
    const status = cllocationManger.authorizationStatus();
    const result = status !== 2;
    plus.ios.deleteObject(cllocationManger);
    return result;
  };

  // 判断麦克风权限是否开启
  const judgeIosPermissionRecord = () => {
    let result = false;
    const avaudiosession = plus.ios.import('AVAudioSession');
    const avaudio = avaudiosession.sharedInstance();
    const permissionStatus = avaudio.recordPermission();

    result = !(permissionStatus === 1684369017 || permissionStatus === 1970168948);

    plus.ios.deleteObject(avaudiosession);
    return result;
  };

  // 判断相机权限是否开启
  const judgeIosPermissionCamera = () => {
    let result = false;
    const AVCaptureDevice = plus.ios.import('AVCaptureDevice');
    const authStatus = AVCaptureDevice.authorizationStatusForMediaType('vide');

    result = authStatus === 3;

    plus.ios.deleteObject(AVCaptureDevice);
    return result;
  };

  // 判断相册权限是否开启
  const judgeIosPermissionPhotoLibrary = () => {
    let result = false;
    const PHPhotoLibrary = plus.ios.import('PHPhotoLibrary');
    const authStatus = PHPhotoLibrary.authorizationStatus();

    result = authStatus === 3;

    plus.ios.deleteObject(PHPhotoLibrary);
    return result;
  };

  // 判断通讯录权限是否开启
  const judgeIosPermissionContact = () => {
    let result = false;
    const CNContactStore = plus.ios.import('CNContactStore');
    const cnAuthStatus = CNContactStore.authorizationStatusForEntityType(0);

    result = cnAuthStatus === 3;

    plus.ios.deleteObject(CNContactStore);
    return result;
  };

  // 判断日历权限是否开启
  const judgeIosPermissionCalendar = () => {
    let result = false;
    const EKEventStore = plus.ios.import('EKEventStore');
    const ekAuthStatus = EKEventStore.authorizationStatusForEntityType(0);

    result = ekAuthStatus === 3;

    plus.ios.deleteObject(EKEventStore);
    return result;
  };

  // 判断备忘录权限是否开启
  const judgeIosPermissionMemo = () => {
    let result = false;
    const EKEventStore = plus.ios.import('EKEventStore');
    const ekAuthStatus = EKEventStore.authorizationStatusForEntityType(1);

    result = ekAuthStatus === 3;

    plus.ios.deleteObject(EKEventStore);
    return result;
  };

  // Android权限查询
  const requestAndroidPermission = (permissionID) => {
    return new Promise((resolve, reject) => {
      plus.android.requestPermissions(
        [permissionID],
        (resultObj) => {
          let result = 0;
          if (resultObj.granted.length > 0) {
            result = 1;
          } else if (resultObj.deniedPresent.length > 0) {
            result = -1;
          } else if (resultObj.deniedAlways.length > 0) {
            result = -1;
          }
          resolve(result);
        },
        (error) => {
          resolve({ code: error.code, message: error.message });
        },
      );
    });
  };

  // 使用一个方法，根据参数判断权限
  const judgeIosPermission = (permissionID) => {
    switch (permissionID) {
      case 'location':
        return judgeIosPermissionLocation();
      case 'camera':
        return judgeIosPermissionCamera();
      case 'photoLibrary':
        return judgeIosPermissionPhotoLibrary();
      case 'record':
        return judgeIosPermissionRecord();
      case 'push':
        return judgeIosPermissionPush();
      case 'contact':
        return judgeIosPermissionContact();
      case 'calendar':
        return judgeIosPermissionCalendar();
      case 'memo':
        return judgeIosPermissionMemo();
      default:
        return false;
    }
  };

  // 跳转到应用的权限页面
  const gotoAppPermissionSetting = () => {
    if (isIos.value) {
      const UIApplication = plus.ios.import('UIApplication');
      const application2 = UIApplication.sharedApplication();
      const NSURL2 = plus.ios.import('NSURL');
      const setting2 = NSURL2.URLWithString('app-settings:');
      application2.openURL(setting2);
      plus.ios.deleteObject(setting2);
      plus.ios.deleteObject(NSURL2);
      plus.ios.deleteObject(application2);
    } else {
      const Intent = plus.android.importClass('android.content.Intent');
      const Settings = plus.android.importClass('android.provider.Settings');
      const Uri = plus.android.importClass('android.net.Uri');
      const mainActivity = plus.android.runtimeMainActivity();
      const intent = new Intent();
      intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
      const uri = Uri.fromParts('package', mainActivity.getPackageName(), null);
      intent.setData(uri);
      mainActivity.startActivity(intent);
    }
  };

  // 检查系统的设备服务是否开启
  const checkSystemEnableLocation = () => {
    if (isIos.value) {
      const cllocationManger = plus.ios.import('CLLocationManager');
      const result = cllocationManger.locationServicesEnabled();
      plus.ios.deleteObject(cllocationManger);
      return result;
    } else {
      const context = plus.android.importClass('android.content.Context');
      const locationManager = plus.android.importClass('android.location.LocationManager');
      const main = plus.android.runtimeMainActivity();
      const mainSvr = main.getSystemService(context.LOCATION_SERVICE);
      const result = mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER);
      return result;
    }
  };

  /** 平台适配的权限映射 */
  const ANDROID_MAP = {
    camera: 'android.permission.CAMERA',
    record: 'android.permission.RECORD_AUDIO',
    location: 'android.permission.ACCESS_FINE_LOCATION',
    photo: 'android.permission.READ_EXTERNAL_STORAGE',
    storage: 'android.permission.WRITE_EXTERNAL_STORAGE',
  }

  /**
   * 统一确保权限方法（自动区分平台）
   * @param {('camera'|'record'|'location'|'photo'|'storage'|'push')} type 权限类型
   * @returns {Promise<void>} 成功即已授权
   */
  const ensurePermission = async (type) => {
    // #ifdef APP-ANDROID
    const code = await requestAndroidPermission(ANDROID_MAP[type] || type)
    if (code !== 1) throw new Error('android denied')
    return
    // #endif

    // #ifdef APP-IOS
    const judgeMap = {
      camera: judgeIosPermissionCamera,
      record: judgeIosPermissionRecord,
      location: judgeIosPermissionLocation,
      photo: judgeIosPermissionPhotoLibrary,
      push: judgeIosPermissionPush,
      calendar: judgeIosPermissionCalendar,
      memo: judgeIosPermissionMemo,
      contact: judgeIosPermissionContact,
    }
    const judgeFn = judgeMap[type] || (() => judgeIosPermission(type))
    const ok = judgeFn()
    if (!ok) throw new Error('ios denied')
    return
    // #endif

    // #ifndef APP-ANDROID && #ifndef APP-IOS
    return // 非APP平台直接通过
    // #endif
  }

  // expose new API
  return {
    judgeIosPermissionPush,
    judgeIosPermissionLocation,
    judgeIosPermissionRecord,
    judgeIosPermissionCamera,
    judgeIosPermissionPhotoLibrary,
    judgeIosPermissionContact,
    judgeIosPermissionCalendar,
    judgeIosPermissionMemo,
    requestAndroidPermission,
    judgeIosPermission,
    gotoAppPermissionSetting,
    checkSystemEnableLocation,
    ensurePermission,
  };
}
