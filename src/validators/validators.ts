export type ValidatorFunction<T> = (val: T) => string | undefined;

export function emailArray(name: string) {
  return isNonEmptyArray<string>(
    {
      empty: `The argument '${name}' must not be empty`,
      notArray: `The argument '${name}' must be an array of emails`
    },
    isEmail(`The argument '${name}' contains a value that is not an email`), 
  );
}

export function optionalEmailArray(name: string) {
  return optional(isNonEmptyArray<string>(
    {
      empty: `When provided, '${name}' must not be empty. Omit the field or provide emails`,
      notArray: `The argument '${name}' must be an array when provided`
    },
    isEmail(`The argument '${name}' contains a value that is not an email`), 
  ));
}

export function requiredNumber(name: string) {
  return isRequired(`The argument '${name}' is required`, isNumber(`The argument '${name}' must be a number`));
}

export function requiredUuid(name: string) {
  return isRequired(`The argument '${name}' is required`, isUuid(`The argument '${name}' must be an uuid (e.g. ef98ca03-f0d4-47d2-997b-bebc17046561)`));
}

export function getErrors(validations: Array<string | undefined>) {
  return validations.filter(Boolean).join('. ');
}

export function optional<T>(fnValidator: ValidatorFunction<T>): ValidatorFunction<T> {
  return (val: T) => {
    if (!val) { return; }
    return fnValidator(val);
  }
}

export function isNonEmptyArray<T>(messages: {
  notArray: string;
  empty: string;
}, fnValidator: ValidatorFunction<T> = isAny()) {
  return (val: Array<T>) => {
    if (!Array.isArray(val)) { return messages.notArray; }
    if (val.length === 0) { return messages.empty; }
    for (const item of val) {
      const error = fnValidator(item);
      if(error) {return error;}
    }
  }
}

export function isNonEmptyString(isEmpty: string): ValidatorFunction<string> {
  return (val: string) => {
    if (!val) { return isEmpty; }
    return;
  }
}

export function isRequired<T>(notProvided, fnValidator: ValidatorFunction<T> = isAny()): ValidatorFunction<T> {
  return (val: T) => {
    if (!val) { return notProvided; }
    return fnValidator(val);
  }
}

export function isNumber(notNumber: string): ValidatorFunction<string> {
  return (val: string) => {
    if (!val || !val.match(/^\d+$/)) { return notNumber; }
    return;
  }
}

export function isUuid(notUuid: string): ValidatorFunction<string> {
  return (val: string) => {
    if (!val || !val.match(/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/)) { return notUuid; }
    return;
  }
}

export function isEmail(notEmail: string): ValidatorFunction<string> {
  return (val: string) => {
    if (!val || !val.match(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)) { return notEmail; }
    return;
  }
}

export function isAny():  ValidatorFunction<any> {
  return (val?: any) => undefined;
}