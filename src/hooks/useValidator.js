/**
 * useValidator 系列格式校验 Hook
 *
 * 使用示例（手机号校验）：
 * ```js
 * import { usePhoneValidator } from '@/hooks/useValidator'
 * 
 * const { validatePhone, isValidPhone } = usePhoneValidator()
 * 
 * validatePhone('13800138000') // true
 * console.log(isValidPhone.value) // true
 * ```
 */

// 校验手机号
export const usePhoneValidator = () => {
  const phonePattern = /^1[3-9]\d{9}$/;
  const isValidPhone = ref(false);

  // 校验手机号是否符合格式
  const validatePhone = (phone) => {
    isValidPhone.value = phonePattern.test(phone);
    return isValidPhone.value;
  };

  return {
    isValidPhone,
    validatePhone,
  };
};

// 校验邮箱
export const useEmailValidator = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = ref(false);

  // 校验邮箱是否符合格式
  const validateEmail = (email) => {
    isValidEmail.value = emailPattern.test(email);
    return isValidEmail.value;
  };

  return {
    isValidEmail,
    validateEmail,
  };
};

// 校验身份证号
export const useIdCardValidator = () => {
  const idCardPattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2]\d|3[0-1])\d{3}(\d|X|x)$/;
  const isValidIdCard = ref(false);

  // 校验身份证号是否符合格式
  const validateIdCard = (idCard) => {
    isValidIdCard.value = idCardPattern.test(idCard);
    return isValidIdCard.value;
  };

  return {
    isValidIdCard,
    validateIdCard,
  };
};

/**
 * 校验密码强度
 * 至少 8 个字符
 * 至少 1 个字母（大小写皆可）
 * 至少 1 个数字
 * 至少 1 个特殊字符（例如 @$!%*#?&）
 */
export const usePasswordValidator = () => {
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  const isValidPassword = ref(false);

  // 校验密码是否符合强度要求
  const validatePassword = (password) => {
    isValidPassword.value = passwordPattern.test(password);
    return isValidPassword.value;
  };

  return {
    isValidPassword,
    validatePassword,
  };
};

// 校验网址 (URL)
export const useUrlValidator = () => {
  const urlPattern = /^(https?:\/\/)?([^\s$.?#].[^\s]*)$/i;
  const isValidUrl = ref(false);

  // 校验网址是否符合格式
  const validateUrl = (url) => {
    isValidUrl.value = urlPattern.test(url);
    return isValidUrl.value;
  };

  return {
    isValidUrl,
    validateUrl,
  };
};

// 校验日期格式 (YYYY-MM-DD)
export const useDateValidator = () => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const isValidDate = ref(false);

  // 校验日期是否符合格式
  const validateDate = (date) => {
    isValidDate.value = datePattern.test(date);
    return isValidDate.value;
  };

  return {
    isValidDate,
    validateDate,
  };
};

// 校验邮政编码
export const usePostalCodeValidator = () => {
  const postalCodePattern = /^\d{6}$/;
  const isValidPostalCode = ref(false);

  // 校验邮政编码是否符合格式
  const validatePostalCode = (postalCode) => {
    isValidPostalCode.value = postalCodePattern.test(postalCode);
    return isValidPostalCode.value;
  };

  return {
    isValidPostalCode,
    validatePostalCode,
  };
};

// 校验 IP 地址 (IPv4)
export const useIpAddressValidator = () => {
  const ipAddressPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const isValidIpAddress = ref(false);

  // 校验 IP 地址是否符合格式
  const validateIpAddress = (ipAddress) => {
    isValidIpAddress.value = ipAddressPattern.test(ipAddress);
    return isValidIpAddress.value;
  };

  return {
    isValidIpAddress,
    validateIpAddress,
  };
};

// 校验用户名
export const useUsernameValidator = () => {
  const usernamePattern = /^[a-zA-Z0-9_]{3,16}$/;
  const isValidUsername = ref(false);

  // 校验用户名是否符合格式
  const validateUsername = (username) => {
    isValidUsername.value = usernamePattern.test(username);
    return isValidUsername.value;
  };

  return {
    isValidUsername,
    validateUsername,
  };
};

// 校验信用卡号
export const useCreditCardValidator = () => {
  const creditCardPattern = /^\d{16}$/;
  const isValidCreditCard = ref(false);

  // 校验信用卡号是否符合格式
  const validateCreditCard = (creditCard) => {
    isValidCreditCard.value = creditCardPattern.test(creditCard);
    return isValidCreditCard.value;
  };

  return {
    isValidCreditCard,
    validateCreditCard,
  };
};
