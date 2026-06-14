import {
  requiredText,
  requiredNumber,
  passwordValidation,
  optionalNumber,
  noEmojis,
  emailFormat,
} from './validationRules';
export const globalFunctions = {
  requiredText,
  requiredNumber,
  passwordValidation,
  optionalNumber,
  noEmojis,
  emailFormat,
};

export type GlobalFunctions = typeof globalFunctions;
