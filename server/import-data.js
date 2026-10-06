const { PrismaClient } = require('@prisma/client');

// Destructive: deletes existing rows first. Refuse unless explicitly confirmed.
if (process.env.CONFIRM_WIPE !== 'yes') {
  console.error('This script DELETES existing data. Back up prisma/dev.db, then run:')
  console.error('  CONFIRM_WIPE=yes node ' + require('path').basename(__filename))
  process.exit(1);
}
const prisma = new PrismaClient();

async function importData() {
  console.log('🌱 Importing real data...');

  await prisma.$transaction([
    prisma.product.deleteMany(),
    prisma.step.deleteMany(),
    prisma.partner.deleteMany(),
    prisma.benefit.deleteMany(),
    prisma.siteConfig.deleteMany(),
    prisma.footerLink.deleteMany(),
    prisma.sectionText.deleteMany(),
  ]);

  await prisma.product.createMany({
    data: [
      { name: '{"uz":"Nutella 350g","ru":"Nutella 350г","en":"Nutella 350g","tr":"Nutella 350g"}', description: '{"uz":"Shokolad-yong\'oq kremi, 350g","ru":"Шоколадно-ореховая паста, 350г","en":"Chocolate hazelnut spread, 350g","tr":"Çikolata fındık kreması, 350g"}', label: '{"uz":"Mashhur","ru":"Популярное","en":"Popular","tr":"Popüler"}', category: 'sweet', gradient: 'from-red-50 to-orange-100', iconColor: '#ef4444', image: '', stock: 300, price: 42000, isTop: true },
      { name: '{"uz":"Barilla Makaron","ru":"Barilla Макароны","en":"Barilla Pasta","tr":"Barilla Makarna"}', description: '{"uz":"Premium sifatli Italiya makaronlari","ru":"Макароны премиум качества из Италии","en":"Premium quality pasta from Italy","tr":"Premium kaliteli İtalyan makarnası"}', label: '{"uz":"Italiya","ru":"Италия","en":"Italy","tr":"İtalya"}', category: 'groceries', gradient: 'from-amber-50 to-orange-100', iconColor: '#d97706', image: '', stock: 500, price: 18500, isTop: true },
      { name: '{"uz":"Ferrero Rocher 16 dona","ru":"Ferrero Rocher 16 шт","en":"Ferrero Rocher 16 pcs","tr":"Ferrero Rocher 16 adet"}', description: '{"uz":"Belgiya shokoladi, 200g","ru":"Бельгийский шоколад, 200г","en":"Belgian chocolate, 200g","tr":"Belçika çikolatası, 200g"}', label: '{"uz":"Sovg\'a uchun","ru":"Для подарка","en":"For gifting","tr":"Hediye için"}', category: 'sweet', gradient: 'from-yellow-50 to-amber-100', iconColor: '#f59e0b', image: '', stock: 200, price: 65000, isTop: true },
      { name: '{"uz":"Nutella B-ready","ru":"Nutella B-ready","en":"Nutella B-ready","tr":"Nutella B-ready"}', description: '{"uz":"Shokolad kremi bilan biskvit","ru":"Бисквит с шоколадным кремом","en":"Biscuit with chocolate cream","tr":"Çikolata kremli bisküvi"}', label: '{"uz":"Yangi","ru":"Новинка","en":"New","tr":"Yeni"}', category: 'snacks', gradient: 'from-orange-50 to-red-100', iconColor: '#ea580c', image: '', stock: 150, price: 28000, isTop: false },
      { name: '{"uz":"Raffaello 15 dona","ru":"Raffaello 15 шт","en":"Raffaello 15 pcs","tr":"Raffaello 15 adet"}', description: '{"uz":"Kokos shokoladi, 150g","ru":"Кокосовый шоколад, 150г","en":"Coconut chocolate, 150g","tr":"Hindistan cevizli çikolata, 150g"}', label: '{"uz":"Kokosli","ru":"С кокосом","en":"Coconut","tr":"Hindistan cevizli"}', category: 'sweet', gradient: 'from-yellow-50 to-amber-100', iconColor: '#f59e0b', image: '', stock: 180, price: 48000, isTop: false },
      { name: '{"uz":"Lavazza Kofe 250g","ru":"Lavazza Кофе 250г","en":"Lavazza Coffee 250g","tr":"Lavazza Kahve 250g"}', description: '{"uz":"Italiya kofesi, dona","ru":"Итальянский кофе, зерно","en":"Italian coffee, beans","tr":"İtalyan kahvesi, çekirdek"}', label: '{"uz":"Premium","ru":"Премиум","en":"Premium","tr":"Premium"}', category: 'beverages', gradient: 'from-stone-100 to-amber-100', iconColor: '#78716c', image: '', stock: 250, price: 52000, isTop: false },
      { name: '{"uz":"Kinder Surprise 3 dona","ru":"Kinder Surprise 3 шт","en":"Kinder Surprise 3 pcs","tr":"Kinder Surprise 3 adet"}', description: '{"uz":"Bolakli shokolad","ru":"Шоколад с сюрпризом","en":"Chocolate with surprise","tr":"Sürprizli çikolata"}', label: '{"uz":"Bolalar uchun","ru":"Для детей","en":"For kids","tr":"Çocuklar için"}', category: 'baby-food', gradient: 'from-blue-50 to-indigo-100', iconColor: '#6366f1', image: '', stock: 400, price: 18000, isTop: false },
      { name: '{"uz":"Tuc Keks 100g","ru":"Tuc Крекер 100г","en":"Tuc Cracker 100g","tr":"Tuc Kraker 100g"}', description: '{"uz":"Tuzli biskvit","ru":"Соленый крекер","en":"Salty cracker","tr":"Tuzlu kraker"}', label: '{"uz":"Snek","ru":"Снек","en":"Snack","tr":"Atıştırmalık"}', category: 'snacks', gradient: 'from-orange-50 to-amber-100', iconColor: '#d97706', image: '', stock: 350, price: 12000, isTop: false },
    ],
  });
  console.log('✅ 8 products (3 top)');

  await prisma.step.createMany({
    data: [
      { num: 1, icon: 'ShoppingCart', title: '{"uz":"Buyurtma bering","ru":"Оформите заказ","en":"Place order","tr":"Sipariş ver"}', text: '{"uz":"Saytimiz orqali kerakli mahsulotlarni tanlang va buyurtma bering","ru":"Выберите нужные продукты и оформите заказ","en":"Select products and place an order","tr":"Web sitemizden ürünleri seçin ve sipariş verin"}' },
      { num: 2, icon: 'Phone', title: '{"uz":"Qo\'ng\'iroq","ru":"Перезвоним","en":"Callback","tr":"Arama"}', text: '{"uz":"Mutaxassislarimiz 15 daqiqa ichida aloqaga chiqadi","ru":"Специалисты свяжутся за 15 минут","en":"Specialists will contact within 15 min","tr":"Uzmanlar 15 dakika içinde arayacak"}' },
      { num: 3, icon: 'Truck', title: '{"uz":"Yetkazib berish","ru":"Доставка","en":"Delivery","tr":"Teslimat"}', text: '{"uz":"O\'zbekiston bo\'ylab tez va xavfsiz yetkazib beramiz","ru":"Доставим по всему Узбекистану","en":"Deliver throughout Uzbekistan","tr":"Özbekistan genelinde teslimat"}' },
      { num: 4, icon: 'Handshake', title: '{"uz":"Hamkorlik","ru":"Сотрудничество","en":"Cooperation","tr":"İşbirliği"}', text: '{"uz":"Uzoq muddatli ishonchli hamkor","ru":"Долгосрочное сотрудничество","en":"Long-term cooperation","tr":"Uzun vadeli işbirliği"}' },
    ],
  });
  console.log('✅ 4 steps');

  await prisma.partner.createMany({
    data: [
      { name: 'Korzinka', type: 'Supermarket', color: '#e63946', image: '', order: 0 },
      { name: 'Makro', type: 'Hypermarket', color: '#0099FF', image: '', order: 1 },
      { name: 'Uzum', type: 'Marketplace', color: '#7b2d8b', image: '', order: 2 },
      { name: 'Selver', type: 'Retail', color: '#388e3c', image: '', order: 3 },
      { name: 'Havas', type: 'Retail chain', color: '#f59e0b', image: '', order: 4 },
      { name: 'Biospirt', type: 'Distributor', color: '#1d3557', image: '', order: 5 },
      { name: 'Apteka', type: 'Pharmacy', color: '#ef4444', image: '', order: 6 },
      { name: 'DON', type: 'Restaurant', color: '#0FA876', image: '', order: 7 },
    ],
  });
  console.log('✅ 8 partners');

  await prisma.benefit.createMany({
    data: [
      { icon: 'ShieldCheck', title: '{"uz":"100% sifat","ru":"100% качество","en":"100% quality","tr":"100% kalite"}', text: '{"uz":"Barcha mahsulotlar qat\'iy sifat nazoratidan o\'tadi","ru":"Строгий контроль качества","en":"Strict quality control","tr":"Katı kalite kontrolü"}', color: '#0099FF', order: 0 },
      { icon: 'Clock', title: '{"uz":"Tezkor yetkazib berish","ru":"Быстрая доставка","en":"Fast delivery","tr":"Hızlı teslimat"}', text: '{"uz":"Buyurtma kuni yetkazib beramiz","ru":"Доставка в день заказа","en":"Same-day delivery","tr":"Gün içinde teslimat"}', color: '#0FA876', order: 1 },
      { icon: 'Leaf', title: '{"uz":"Yangilik kafolati","ru":"Гарантия свежести","en":"Freshness guarantee","tr":"Tazelik garantisi"}', text: '{"uz":"Standartga javob bermasa, almashtiramiz","ru":"Не подходит — заменим","en":"Not suitable — we will replace","tr":"Uygun değilse değiştiririz"}', color: '#0099FF', order: 2 },
      { icon: 'TrendingUp', title: '{"uz":"Eng yaxshi narx","ru":"Лучшая цена","en":"Best price","tr":"En iyi fiyat"}', text: '{"uz":"Raqobatbardosh narxlar","ru":"Конкурентные цены","en":"Competitive prices","tr":"Rekabetçi fiyatlar"}', color: '#f59e0b', order: 3 },
      { icon: 'Truck', title: '{"uz":"O\'zbekiston bo\'ylab","ru":"По всему Узбекистану","en":"Throughout Uzbekistan","tr":"Özbekistan genelinde"}', text: '{"uz":"Viloyatlarga yetkazib beramiz","ru":"Доставка по всем регионам","en":"Delivery to all regions","tr":"Tüm bölgelere teslimat"}', color: '#7b2d8b', order: 4 },
      { icon: 'Award', title: '{"uz":"Sertifikatlangan","ru":"Сертифицировано","en":"Certified","tr":"Sertifikalı"}', text: '{"uz":"ISO standartlariga mos","ru":"Соответствует ISO","en":"ISO compliant","tr":"ISO uyumlu"}', color: '#1d3557', order: 5 },
    ],
  });
  console.log('✅ 6 benefits');

  await prisma.siteConfig.create({
    data: {
      phone: '+998 90 799 73 44',
      email: 'info@iltergroup.uz',
      address: 'Toshkent, Chilonzor tumani, 12-mavze',
      tagline: 'Ishonchli yetkazib beruvchi va sifatli mahsulotlar',
      copyright: '© 2026 Ilter Group',
      devBy: 'Developed by',
      devTeam: 'Ilter Team',
    },
  });
  console.log('✅ Site config');

  await prisma.footerLink.createMany({
    data: [
      { label: 'Biz haqimizda', href: '#why', column: 'about', order: 0 },
      { label: 'Katalog', href: '#catalog', column: 'about', order: 1 },
      { label: 'Ulgurji savdo', href: '#how', column: 'about', order: 2 },
      { label: 'Aloqa', href: '#contact', column: 'about', order: 3 },
      { label: 'Barcha mahsulotlar', href: '#catalog', column: 'products', order: 0 },
      { label: 'Shirinliklar', href: '#catalog', column: 'products', order: 1 },
      { label: 'Non mahsulotlari', href: '#catalog', column: 'products', order: 2 },
      { label: 'Meva-chevar', href: '#catalog', column: 'products', order: 3 },
      { label: '+998 90 799 73 44', href: 'tel:+998907997344', column: 'contacts', order: 0 },
      { label: 'info@iltergroup.uz', href: 'mailto:info@iltergroup.uz', column: 'contacts', order: 1 },
      { label: 'Dush-Shan 09:00-18:00', href: '#', column: 'contacts', order: 2 },
      { label: 'Toshkent, Chilonzor', href: '#', column: 'contacts', order: 3 },
    ],
  });
  console.log('✅ 12 footer links');

  await prisma.sectionText.createMany({
    data: [
      { key: 'why.title', text: '{"uz":"Nima uchun","ru":"Почему","en":"Why","tr":"Neden"}' },
      { key: 'why.title2', text: '{"uz":"bizni tanladilar","ru":"выбирают нас","en":"choose us","tr":"bizi seçiyor"}' },
      { key: 'why.sub', text: '{"uz":"Biz faqat ishonchli ta\'minotchilardan sifatli mahsulotlar taqdim etamiz","ru":"Мы предлагаем качественные продукты только от проверенных поставщиков","en":"We offer quality products only from trusted suppliers","tr":"Sadece güvenilir tedarikçilerden kaliteli ürünler sunuyoruz"}' },
      { key: 'partners.title', text: '{"uz":"Bizning hamkorlar","ru":"Наши партнёры","en":"Our Partners","tr":"Ortaklarımız"}' },
      { key: 'partners.sub', text: '{"uz":"Biz bilan ishonchli hamkorlar","ru":"Надёжные партнёры с нами","en":"Trusted partners with us","tr":"Güvenilir ortaklarımız"}' },
      { key: 'how.title', text: '{"uz":"Biz qanday","ru":"Как мы","en":"How we","tr":"Nasıl"}' },
      { key: 'how.title2', text: '{"uz":"ishlaymiz","ru":"работаем","en":"work","tr":"çalışıyoruz"}' },
      { key: 'how.sub', text: '{"uz":"Buyurtma berishdan yetkazib berishgacha — oddiy va shaffof","ru":"От заказа до доставки — просто и прозрачно","en":"From order to delivery — simple and transparent","tr":"Siparişten teslimata — basit ve şeffaf"}' },
    ],
  });
  console.log('✅ 8 section texts');

  console.log('🎉 All real data imported!');
}

importData().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
