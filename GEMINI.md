# Proyecto: Diario Mural Curicó

Este archivo `GEMINI.md` proporciona información esencial para que el agente Gemini CLI entienda e interactúe eficazmente con el proyecto `Diario Mural Curicó`.

## 1. Resumen del Proyecto

Diario Mural Curicó es una aplicación web diseñada para unificar y centralizar la agenda de actividades y eventos en la provincia de Curicó. Su objetivo principal es proporcionar una plataforma única para que los organizadores de eventos publiquen sus actividades y para que la comunidad descubra y participe fácilmente en los eventos locales, fomentando la identidad cultural y la participación comunitaria.

## 2. Pila Tecnológica

*   **Frontend**: React.js
*   **Estilos**: Tailwind CSS, React-Bootstrap
*   **Backend/Base de Datos/Autenticación**: Google Firebase (Firestore, Authentication, Storage, Hosting)
*   **Gestor de Paquetes**: npm
*   **Pruebas**: Jest, React Testing Library (basado en `App.test.js` y `setupTests.js`)
*   **Herramienta de Construcción**: Create React App (implícito por los scripts de `package.json`)

## 3. Estructura del Proyecto

*   `/src`: Contiene el código fuente principal de la aplicación.
    *   `/src/components`: Componentes React reutilizables (por ejemplo, `AuthContext.jsx`, `CalendarApp`, `Footer`, `Tarjeta`).
    *   `/src/pages`: Componentes de alto nivel que representan diferentes vistas/páginas de la aplicación (por ejemplo, `Inicio`, `Login`, `Programacion`, `Reservas`).
    *   `/src/config`: Configuración de Firebase (`Firebase.js`).
    *   `/src/routes`: Define el enrutamiento de la aplicación (`Allroutes.jsx`, `Layout.jsx`, `Navigation.jsx`).
    *   `/src/__test__`: Contiene datos de prueba y potencialmente pruebas unitarias.
*   `/public`: Activos estáticos (HTML, imágenes, fuentes, manifest, robots.txt).
*   `/firebase-export-*`: Directorios que contienen exportaciones de Firebase Firestore y Storage, probablemente para copias de seguridad o propósitos de desarrollo local.
*   `firestore.indexes.json`: Definiciones de índices de Firebase Firestore.
*   `firestore.rules`: Reglas de seguridad de Firebase Firestore.
*   `storage.rules`: Reglas de seguridad de Firebase Storage.
*   `package.json`: Metadatos y dependencias del proyecto.
*   `package-lock.json`: Versiones exactas de las dependencias.
*   `jest.config.js`: Configuración del framework de pruebas Jest.
*   `.babelrc`, `postcss.config.js`, `tailwind.config.js`: Archivos de configuración para la transpilación, PostCSS y Tailwind CSS.

## 4. Comandos Comunes

Para asegurar una interacción adecuada con el proyecto, utilice los siguientes comandos:

*   **Instalar Dependencias**:
    ```bash
    npm install
    ```
*   **Iniciar Servidor de Desarrollo**:
    ```bash
    npm start
    ```
    (Esto normalmente abrirá la aplicación en su navegador en `http://localhost:3000`.)
*   **Ejecutar Pruebas**:
    ```bash
    npm test
    ```
    (Este comando ejecuta las pruebas en modo interactivo de observación. Presione `a` para ejecutar todas las pruebas.)
*   **Compilar para Producción**:
    ```bash
    npm run build
    ```
    (Este comando compila la aplicación para producción en la carpeta `build`.)
*   **Linting/Formato**:
    No hay scripts explícitos de linting o formato definidos en `package.json`. Se recomienda depender de las extensiones del editor (por ejemplo, Prettier, ESLint) configuradas para el proyecto. Si se realizan cambios, asegúrese de que se adhieran al estilo de código existente.

## 5. Convenciones

