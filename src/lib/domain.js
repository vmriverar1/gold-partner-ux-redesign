const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function deliveryFor(city) {
  return normalize(city) === 'lima'
    ? { label: '2–4 días hábiles', detail: 'Plazo referencial. El asesor confirma la fecha y las condiciones de entrega.' }
    : { label: 'Entrega por confirmar', detail: 'El asesor confirma el transporte, costo y plazo para tu ciudad.' };
}
