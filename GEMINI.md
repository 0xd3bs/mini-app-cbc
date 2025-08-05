# Contexto del Proyecto: Mini-App Template para Base

## Descripción General

Este proyecto es una plantilla (template) para construir "mini-apps" para la blockchain de Base. Está desarrollado con Next.js (usando el App Router) y viene pre-configurado con un conjunto de herramientas y librerías esenciales para el desarrollo de aplicaciones descentralizadas (dApps) y experiencias integradas en Farcaster.

El objetivo es servir como un punto de partida robusto, permitiendo a los desarrolladores enfocarse en la lógica de negocio en lugar de en la configuración inicial del proyecto.

## Tecnologías Clave

- **Framework Principal:** [Next.js](https://nextjs.org/) (v15+)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **UI Framework:** [React](https://react.dev/) (v18+)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Web3/Blockchain:**
  - **Wallet Connection & Hooks:** [Wagmi](https://wagmi.sh/)
  - **Ethereum/EVM Interaction:** [Viem](https://viem.sh/)
  - **Componentes de UI para Base:** [Coinbase OnchainKit](https://onchainkit.xyz/)
  - **Farcaster Frames:** `@farcaster/frame-sdk`
- **Base de Datos/Cache:** [Upstash Redis](https://upstash.com/redis) (integrado a través de `lib/redis.ts`)
- **Gestor de Paquetes:** pnpm (indicado por `pnpm-lock.yaml`)

## Estructura del Proyecto

- `app/`: Contiene el núcleo de la aplicación Next.js.
  - `app/page.tsx`: La página de inicio y punto de entrada principal de la UI.
  - `app/layout.tsx`: El layout global que envuelve todas las páginas.
  - `app/providers.tsx`: Componente para centralizar los providers de React, como `WagmiProvider` y `QueryClientProvider`.
  - `app/api/`: Rutas de API del backend, útiles para webhooks o lógica del servidor.
  - `app/components/`: Componentes de React reutilizables.
- `lib/`: Módulos y utilidades de soporte.
  - `lib/redis.ts`: Configuración del cliente de Redis.
  - `lib/notification.ts`: Lógica relacionada con notificaciones.
- `public/`: Archivos estáticos como imágenes, logos e íconos.
- `package.json`: Define los scripts y dependencias del proyecto.

## Comandos Comunes

- **Instalar dependencias:**
  ```bash
  pnpm install
  ```
- **Ejecutar en modo de desarrollo:**
  ```bash
  pnpm dev
  ```
- **Construir para producción:**
  ```bash
  pnpm build
  ```
- **Iniciar el servidor de producción:**
  ```bash
  pnpm start
  ```
- **Ejecutar el linter:**
  ```bash
  pnpm lint
  ```

## Objetivo para Gemini

El objetivo principal es entender la arquitectura y las herramientas de esta plantilla para poder extenderla. Las tareas futuras pueden incluir:
- Implementar nuevas características sobre esta base.
- Conectar la aplicación a smart contracts específicos.
- Crear nuevas páginas o componentes de UI.
- Modificar o ampliar la funcionalidad de los Farcaster Frames.
