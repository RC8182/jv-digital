import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), '.preset-state.json');

// Función para leer el estado actual
function readPresetState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      return state.presetsDisabled || false;
    }
    return false;
  } catch (error) {
    console.error('Error leyendo estado de presets:', error);
    return false;
  }
}

// Función para escribir el estado
function writePresetState(presetsDisabled) {
  try {
    const state = { presetsDisabled };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    return true;
  } catch (error) {
    console.error('Error escribiendo estado de presets:', error);
    return false;
  }
}

// GET: Obtener el estado actual
export async function GET() {
  const presetsDisabled = readPresetState();
  return NextResponse.json({ presetsDisabled });
}

// POST: Actualizar el estado
export async function POST(req) {
  try {
    const { presetsDisabled } = await req.json();
    
    if (typeof presetsDisabled !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'presetsDisabled debe ser un booleano' 
      }, { status: 400 });
    }
    
    const success = writePresetState(presetsDisabled);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        presetsDisabled,
        message: presetsDisabled ? 'Presets deshabilitados' : 'Presets habilitados'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Error al guardar el estado' 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error procesando la solicitud' 
    }, { status: 500 });
  }
} 