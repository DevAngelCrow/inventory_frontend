---
title: 2- Guia de inicio de instalación.
description: Descripcion de la guia de instalacion.
---

## Requisitos

- Node versión >= 18.8.0
- npm versión >= 10.8.x

## Instalación

1 - Clonar el repositorio.

```
git clone https://github.com/DevAngelCrow/vue-3-template.git
cd vue-3-template
```

2 - Configurar el .env

```
cp .env.example .env.local
```

Configura las variables de entorno del archivo .env.local de acuerdo a tu necesidad.
Inicialmente cuenta con dos variables de entorno que son las habituales
VITE_VUE_APP_API_URL=""
VITE_PORT=""

3 - Procedemos a instalar dependencias, ejecutamos en consola dentro del directorio del repositorio el comando siguiente

```
npm install
```

4 - Dar permisos de superusuario a la carpeta husky si estas utilizando Linux

```
sudo chmod +x .husky/*
```

5 - Procedemos a ejecutar el siguiente script para asentar las configuraciones iniciales:

```
npm run dev:setup
```

6 - Ejecutamos el comando siguiente para iniciar la ejecución del proyecto en modo desarrollo

```
npm run dev
```