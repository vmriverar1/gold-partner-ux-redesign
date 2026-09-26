// Seed catalogue. Stock, use groups and uniform warranty are demonstration data.
// priceKind distinguishes source prices from demonstration prices.
export const products = [
  { id: 'lenovo-v15-ryzen3', sku: 'NBLEN82YU00X4LM', category: 'laptops', name: 'Lenovo V15 G4 · Ryzen 3', brand: 'Lenovo', price: 2093, ram: 8, storage: 256, os: 'Sin sistema operativo', processor: 'AMD Ryzen 3 7320U', screen: '15.6″ FHD · TN', stock: 9, warranty: '12 meses', uses: ['estudio', 'trabajo'], image: '/assets/NBLEN82YU00X4LM.webp', gallery: ['/assets/NBLEN82YU00X4LM.webp'], priceKind: 'snapshot' },
  { id: 'lenovo-v15-athlon', sku: 'NBLEN82YU00X5LM', category: 'laptops', name: 'Lenovo V15 G4 · Athlon', brand: 'Lenovo', price: 2222, ram: 8, storage: 256, os: 'Sin sistema operativo', processor: 'AMD Athlon Silver 7120U', screen: '15.6″ FHD · TN', stock: 5, warranty: '12 meses', uses: ['estudio'], image: '/assets/NBLEN82YU00X5LM.webp', gallery: ['/assets/NBLEN82YU00X5LM.webp'], priceKind: 'snapshot' },
  { id: 'ideapad-slim3-i3', sku: 'NBLEN82XB003MLM', category: 'laptops', name: 'Lenovo IdeaPad Slim 3 · Core i3', brand: 'Lenovo', price: 2321, ram: 8, storage: 512, os: 'Sin sistema operativo', processor: 'Intel Core i3-N305', screen: '15.6″ FHD · TN', stock: 7, warranty: '12 meses', uses: ['estudio', 'trabajo'], image: '/assets/NBLEN82XB003MLM.webp', gallery: ['/assets/NBLEN82XB003MLM.webp'], priceKind: 'snapshot' },
  { id: 'lenovo-v15-ryzen5-8gb', sku: 'NBLEN82YU00X6LM', category: 'laptops', name: 'Lenovo V15 G4 · Ryzen 5 / 8 GB', brand: 'Lenovo', price: 2601, ram: 8, storage: 256, os: 'Sin sistema operativo', processor: 'AMD Ryzen 5 7520U', screen: '15.6″ FHD · TN', stock: 8, warranty: '12 meses', uses: ['estudio', 'trabajo'], image: '/assets/NBLEN82YU00X6LM.webp', gallery: ['/assets/NBLEN82YU00X6LM.webp'], priceKind: 'snapshot' },
  { id: 'ideapad-slim3-ryzen5', sku: 'NBLEN82XQ00N6LM', category: 'laptops', name: 'Lenovo IdeaPad Slim 3 · Ryzen 5', brand: 'Lenovo', price: 2790, ram: 16, storage: 512, os: 'FreeDOS', processor: 'AMD Ryzen 5 7520U', screen: '15.6″ FHD · TN', stock: 4, warranty: '12 meses', uses: ['estudio', 'trabajo'], image: '/assets/NBLEN82XQ00N6LM.webp', gallery: ['/assets/NBLEN82XQ00N6LM.webp', '/assets/NBLEN82XQ00N6LM-detail.webp'], priceKind: 'snapshot' },
  { id: 'lenovo-v15-ryzen7', sku: 'NBLEN82YY002YLM', category: 'laptops', name: 'Lenovo V15 G4 · Ryzen 7', brand: 'Lenovo', price: 2919, ram: 16, storage: 512, os: 'Sin sistema operativo', processor: 'AMD Ryzen 7 7730U', screen: '15.6″ FHD · TN', stock: 3, warranty: '12 meses', uses: ['estudio', 'trabajo', 'diseno'], image: '/assets/NBLEN82YY002YLM.webp', gallery: ['/assets/NBLEN82YY002YLM.webp'], priceKind: 'snapshot' },
  { id: 'lenovo-v15-ryzen5-16gb', sku: 'NBLEN82YU00XYLM', category: 'laptops', name: 'Lenovo V15 G4 · Ryzen 5 / 16 GB', brand: 'Lenovo', price: 3005, ram: 16, storage: 512, os: 'Sin sistema operativo', processor: 'AMD Ryzen 5 7520U', screen: '15.6″ FHD · TN', stock: 6, warranty: '12 meses', uses: ['estudio', 'trabajo'], image: '/assets/NBLEN82YU00XYLM.webp', gallery: ['/assets/NBLEN82YU00XYLM.webp'], priceKind: 'snapshot' },
  { id: 'hp-victus-15', sku: 'NBHPBT4F6LA', category: 'laptops', name: 'HP Victus 15-fb3019la', brand: 'HP', price: 3731, ram: 8, storage: 512, os: 'FreeDOS', processor: 'AMD Ryzen 7 7445HS · RTX 3050', screen: '15.6″ FHD · IPS · 144 Hz', stock: 2, warranty: '12 meses', uses: ['trabajo', 'diseno', 'juegos'], image: '/assets/NBHPBT4F6LA.webp', gallery: ['/assets/NBHPBT4F6LA.webp'], priceKind: 'snapshot' },
  { id: 'hp-elitebook-840', sku: 'NBHPA1UP3LTABM', category: 'laptops', name: 'HP EliteBook 840 G11', brand: 'HP', price: 7281, ram: 16, storage: 1024, os: 'Windows 11 Pro', processor: 'Intel Core Ultra 7 155U', screen: '14″ WUXGA · Táctil', stock: 5, warranty: '12 meses', uses: ['trabajo', 'diseno'], image: '/assets/NBHPA1UP3LTABM.webp', gallery: ['/assets/NBHPA1UP3LTABM.webp'], priceKind: 'snapshot' },
  { id: 'teros-te2415s', sku: 'MON238FTE2415S', category: 'monitores', name: 'Teros TE-2415S · 23.8″', brand: 'Teros', price: 349, ram: null, storage: null, os: null, processor: null, screen: '23.8″ FHD · IPS · 120 Hz', stock: 10, warranty: '12 meses', uses: ['estudio', 'trabajo', 'juegos'], image: '/assets/MON238FTE2415S.webp', gallery: ['/assets/MON238FTE2415S.webp'], summary: 'IPS Full HD · 120 Hz · HDMI y DisplayPort', priceKind: 'demonstration' },
  { id: 'hp-smart-tank790', sku: 'PRHPSMART790', category: 'impresoras', name: 'HP Smart Tank 790', brand: 'HP', price: 1399, ram: null, storage: null, os: null, processor: null, screen: null, stock: 6, warranty: '12 meses', uses: ['estudio', 'trabajo'], image: '/assets/PRHPSMART790.webp', gallery: ['/assets/PRHPSMART790.webp'], summary: 'Tanque de tinta · Impresión, copia, escaneo y fax · Wi-Fi', priceKind: 'demonstration' },
  { id: 'lenovo-m210', sku: 'MSLENGY51M74265', category: 'accesorios', name: 'Lenovo M210 RGB Gaming Mouse', brand: 'Lenovo', price: 69, ram: null, storage: null, os: null, processor: null, screen: null, stock: 12, warranty: '12 meses', uses: ['estudio', 'trabajo', 'diseno', 'juegos'], image: '/assets/MSLENGY51M74265.webp', gallery: ['/assets/MSLENGY51M74265.webp'], summary: 'Mouse gamer RGB · Sensor óptico · Hasta 8,000 DPI', priceKind: 'demonstration' },
];

