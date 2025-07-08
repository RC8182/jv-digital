# Plan de Acción: Facturación Electrónica (Formato Facturae)

Este documento detalla los pasos necesarios para adaptar la aplicación y que pueda generar facturas electrónicas en formato `Facturae` válidas para Hacienda en España.

---

### **Paso 1: Actualizar el Esquema de la Base de Datos (`prisma/schema.prisma`)**

El objetivo es almacenar toda la información necesaria para el emisor, el receptor y los detalles de la factura que exige Hacienda.

1.  **Crear un Modelo para el Emisor (`BusinessProfile`):**
    *   Crea un nuevo modelo `BusinessProfile` para guardar los datos fiscales de tu empresa (el usuario que emite la factura). Esto evita tenerlos hardcodeados.
    *   **Campos necesarios:** `legalName` (Razón Social), `nif`, `fullAddress`, `postalCode`, `city`, `province`, `countryCode` (ej. "ES"), y `commercialRegistryInfo` (datos de registro mercantil, opcional).
    *   Enlaza este modelo con una relación uno a uno al modelo `User`.

2.  **Ampliar el Modelo `Client`:**
    *   Añade los campos que faltan para la dirección completa del cliente: `postalCode`, `province`, y `countryCode`.

3.  **Ampliar el Modelo `Invoice`:**
    *   Añade un campo `invoiceSeries` (String) para gestionar series de facturación (ej. "A-2024").
    *   Añade un campo `currency` (String, con valor por defecto "EUR").

4.  **Modificar el Modelo `InvoiceLine` (Crítico):**
    *   `Facturae` requiere el desglose de impuestos *por cada línea*. Debes añadir:
        *   `taxRate` (Float): Para guardar el porcentaje de impuesto (ej. 21, 7, 4).
        *   `taxAmount` (Float): Para guardar la cantidad de impuesto calculada para esa línea.

### **Paso 2: Aplicar los Cambios a la Base de Datos**

Una vez modificado el fichero `prisma/schema.prisma`, tendrás que aplicar los cambios ejecutando una migración.
*   Abre tu terminal y ejecuta: `npx prisma migrate dev --name add_facturae_fields`

### **Paso 3: Modificar el Backend (API Endpoints)**

1.  **Crear API para el Perfil de Empresa:**
    *   Crea una nueva ruta API (ej. `src/app/api/business-profile/route.js`) que permita crear, leer y actualizar el `BusinessProfile` del usuario autenticado.

2.  **Actualizar la API de Facturas (`/api/agente/invoices/...`):**
    *   Modifica el endpoint `POST` (crear factura) para que guarde los nuevos campos (`invoiceSeries`, `taxRate` y `taxAmount` por cada línea).
    *   Modifica el endpoint `PUT` (actualizar factura) para que también pueda gestionar estos nuevos campos.

3.  **Crear el Endpoint de Generación `Facturae`:**
    *   Crea una nueva ruta, por ejemplo `src/app/api/invoices/[id]/facturae/route.js`.
    *   Esta ruta recibirá una petición `GET`, buscará la factura en la base de datos con todos sus datos (cliente, líneas, perfil del emisor).
    *   **Lógica principal:**
        *   Usará una librería como `facturae-js` para construir el fichero XML.
        *   Necesitarás un certificado digital (fichero `.p12` o `.pfx`) y su contraseña para firmar el XML. Deberás almacenarlos de forma segura en tu servidor.
        *   El endpoint generará el XML, lo firmará con el certificado y lo devolverá como un fichero para que el usuario lo pueda descargar.

### **Paso 4: Modificar el Frontend (Dashboard)**

1.  **Crear Página de "Perfil de Empresa":**
    *   Crea una nueva página en tu dashboard (ej. `/dashboard/settings`) con un formulario donde el usuario pueda introducir sus datos fiscales (NIF, razón social, dirección, etc.).
    *   Este formulario usará la API del **Paso 3.1** para guardar los datos.

2.  **Actualizar la Página de Facturación (`invoices/page.js`):**
    *   Elimina el objeto `issuer` hardcodeado. En su lugar, haz una llamada a la API para obtener los datos del `BusinessProfile` del usuario. Si no existen, muestra un aviso para que complete su perfil.
    *   En la tabla de líneas de factura, añade un campo (puede ser un `select` o un `input`) para que el usuario pueda definir el tipo de IVA/IGIC de cada producto/servicio.
    *   Actualiza la lógica de cálculo para que el `taxAmount` se calcule y se envíe al backend por cada línea.

3.  **Añadir Botón de "Descargar Factura-e":**
    *   Junto a tus botones de "Guardar Factura" y "Exportar a PDF", añade un nuevo botón.
    *   Este botón hará una petición `GET` al endpoint del **Paso 3.3** (`/api/invoices/[id]/facturae`). El navegador recibirá el fichero `.xml` firmado y lo descargará.
