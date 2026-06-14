/**
 *
 * @param value Es el texto a limpiar
 * @returns El texto sanitizado
 */

const sanitizedValueInput = (
  value: string,
  regex: RegExp = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ@.0-9 ]/g,
) => {
  try {
    if (!value) {
      return '';
    }
    const invalidCharsRegex = regex;

    const newValue = value.replace(invalidCharsRegex, '');
    value = newValue;
    return value;
  } catch (error) {
    console.error(error);
    return '';
  }
};

//   const alphaNumericInput = (value: string | undefined | null, input: string) => {
//     if (value === undefined || value === null) {
//       value = "";
//     }
//     if (!/^[a-zA-ZáÁéÉíÍóÓúÚñÑ@.0-9 ]+$/.test(value)) {
//       const regex = /[a-zA-ZáÁéÉíÍóÓúÚñÑ@.0-9 ]/g;
//       let cadena: string | null | string[] = value.match(regex);
//       cadena = cadena === null ? [""] : cadena;

//       if (input === "buscador_admin") {
//         filter.value = cadena.join("");
//       }
//       if (input === "correo") {
//         formulario.value.correoElectronico = cadena.join("");
//       }
//     }
//   };

export { sanitizedValueInput };
