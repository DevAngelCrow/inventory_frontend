---
title: Scripts
description: Descripción de la funcionalidad de cada script de la aplicación.
---


## dev

Inicia la aplicación en modo desarrollo.

## build

Crea el compilado de archivos para la preproducción.

## build:prod

Crea el compilado de archivos estrictos para poder proceder para que la aplicación pueda desplegarse en producción.

## preview

pendiente...

## lint

Ejecuta el eslinter ESLint sobre todo el código, el cual detectará errores de sintáxis o potenciales bugs. También verifica que el código cumpla con ciertas reglas de estilo.

## lint:fix

Hace exactamente lo mismo que el script lint, sin embargo, este puede coregir de manera automática errores que pueden tener solución seguras o errores de identación, comillas mal usadas, espacios, etc. Sin embargo, este no puede corregir problemas complejos que requiren de inspección manual.

## format

Aplica reglas de estilo uniformes en el código (indentación, comillas, punto y coma, etc.).

No detecta errores como lo hace un linter (como ESLint), pero sí estandariza el formato.

## check:types

Utiliza el compilador de TypeScript (tsc) en modo de solo comprobación (--noEmit).

Verifica que no haya errores de tipo, por ejemplo:

Variables mal tipadas.

Funciones mal usadas.

Propiedades inexistentes en objetos.

Importaciones incorrectas.

No genera archivos .js ni ningún output.

## check

Ejecuta una verificación completa del código ya que ejecuta en circuito el linting, chequeo de tipos y formateo.

Este se recomienda ejecutarlo antes de realizar un commit o un deploy.

## preview:build

Compila el proyecto (build) y luego lo sirve localmente para previsualizarlo (preview) como si ya estuviera en producción.

## clean

Elimina archivos generados, dependencias y caché para hacer una reinstalación limpia del proyecto.

## check:node

Verifica que la versión de Node.js instalada sea igual o mayor a la especificada (en este caso 18.18.0).

## dev:setup

Preparación del entorno de desarrollo, *este debe ejecutarse estrictamente posterior al npm install*

## prepare

Configura Husky para habilitar los hooks de Git en el proyecto.

## pre-commit

Crea (o actualiza) el hook de Git pre-commit para que, antes de cada commit, se ejecute lint-staged con Husky.

## commitlint 

Crea (o actualiza) el hook de Git commit-msg para validar el mensaje del commit usando commitlint.

## dev:docs

Inicia el servidor de desarrollo para la documentación ubicada en la carpeta documentation-astro.