*   **Nomenclatura de Componentes**: PascalCase para componentes React (por ejemplo, `CalendarApp.jsx`, `Inicio.jsx`).
*   **Nomenclatura de Archivos**: `NombreComponente.jsx` para componentes React, `NombreComponente.css` para los estilos asociados.
*   **Estilos**: Una mezcla de clases de Tailwind CSS y módulos CSS tradicionales. Prefiera Tailwind CSS para estilos utility-first.
*   **Integración con Firebase**: Los servicios de Firebase están configurados en `src/config/Firebase.js` y se utilizan en toda la aplicación para la gestión de datos y la autenticación.
*   **Enrutamiento**: Manejado por `react-router-dom` (implícito por la estructura del directorio `routes`).

## 6. Especificaciones de Firebase

*   **Firestore**: Los datos se almacenan en Firestore. Consulte `firestore.rules` para las reglas de seguridad y `firestore.indexes.json` para las definiciones de índices.
*   **Storage**: El contenido subido por el usuario (por ejemplo, imágenes) se almacena en Firebase Storage. Consulte `storage.rules` para las reglas de seguridad.
*   **Exportaciones de Datos**: Los directorios `firebase-export-*` contienen datos exportados. Al trabajar con datos, considere si estas exportaciones son relevantes para las pruebas locales o la migración de datos.

## 7. Manejo de WebView en Autenticación

*   **Problema**: Google bloquea los inicios de sesión de OAuth desde WebViews incrustadas (ej. navegadores de Instagram, Facebook) por seguridad. Esto impide que el flujo de "Iniciar Sesión con Google" se complete.
*   **Solución**: Se implementó una estrategia de detección y escape de WebViews en el componente `Login`.
    1.  **Detección**: El componente detecta si se está ejecutando dentro de una WebView buscando palabras clave específicas en el `User Agent`.
    2.  **Vista Personalizada**: Si se detecta una WebView, se muestra una vista especial que instruye al usuario a continuar en un navegador externo.
    3.  **Lógica de Escape por Plataforma**:
        *   **Android**: Se utiliza un `intent` de Android (`intent://...`) para solicitar explícitamente al sistema operativo que abra la URL en Chrome. Este es el método más fiable para esta plataforma.
        *   **iOS**: Se emplea una técnica de "clic dinámico". Un botón crea un elemento `<a>` en el DOM, simula un clic en él y lo elimina. Este método tiene una alta probabilidad de ser interpretado por iOS como una acción legítima para abrir Safari.
        *   **Fallback**: Para otros dispositivos, se usa un `target="_blank"` como solución genérica.

Este enfoque asegura la mejor experiencia de usuario posible al guiarlo para que complete el inicio de sesión en un entorno compatible.

## 8. Cambios Recientes

### Levantamiento de Estado en `EventDialog`

Para asegurar que los estados `selectedWeekdays` y `selectedMonthDays` persistan entre las instancias del componente `EventDialog`, se ha refactorizado la gestión de estos estados.

*   **`src/components/CalendarApp/EventDialog.jsx`**:
    *   Se eliminó la declaración interna de `useState` y el `useEffect` asociado para `selectedWeekdays` y `selectedMonthDays`.
    *   Estos estados ahora se reciben como `props` (`selectedWeekdays`, `setSelectedWeekdays`, `selectedMonthDays`, `setSelectedMonthDays`).
    *   Se actualizaron los `propTypes` para reflejar estos nuevos `props`.

*   **`src/components/CalendarApp/CalendarApp.jsx` (Componente Padre)**:
    *   Se declararon los estados `selectedWeekdays` y `selectedMonthDays` utilizando `useState`.
    *   Se modificó la instancia de `EventDialog` para pasar estos estados y sus funciones `setter` como `props`.
    *   Se ajustaron las funciones `handleEditEvent` y `handleDayClick` para inicializar o actualizar `selectedWeekdays` y `selectedMonthDays` según sea necesario.

Este cambio centraliza la gestión del estado de los días seleccionados en el componente padre, `CalendarApp`, garantizando la persistencia y coherencia de los datos.

Este archivo `GEMINI.md` debería servir como una referencia rápida para comprender la configuración del proyecto y cómo interactuar con él.
