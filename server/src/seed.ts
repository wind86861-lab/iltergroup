import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding database...')

  // ── Steps ──
  const stepsCount = await prisma.step.count()
  if (stepsCount === 0) {
    await prisma.step.createMany({
      data: [
        { num: 1, icon: 'ShoppingCart', title: '{"uz":"Buyurtma bering","ru":"Оформите заказ","en":"Place order","tr":"Sipariş ver"}', text: '{"uz":"Saytimiz orqali kerakli mahsulotlarni tanlang va buyurtma bering","ru":"Выберите нужные продукты на нашем сайте и оформите заказ","en":"Select the products you need on our website and place an order","tr":"Web sitemizden ihtiyacınız olan ürünleri seçin ve sipariş verin"}' },
        { num: 2, icon: 'Phone', title: '{"uz":"Biz sizga qo\'ng\'iroq qilamiz","ru":"Мы вам перезвоним","en":"We will call you back","tr":"Sizi arayacağız"}', text: '{"uz":"Mutaxassislarimiz 15 daqiqa ichida siz bilan bog\'lanadi","ru":"Наши специалисты свяжутся с вами в течение 15 минут","en":"Our specialists will contact you within 15 minutes","tr":"Uzmanlarımız 15 dakika içinde sizinle iletişime geçecek"}' },
        { num: 3, icon: 'Truck', title: '{"uz":"Yetkazib berish","ru":"Доставка","en":"Delivery","tr":"Teslimat"}', text: '{"uz":"Buyurtmangizni O\'zbekiston bo\'ylab tez va xavfsiz yetkazib beramiz","ru":"Доставим ваш заказ быстро и безопасно по всему Узбекистану","en":"We will deliver your order quickly and safely throughout Uzbekistan","tr":"Siparişinizi Özbekistan genelinde hızlı ve güvenli bir şekilde teslim edeceğiz"}' },
        { num: 4, icon: 'Handshake', title: '{"uz":"Hamkorlik","ru":"Сотрудничество","en":"Cooperation","tr":"İşbirliği"}', text: '{"uz":"Uzoq muddatli hamkorlik va ishonchli yetkazib beruvchi","ru":"Долгосрочное сотрудничество и надежный поставщик","en":"Long-term cooperation and reliable supplier","tr":"Uzun vadeli işbirliği ve güvenilir tedarikçi"}' },
      ],
    })
    console.log('✅ Steps seeded')
  }

  // ── Partners ──
  const partnersCount = await prisma.partner.count()
  if (partnersCount === 0) {
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
    })
    console.log('✅ Partners seeded')
  }

  // ── Benefits ──
  const benefitsCount = await prisma.benefit.count()
  if (benefitsCount === 0) {
    await prisma.benefit.createMany({
      data: [
        { icon: 'ShieldCheck', title: '{"uz":"100% sifat","ru":"100% качество","en":"100% quality","tr":"100% kalite"}', text: '{"uz":"Barcha mahsulotlar qat\'iy sifat nazoratidan o\'tadi. Faqat ishonchli va barqaror ishlab chiqaruvchilar bilan ishlaymiz.","ru":"Все продукты проходят строгий контроль качества. Работаем только с проверенными и стабильными производителями.","en":"All products undergo strict quality control. We work only with verified and stable manufacturers.","tr":"Tüm ürünler katı kalite kontrolünden geçer. Sadece doğrulanmış ve istikrarlı üreticilerle çalışıyoruz."}', color: '#0099FF', order: 0 },
        { icon: 'Clock', title: '{"uz":"Tezkor yetkazib berish","ru":"Быстрая доставка","en":"Fast delivery","tr":"Hızlı teslimat"}', text: '{"uz":"Yangi mahsulotlarni buyurtma kuni yetkazamiz. Xaridoringiz doimo o\'z vaqtida va mukammal holatda yetib keladi.","ru":"Доставляем свежие продукты в день заказа. Ваши покупки всегда приходят вовремя и в идеальном состоянии.","en":"We deliver fresh products on the day of order. Your purchases always arrive on time and in perfect condition.","tr":"Sipariş günü taze ürünleri teslim ediyoruz. Alışverişleriniz her zaman zamanında ve mükemmel durumda gelir."}', color: '#0FA876', order: 1 },
        { icon: 'Leaf', title: '{"uz":"Yangilik kafolati","ru":"Гарантия свежести","en":"Freshness guarantee","tr":"Tazelik garantisi"}', text: '{"uz":"Mahsulot standartlarimizga javob bermasa, biz uni darhol almashtiramiz yoki pul qaytarib beramiz.","ru":"Если продукт не соответствует нашим стандартам, мы сразу заменим его или вернём деньги.","en":"If the product does not meet our standards, we will immediately replace it or refund your money.","tr":"Ürün standartlarımıza uymazsa, hemen değiştiririz veya paranızı iade ederiz."}', color: '#0099FF', order: 2 },
        { icon: 'TrendingUp', title: '{"uz":"Eng yaxshi narx","ru":"Лучшая цена","en":"Best price","tr":"En iyi fiyat"}', text: '{"uz":"Taklif etgan narxlarda har doim raqobatbardoshlik. Ulgurji va chakana xaridlar uchun maxsus shartlar.","ru":"Конкурентоспособность по предлагаемым ценам. Специальные условия для оптовых и розничных закупок.","en":"Competitiveness in offered prices. Special conditions for wholesale and retail purchases.","tr":"Sunulan fiyatlarda rekabetçilik. Toptan ve perakende satın alımlar için özel koşullar."}', color: '#f59e0b', order: 3 },
        { icon: 'Truck', title: '{"uz":"O\'zbekiston bo\'ylab","ru":"По всему Узбекистану","en":"Throughout Uzbekistan","tr":"Özbekistan genelinde"}', text: '{"uz":"Toshkent va viloyatlarga professional yetkazib berish xizmati. Har qanday hajmdagi buyurtmalar.","ru":"Профессиональная доставка в Ташкент и регионы. Заказы любого объема.","en":"Professional delivery to Tashkent and regions. Orders of any volume.","tr":"Taşkent ve bölgelere profesyonel teslimat. Her hacimde siparişler."}', color: '#7b2d8b', order: 4 },
        { icon: 'Award', title: '{"uz":"Sertifikatlangan","ru":"Сертифицировано","en":"Certified","tr":"Sertifikalı"}', text: '{"uz":"Barcha mahsulotlar xalqaro ISO standartlariga mos keladi va to\'liq hujjatlashtirilgan.","ru":"Все продукты соответствуют международным стандартам ISO и полностью документированы.","en":"All products comply with international ISO standards and are fully documented.","tr":"Tüm ürünler uluslararası ISO standartlarına uygun ve tamamen dokümante edilmiştir."}', color: '#1d3557', order: 5 },
      ],
    })
    console.log('✅ Benefits seeded')
  }

  // ── Site Config ──
  const config = await prisma.siteConfig.findFirst()
  if (!config) {
    await prisma.siteConfig.create({
      data: {
        phone: '+998 90 799 73 44',
        email: 'info@iltergroup.uz',
        address: 'Toshkent shahri, Chilonzor tumani, 12-mavze',
        tagline: 'Ishonchli yetkazib beruvchi va sifatli mahsulotlar. Biz har kuni ishonch bilan ishlaymiz.',
        copyright: '© 2026 Ilter Group',
        devBy: 'Developed by',
        devTeam: 'Ilter Team',
      },
    })
    console.log('✅ Site config seeded')
  }

  // ── Footer Links ──
  const linksCount = await prisma.footerLink.count()
  if (linksCount === 0) {
    await prisma.footerLink.createMany({
      data: [
        // About column
        { label: 'Biz haqimizda', href: '#why', column: 'about', order: 0 },
        { label: 'Katalog', href: '#catalog', column: 'about', order: 1 },
        { label: 'Ulgurji savdo', href: '#how', column: 'about', order: 2 },
        { label: 'Aloqa', href: '#contact', column: 'about', order: 3 },
        // Products column
        { label: 'Barcha mahsulotlar', href: '#catalog', column: 'products', order: 0 },
        { label: 'Shirinliklar', href: '#catalog', column: 'products', order: 1 },
        { label: 'Non mahsulotlari', href: '#catalog', column: 'products', order: 2 },
        { label: 'Meva-chevar', href: '#catalog', column: 'products', order: 3 },
        // Contacts column
        { label: '+998 90 799 73 44', href: 'tel:+998907997344', column: 'contacts', order: 0 },
        { label: 'info@iltergroup.uz', href: 'mailto:info@iltergroup.uz', column: 'contacts', order: 1 },
        { label: 'Dush-Shan 09:00-18:00', href: '#', column: 'contacts', order: 2 },
        { label: 'Toshkent, Chilonzor', href: '#', column: 'contacts', order: 3 },
      ],
    })
    console.log('✅ Footer links seeded')
  }

  console.log('🎉 Database seeded successfully!')
  await prisma.$disconnect()
}

seed().catch(async (e) => {
  console.error('❌ Seed failed:', e)
  await prisma.$disconnect()
  process.exit(1)
})
