const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.create({
    data: {
      name: '{"uz":"Gerber - sabzavotli pyure","ru":"Gerber - овощное пюре","en":"Gerber - vegetable puree","tr":"Gerber - sebze püresi"}',
      description: '{"uz":"Gerber sabzavotli pyuresi - bolalar uchun tabiiy sabzavotli ozuqa.","ru":"Овощное пюре Gerber из натуральных овощей для детского питания.","en":"Gerber vegetable puree made from natural vegetables for baby nutrition.","tr":"Gerber sebze püresi - bebekler için doğal sebzelerden üretilmiştir."}',
      label: '{"uz":"Gerber • sabzavotli pyure • bolalar ovqati","ru":"Gerber • овощное пюре • детское питание","en":"Gerber • vegetable puree • baby food","tr":"Gerber • sebze püresi • bebek maması"}',
      category: 'baby-food',
      gradient: 'from-green-50 to-emerald-100',
      iconColor: '#10b981',
      image: '',
      stock: 200,
      price: 15000,
      isTop: false,
      uzumLink: null,
      features: null,
    },
  });
  console.log('Created product:', product.id);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
