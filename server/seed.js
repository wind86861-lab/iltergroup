const { PrismaClient } = require('@prisma/client');

// Destructive: deletes existing rows first. Refuse unless explicitly confirmed.
if (process.env.CONFIRM_WIPE !== 'yes') {
  console.error('This script DELETES existing data. Back up prisma/dev.db, then run:')
  console.error('  CONFIRM_WIPE=yes node ' + require('path').basename(__filename))
  process.exit(1);
}
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding...');

  await prisma.step.deleteMany();
  await prisma.step.createMany({
    data: [
      { num: 1, icon: 'ShoppingCart', title: '{"uz":"Buyurtma bering","ru":"Оформите заказ","en":"Place order","tr":"Sipariş ver"}', text: '{"uz":"Saytimiz orqali kerakli mahsulotlarni tanlang va buyurtma bering","ru":"Выберите нужные продукты и оформите заказ","en":"Select products and place an order","tr":"Web sitemizden ürünleri seçin ve sipariş verin"}' },
      { num: 2, icon: 'Phone', title: '{"uz":"Qo\'ng\'iroq","ru":"Перезвоним","en":"Callback","tr":"Arama"}', text: '{"uz":"Mutaxassislarimiz 15 daqiqa ichida aloqaga chiqadi","ru":"Специалисты свяжутся за 15 минут","en":"Specialists will contact within 15 min","tr":"Uzmanlar 15 dakika içinde arayacak"}' },
      { num: 3, icon: 'Truck', title: '{"uz":"Yetkazib berish","ru":"Доставка","en":"Delivery","tr":"Teslimat"}', text: '{"uz":"O\'zbekiston bo\'ylab tez va xavfsiz yetkazib beramiz","ru":"Доставим по всему Узбекистану","en":"Deliver throughout Uzbekistan","tr":"Özbekistan genelinde teslimat"}' },
      { num: 4, icon: 'Handshake', title: '{"uz":"Hamkorlik","ru":"Сотрудничество","en":"Cooperation","tr":"İşbirliği"}', text: '{"uz":"Uzoq muddatli ishonchli hamkor","ru":"Долгосрочное сотрудничество","en":"Long-term cooperation","tr":"Uzun vadeli işbirliği"}' },
    ],
  });
  console.log('✅ Steps');

  await prisma.partner.deleteMany();
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
  console.log('✅ Partners');

  await prisma.benefit.deleteMany();
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
  console.log('✅ Benefits');

  await prisma.siteConfig.deleteMany();
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

  await prisma.footerLink.deleteMany();
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
  console.log('✅ Footer links');

  await prisma.sectionText.deleteMany();
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
  console.log('✅ Section texts');

  console.log('🎉 Done!');
}

seed().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
