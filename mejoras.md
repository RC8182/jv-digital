# Plan de Mejoras Detallado para el Dashboard como Agente de Gestión Inteligente

Este documento es una guía técnica para transformar el dashboard en un agente de gestión proactivo. Cada punto hace referencia a componentes y modelos existentes para asegurar la coherencia y reutilización del código.

---

### **Fase 1: El Dashboard Principal como Centro de Mando (`/dashboard/page.js`)**

**Objetivo:** Convertir la página de inicio del dashboard en un panel de control dinámico que ofrezca una visión 360º del estado de la empresa de un solo vistazo.

**Componente a modificar:** `src/app/[lang]/dashboard/page.js`

**Acciones:**

1.  **Modificar `AgenteDashboard.js` para que sea configurable:**
    *   **Análisis:** Actualmente `AgenteDashboard.js` renderiza una serie de "Boxes" (`ChatBox`, `TaskBox`, etc.) de forma fija. Lo reutilizaremos como base para el nuevo dashboard principal.
    *   **Acción:** Refactorizar `AgenteDashboard.js` para que acepte `props` que definan qué widgets mostrar y en qué configuración (ej. `widgets={['financial', 'tasks', 'alerts']}`). Esto lo hace reutilizable tanto para la vista del agente como para la vista principal.

2.  **Implementar Widgets en la Página Principal:**
    *   **Acción:** En `page.js`, usar el `AgenteDashboard` refactorizado para renderizar una parrilla de nuevos widgets:
        *   **Widget de Resumen Financiero (`FinancialSummaryWidget.js`):**
            *   **Nuevo Componente:** `src/app/[lang]/dashboard/components/FinancialSummaryWidget.js`.
            *   **Lógica:** Debe hacer una llamada a una nueva API (`/api/dashboard/summaries/financial`) que calcule y devuelva: 
                *   Ingresos (facturas `PAID` del mes/trimestre).
                *   Gastos (del `Expense` model en el mismo período).
                *   Beneficio (Ingresos - Gastos).
                *   Total pendiente de cobro (facturas `PENDING` y `OVERDUE`).
            *   **Visualización:** Mostrar estos KPIs de forma clara y usar gráficos de barras o circulares para comparar ingresos vs. gastos.

        *   **Widget de Tareas y Agenda (`TasksAgendaWidget.js`):**
            *   **Nuevo Componente:** `src/app/[lang]/dashboard/components/TasksAgendaWidget.js`.
            *   **Lógica:** Combinará la funcionalidad de `TaskBox.js` y `AgendaBox.js`.
                *   Mostrará las 3 próximas tareas con fecha de vencimiento más cercana (`dueDate`).
                *   Mostrará los eventos de la agenda para el día actual (asumiendo que la agenda se gestiona desde `Task` con una categoría "Agenda" o un modelo similar).
            *   **Reutilización:** Importará y usará la lógica de fetching de datos ya presente en los "Boxes" del agente.

        *   **Widget de Alertas Proactivas (`AgentAlertsWidget.js`):**
            *   **Nuevo Componente:** `src/app/[lang]/dashboard/components/AgentAlertsWidget.js`.
            *   **Lógica:** Este es el corazón del agente proactivo. Llamará a una API (`/api/dashboard/summaries/alerts`) que revisará la base de datos y devolverá una lista de alertas accionables como:
                *   `"La factura #1023 para 'Cliente X' ha vencido hace 5 días."`
                *   `"Tienes 3 gastos subidos esta semana sin categorizar."`
                *   `"No has contactado con 'Cliente Y' en más de 30 días."`

---

### **Fase 2: Automatización del Módulo de Contabilidad**

**Objetivo:** Reducir la carga manual en la gestión de gastos y proporcionar una visión fiscal clara.

1.  **Procesamiento Inteligente de Gastos:**
    *   **Componente a modificar:** `src/app/[lang]/dashboard/agente/components/ExpenseManager.js`.
    *   **Mejora:** Al subir un PDF de un gasto, en lugar de esperar que el usuario rellene todo manualmente, se hará una llamada a una API (`/api/agente/expenses/process-pdf`).
    *   **Lógica de la API:** Esta API usará `openai.js` para extraer del documento: Razón social del proveedor, NIF, fecha, base imponible, tipo de impuesto y total. Con estos datos, pre-rellenará el formulario del `ExpenseManager` para que el usuario solo tenga que validar.

2.  **Cálculo de Impuestos en Tiempo Real:**
    *   **Componente a modificar:** `src/app/[lang]/dashboard/agente/components/FiscalSummary.js`.
    *   **Mejora:** Además de mostrar los totales, añadir una sección "Estimación de Impuestos Trimestrales".
    *   **Lógica:** La API que alimenta este componente deberá calcular:
        *   Total de IVA/IGIC repercutido (de las facturas emitidas en el trimestre actual).
        *   Total de IVA/IGIC soportado (de los gastos del trimestre actual).
        *   Estimación del pago de IVA/IGIC (`repercutido - soportado`).
        *   Estimación del pago a cuenta de IRPF (suma de las retenciones en las facturas).

---

### **Fase 3: Búsqueda Global y Acciones Rápidas**

**Objetivo:** Hacer que la interacción con el dashboard sea más rápida y natural.

1.  **Barra de Búsqueda Universal:**
    *   **Componente a modificar:** `src/app/[lang]/dashboard/DashboardSidebar.js`.
    *   **Mejora:** Añadir un campo de búsqueda en la parte superior de la barra lateral.
    *   **Lógica:** Este no será un filtro simple. Al escribir, llamará a una API de búsqueda global (`/api/dashboard/search?q=...`) que buscará el término en los modelos `Client`, `Invoice` (por número o descripción), `Task` y `Expense`. La API puede usar la IA de `openai.js` para interpretar lenguaje natural (ej. "facturas de cliente Z" o "gastos de luz"). Los resultados se mostrarán en un desplegable debajo de la barra.

2.  **Botón de Acción Rápida (FAB - Floating Action Button):**
    *   **Componente a modificar:** `src/app/[lang]/dashboard/layout.js`.
    *   **Mejora:** Añadir un botón flotante en la esquina inferior derecha.
    *   **Lógica:** Al hacer clic, se abrirá un pequeño modal con un input de texto y botones: "Crear Tarea", "Añadir Gasto", "Nueva Nota". El usuario puede escribir algo como "Llamar a Juan para seguimiento del proyecto X mañana a las 10" y pulsar "Crear Tarea". La petición se envía a una API del agente que interpreta el texto, extrae las entidades (título, cliente, fecha) y redirige al formulario de creación de tareas con los campos ya rellenos.