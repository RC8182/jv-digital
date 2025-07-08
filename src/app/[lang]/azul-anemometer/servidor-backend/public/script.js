// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Selectores del DOM ---
    const configTab = {
        API_URL: '/api/anemometro/config',
        currentConfigDiv: document.getElementById('current-config'),
        configForm: document.getElementById('config-form'),
        messageDiv: document.getElementById('message'),
        saveButton: document.getElementById('save-button'),
        resetCounterButton: document.getElementById('reset-counter-button'),
        inputFields: {
            wakeTime: document.getElementById('wakeTime'),
            sleepTime: document.getElementById('sleepTime'),
            readDayMs: document.getElementById('readDayMs'),
            readNightMs: document.getElementById('readNightMs'),
            sendDayMs: document.getElementById('sendDayMs'),
            sendNightMs: document.getElementById('sendNightMs'),
            mqttKeepAliveS: document.getElementById('mqttKeepAliveS')
        }
    };

    const diagnosticTab = {
        API_URL: '/api/anemometro/diagnostico',
        runButton: document.getElementById('run-diagnostic-button'),
        getStatusButton: document.getElementById('get-status-button'),
        rebootButton: document.getElementById('reboot-button'),
        outputDiv: document.getElementById('diagnostic-output'),
        API_URL_DIAGNOSTIC: '/api/anemometro/diagnostico',
        API_URL_CONTROL: '/api/anemometro/control'
    };

    const maintenanceTab = {
        resetCountSpan: document.getElementById('reset-count-valor')
    };

    const alertsTab = {
        container: document.getElementById('alerts-container')
    };
    
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    const logsTab = {
        outputDiv: document.getElementById('logs-output')
    };

    const rebootBanner = document.getElementById('reboot-status-banner');

    let lastDeviceState = {};
    let rebootConfirmationTimeout = null;
    let countdownInterval = null;

    const ws = new WebSocket(`ws://${window.location.host}`);

    // --- Estado en Tiempo Real ---
    const estado = {
        velocidad: document.getElementById('velocidad-valor'),
        direccion: document.getElementById('direccion-valor'),
        bateria: document.getElementById('bateria-valor'),
        voltaje: document.getElementById('voltaje-valor'),
        modo: document.getElementById('modo-valor'),
        rssi: document.getElementById('rssi-valor'),
        timestamp: document.getElementById('timestamp-valor')
    };

    function actualizarEstado(datos) {
        if (!datos) return;
        estado.velocidad.textContent = datos.velocidad?.toFixed(2) ?? '--';
        estado.direccion.textContent = datos.direccion ?? '--';
        estado.bateria.textContent = datos.bateria_pct ?? '--';
        estado.voltaje.textContent = datos.volt_mV ?? '--';
        estado.modo.textContent = datos.mode === 'day' ? 'Día' : (datos.mode === 'night' ? 'Noche' : '--');
        estado.rssi.textContent = datos.rssi_dBm ?? '--';
        estado.timestamp.textContent = datos.timestamp ? new Date(datos.timestamp).toLocaleString() : '--';

        // Colores y estilos
        estado.modo.className = '';
        if (datos.mode === 'day') estado.modo.classList.add('day');
        if (datos.mode === 'night') estado.modo.classList.add('night');
        estado.bateria.className = '';
        if (datos.bateria_pct !== undefined && datos.bateria_pct < 20) estado.bateria.classList.add('low');
        estado.rssi.className = '';
        if (datos.rssi_dBm !== undefined) {
            if (datos.rssi_dBm > -70) estado.rssi.classList.add('good');
            else if (datos.rssi_dBm > -85) estado.rssi.classList.add('medium');
            else estado.rssi.classList.add('weak');
        }
    }

    async function fetchEstadoTiempoReal() {
        try {
            const resp = await fetch('https://azul-kite.ddns.net/api/anemometro/raw');
            if (!resp.ok) throw new Error('No se pudo obtener el estado');
            const datos = await resp.json();
            if (Array.isArray(datos) && datos.length > 0) {
                actualizarEstado(datos[0]); // El más reciente
            }
        } catch (e) {
            console.error('Error obteniendo estado tiempo real:', e);
        }
    }
    setInterval(fetchEstadoTiempoReal, 5000);
    fetchEstadoTiempoReal();

    // --- Navegación por Pestañas ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');

            const target = document.getElementById(tab.dataset.tab);
            tabContents.forEach(content => content.classList.remove('active'));
            target.classList.add('active');
        });
    });

    // --- Funciones de conversión de unidades ---
    function msToSeconds(ms) {
        return ms / 1000;
    }
    function secondsToMs(s) {
        return s * 1000;
    }
    function msToMinutes(ms) {
        return ms / (1000 * 60);
    }
    function minutesToMs(min) {
        return min * (1000 * 60);
    }
    // ------------------------------------------

    // --- Pestaña de Configuración ---
    function showMessage(msg, type = 'info') {
        configTab.messageDiv.textContent = msg;
        configTab.messageDiv.className = `message ${type} show`;
        setTimeout(() => {
            configTab.messageDiv.className = 'message';
        }, 5000);
    }

    async function fetchConfig() {
        configTab.currentConfigDiv.innerHTML = '<p>Cargando...</p>';
        try {
            const response = await fetch(configTab.API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const config = await response.json();
            
            if (Object.keys(config).length === 0) {
                configTab.currentConfigDiv.innerHTML = '<p>No hay configuración guardada. Se usarán los valores por defecto del firmware.</p>';
            } else {
                configTab.currentConfigDiv.innerHTML = `<pre>${JSON.stringify(config, null, 2)}</pre>`;
                
                const { wakeTime, sleepTime, readDayMs, readNightMs, sendDayMs, sendNightMs, mqttKeepAliveS } = configTab.inputFields;
                if (config.hasOwnProperty('wakeTime')) wakeTime.value = config.wakeTime;
                if (config.hasOwnProperty('sleepTime')) sleepTime.value = config.sleepTime;
                if (config.hasOwnProperty('readDayMs')) readDayMs.value = msToSeconds(config.readDayMs);
                if (config.hasOwnProperty('readNightMs')) readNightMs.value = msToSeconds(config.readNightMs);
                if (config.hasOwnProperty('sendDayMs')) sendDayMs.value = msToMinutes(config.sendDayMs);
                if (config.hasOwnProperty('sendNightMs')) sendNightMs.value = msToMinutes(config.sendNightMs);
                if (config.hasOwnProperty('mqttKeepAliveS')) mqttKeepAliveS.value = config.mqttKeepAliveS;
            }
        } catch (error) {
            console.error('Error fetching configuration:', error);
            configTab.currentConfigDiv.innerHTML = '<p style="color: red;">Error al cargar la configuración.</p>';
            showMessage('Error al cargar la configuración.', 'error');
        }
    }

    configTab.configForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        configTab.saveButton.disabled = true;
        configTab.saveButton.textContent = 'Guardando...';
        showMessage('Guardando configuración...', 'info');

        const { wakeTime, sleepTime, readDayMs, readNightMs, sendDayMs, sendNightMs, mqttKeepAliveS } = configTab.inputFields;
        const newConfig = {
            wakeTime: wakeTime.value,
            sleepTime: sleepTime.value,
            readDayMs: secondsToMs(parseInt(readDayMs.value, 10)),
            readNightMs: secondsToMs(parseInt(readNightMs.value, 10)),
            sendDayMs: minutesToMs(parseInt(sendDayMs.value, 10)),
            sendNightMs: minutesToMs(parseInt(sendNightMs.value, 10)),
            mqttKeepAliveS: parseInt(mqttKeepAliveS.value, 10)
        };

        try {
            const response = await fetch(configTab.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            const data = await response.json();
            if (response.ok) {
                showMessage(data.message, 'success');
                fetchConfig();
            } else {
                showMessage(`Error: ${data.error || 'Algo salió mal.'}`, 'error');
            }
        } catch (error) {
            console.error('Error saving configuration:', error);
            showMessage('Error de conexión al guardar la configuración.', 'error');
        } finally {
            configTab.saveButton.disabled = false;
            configTab.saveButton.textContent = 'Guardar Configuración';
        }
    });

    configTab.resetCounterButton.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de que quieres poner el contador de reinicios a 0? Esta acción es permanente.')) {
            showMessage('Enviando comando para resetear el contador...', 'info');
             try {
                const response = await fetch(diagnosticTab.API_URL_CONTROL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comando: 'reset_rst_count' })
                });
                const data = await response.json();
                if (response.ok) {
                    showMessage(data.message, 'success');
                } else {
                    showMessage(`Error: ${data.error || 'Algo salió mal.'}`, 'error');
                }
            } catch (error) {
                console.error('Error enviando comando:', error);
                showMessage('Error de conexión al enviar el comando.', 'error');
            }
        }
    });

    // --- WebSocket para Alertas y Diagnóstico en Tiempo Real ---
    function setupWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('Conectado al servidor de WebSocket.');
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert info';
            alertDiv.textContent = `Conexión establecida con el servidor a las ${new Date().toLocaleTimeString()}`;
            alertsTab.container.prepend(alertDiv);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Mensaje recibido:', data);

            // Almacenar el último estado del dispositivo
            if (data.type === 'data' && data.payload && data.payload.sys) {
                lastDeviceState = data.payload.sys;
                
                // Actualizar contador de reinicios en la pestaña de mantenimiento
                if (maintenanceTab.resetCountSpan && lastDeviceState.reset_count !== undefined) {
                    maintenanceTab.resetCountSpan.textContent = lastDeviceState.reset_count;
                }

                // Comprobar si estábamos esperando una confirmación de reinicio
                if (rebootConfirmationTimeout && lastDeviceState.reset_count > window.rebootInitialResetCount) {
                    console.log('Reinicio confirmado! Nuevo reset_count:', lastDeviceState.reset_count);
                    clearTimeout(rebootConfirmationTimeout);
                    rebootBanner.style.display = 'none';
                    showMessage('Dispositivo reiniciado con éxito!', 'success');
                    rebootConfirmationTimeout = null;
                }
            }

            switch (data.type) {
                case 'alert':
                    handleAlert(data);
                    break;
                case 'diag_start':
                    diagnosticTab.outputDiv.innerHTML = `<p>${data.message}</p>`;
                    break;
                case 'diag_update':
                    updateDiagnosticView(data.payload);
                    break;
                case 'diag_end':
                    // El resultado final completo ya se muestra con los updates.
                    // Opcionalmente, mostrar un resumen final.
                    diagnosticTab.runButton.disabled = false;
                    diagnosticTab.runButton.textContent = 'Ejecutar Diagnóstico';
                    break;
                case 'log':
                    const logEntry = document.createElement('div');
                    logEntry.textContent = data.message;
                    logsTab.outputDiv.appendChild(logEntry);
                    // Auto-scroll
                    logsTab.outputDiv.scrollTop = logsTab.outputDiv.scrollHeight;
                    break;
                case 'diagnostic':
                    const output = data.isError ? `<p class="error">${data.output}</p>` : `<pre>${data.output}</pre>`;
                    diagnosticTab.outputDiv.innerHTML = output;
                    break;
            }
        };

        ws.onclose = () => {
            console.log('Desconectado del servidor de WebSocket. Intentando reconectar en 5 segundos...');
            setTimeout(setupWebSocket, 5000);
        };

        ws.onerror = (error) => {
            console.error('Error en WebSocket:', error);
            ws.close();
        };
    }

    function handleAlert(alertData) {
        if (alertsTab.container.querySelector('p')) {
            alertsTab.container.innerHTML = ''; // Limpiar mensaje inicial
        }
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertData.level || 'info'}`;
        alertDiv.textContent = `[${new Date().toLocaleString()}] ${alertData.message}`;
        alertsTab.container.prepend(alertDiv);
    }

    let diagnosticState = {};
    function updateDiagnosticView(update) {
        if (diagnosticTab.outputDiv.querySelector('p')) {
            diagnosticTab.outputDiv.innerHTML = ''; // Limpiar mensaje inicial
        }
        diagnosticState[update.component] = { status: update.status, details: update.details };
        
        // Regenerar la vista del diagnóstico
        diagnosticTab.outputDiv.innerHTML = `<pre>${JSON.stringify(diagnosticState, null, 2)}</pre>`;
    }

    // --- Pestaña de Diagnóstico ---
    diagnosticTab.runButton.addEventListener('click', () => {
        diagnosticTab.outputDiv.innerHTML = '<p>Ejecutando diagnóstico... Por favor, espera.</p>';
        fetch(diagnosticTab.API_URL_DIAGNOSTIC)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error del servidor: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // Formatear la salida JSON con indentación
                diagnosticTab.outputDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            })
            .catch(error => {
                console.error('Error en el diagnóstico:', error);
                diagnosticTab.outputDiv.innerHTML = `<p class="error">Error al iniciar el diagnóstico: ${error.message}</p>`;
            });
    });

    diagnosticTab.getStatusButton.addEventListener('click', async () => {
        const logEntry = document.createElement('div');
        logEntry.textContent = '-> Solicitando estado y logs acumulados al dispositivo...';
        logsTab.outputDiv.appendChild(logEntry);
        logsTab.outputDiv.scrollTop = logsTab.outputDiv.scrollHeight;

        try {
            const response = await fetch(diagnosticTab.API_URL_CONTROL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comando: 'get_status' })
            });
            const data = await response.json();
            if (!response.ok) {
                 showMessage(`Error: ${data.error || 'Algo salió mal.'}`, 'error');
            }
        } catch (error) {
            console.error('Error solicitando estado:', error);
            showMessage('Error de conexión al solicitar estado.', 'error');
        }
    });

    diagnosticTab.rebootButton.addEventListener('click', () => {
        if (!confirm('¿Estás seguro de que quieres reiniciar el dispositivo? Esta acción no se puede deshacer.')) {
            return;
        }

        console.log('Iniciando secuencia de reinicio...');
        window.rebootInitialResetCount = lastDeviceState.reset_count || 0;
        console.log('Contador de reinicio inicial:', window.rebootInitialResetCount);

        // Mostrar banner con mensaje inicial
        rebootBanner.textContent = `Enviando comando de reinicio...`;
        rebootBanner.style.display = 'block';

        // Enviar comando al servidor
        fetch(diagnosticTab.API_URL_CONTROL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comando: 'force_reboot' })
        })
        .then(response => {
            console.log('Respuesta del servidor recibida:', response);
            if (!response.ok) {
                // Capturar el cuerpo del error para mostrarlo
                return response.json().then(err => {
                    throw new Error(err.error || 'El servidor respondió con un error.');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Comando planificado con éxito:', data.message);
            
            // Comando aceptado, actualizar banner y esperar confirmación del dispositivo
            const mode = lastDeviceState.mode === 'day' ? 'Día' : 'Noche';
            // Usamos el intervalo de envío actual que reporta el dispositivo
            const waitSeconds = lastDeviceState.interval_s || 600; // Por defecto 10 min si no hay datos
            const waitMinutes = Math.ceil(waitSeconds / 60);

            rebootBanner.textContent = `Reinicio planificado. Modo actual: ${mode}. El reinicio se ejecutará en un máximo de ${waitMinutes} minutos.`;

            // Limpiar timer anterior por si acaso
            clearTimeout(rebootConfirmationTimeout);

            // Timeout para la confirmación final
            rebootConfirmationTimeout = setTimeout(() => {
                rebootBanner.style.display = 'none';
                showMessage('No se pudo confirmar el reinicio del dispositivo. Puede que tarde más en conectar.', 'error');
                rebootConfirmationTimeout = null;
            }, (waitSeconds + 30) * 1000); // Timeout = intervalo de envío + 30s de margen
        })
        .catch(error => {
            console.error('Error en la secuencia de reinicio:', error);
            rebootBanner.style.display = 'none';
            showMessage(`Error al planificar reinicio: ${error.message}`, 'error');
        });
    });

    // --- Carga Inicial ---
    async function fetchInitialState() {
        try {
            const response = await fetch('/api/anemometro/state');
            if (!response.ok) return;
            const state = await response.json();
            if (state && state.reset_count !== undefined) {
                maintenanceTab.resetCountSpan.textContent = state.reset_count;
            }
        } catch (error) {
            console.error('Error fetching initial state:', error);
        }
    }

    async function fetchHistoricalLogs() {
        try {
            const response = await fetch('/api/anemometro/logs?limit=50');
            if (!response.ok) return;
            const logs = await response.json();
            
            logsTab.outputDiv.innerHTML = ''; // Limpiar logs en vivo
            logs.forEach(log => {
                const logEntry = document.createElement('div');
                const logTime = new Date(log.timestamp).toLocaleString();
                let logContent = `[${logTime}] MODO:${log.mode}, BLE:${log.ble_ok ? 'OK' : 'FAIL'}, RSSI:${log.rssi_dBm ?? 'N/A'}`;
                if (log.ble_fails > 0 || log.mqtt_fails > 0) {
                    logContent += ` (Fails: BLE ${log.ble_fails}, MQTT ${log.mqtt_fails})`;
                }
                if (log.reset_reason) {
                    logContent += ` | REASON: ${log.reset_reason}`;
                }
                if (log.reset_count !== undefined && log.reset_count !== null) {
                    logContent += ` | REINICIOS: ${log.reset_count}`;
                }
                if (log.uptime_s !== undefined && log.uptime_s !== null) {
                    logContent += ` | UPTIME: ${log.uptime_s}s`;
                }
                if (log.heap_free !== undefined && log.heap_free !== null) {
                    logContent += ` | HEAP: ${log.heap_free}`;
                }
                logEntry.textContent = logContent;
                if (log.ble_ok === 0 || log.reset_reason) {
                    logEntry.style.color = '#ef4444'; // Resaltar logs importantes
                }
                logsTab.outputDiv.appendChild(logEntry);
            });
             logsTab.outputDiv.scrollTop = logsTab.outputDiv.scrollHeight;
        } catch (error) {
            console.error('Error fetching historical logs:', error);
        }
    }

    fetchConfig();
    fetchInitialState();
    fetchHistoricalLogs();
    setupWebSocket(); // Iniciar WebSocket
}); 