export const categories = [
  { id: 'laptops', title: 'Laptops', description: 'Tu próximo equipo, para llevarlo contigo.', image: '/assets/NBLEN82XQ00N6LM.webp', icon: 'laptop' },
  { id: 'monitores', title: 'Monitores', description: 'Más espacio para tus ideas y tus tareas.', image: '/assets/MON238FTE2415S.webp', icon: 'monitor' },
  { id: 'impresoras', title: 'Impresoras', description: 'Documentos listos para estudiar y trabajar.', image: '/assets/PRHPSMART790.webp', icon: 'printer' },
  { id: 'accesorios', title: 'Accesorios', description: 'Los detalles que completan tu espacio.', image: '/assets/MSLENGY51M74265.webp', icon: 'mouse' },
];

export const uses = [
  { id: 'estudio', label: 'Estudio', description: 'Clases, documentos y tareas diarias.', icon: 'graduation-cap' },
  { id: 'trabajo', label: 'Trabajo / oficina', description: 'Productividad, reuniones y multitarea.', icon: 'briefcase' },
  { id: 'diseno', label: 'Diseño y video', description: 'Herramientas creativas y edición.', icon: 'palette' },
  { id: 'juegos', label: 'Juegos', description: 'Equipos y accesorios para jugar.', icon: 'gamepad-2' },
];

export const cities = ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Iquitos', 'Otra ciudad'];

export const company = {
  name: 'Gold Partner Perú S.A.C.', whatsapp: '51963718705', phone: '(01) 711-8255', email: 'ventas@gpperu.com',
  address: 'Calle Dean Valdivia 148, Edificio Platinum Plaza Torre I, piso 11, San Isidro, Lima', logo: '/assets/logo.webp',
};
