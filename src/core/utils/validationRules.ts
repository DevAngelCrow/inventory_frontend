import * as yup from 'yup';

//Regla para campos de texto que requeridos
export const requiredText = (message: string = 'Campo obligatorio.') =>
  yup.string().required(message);

//regla de validacion para texto sin emojis
export const noEmojis = (message: string = 'No se permiten emojis.') => {
  const schema = yup
    .string()
    .matches(/^[a-zA-Z0-9\s.,!?'"()@#$%^&*\-_+=`~¡¿ñÑáéíóúÁÉÍÓÚüÜ]*$/, message);

  return schema;
};

export const requiredNumber = (
  messageRequired: string = 'Este campo es obligatorio.',
  messageInvalid: string = 'Debe ser un numero valido',
  min?: number,
  max?: number,
) => {
  let schema = yup.number().typeError(messageInvalid).required(messageRequired);
  if (min !== undefined) {
    schema = schema.min(min, `Ell valor minimo permitido es ${min}.`);
  }
  if (max !== undefined) {
    schema = schema.max(max, `El valor maximo permitido es ${max}.`);
  }

  return schema;
};

export const optionalNumber = (
  messageInvalid: string = 'Debe ser numero valido',
  min?: number,
  max?: number,
) => {
  let schema = yup.number().typeError(messageInvalid).notRequired();
  if (min !== undefined) {
    schema = schema.min(min, `El valor minimo permitido es ${min}.`);
  }
  if (max !== undefined) {
    schema = schema.max(max, `El valor maximo permitido es ${max}.`);
  }
  return schema;
};

export const emailFormat = (
  messageInvalid: string = 'Formato de correo electronico no valido',
  required?: boolean,
  messageRequired: string = 'El campo es requerido',
) => {
  if (!required) {
    return yup.string().email(messageInvalid);
  }
  return yup.string().email(messageInvalid).required(messageRequired);
};

export const passwordValidation = (
  minLength: number = 8,
  messageMinLength: string = `La contrasena debe tener al menos ${minLength} caracteres.`,
  messageRequired: string = `La contrasena es obligatoria`,
) =>
  yup
    .string()
    .min(minLength, messageMinLength)
    .required(messageRequired)
    .test(
      'no-emojis',
      'no se permite emojis en la contraseña',
      value =>
        !value ||
        !/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu.test(value),
    );
