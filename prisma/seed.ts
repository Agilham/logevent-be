// prisma/seed.ts

// dependency modules
import { Cart, Category, City, Event, Item, Product, User, Vendor, PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// --- Helper Functions for Date Generation ---
function getRandomDateWithinPastWeek(): Date {
  const currentDate = new Date();
  const pastWeek = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
  const randomTime = pastWeek.getTime() + Math.random() * (currentDate.getTime() - pastWeek.getTime());
  return new Date(randomTime);
}

function getRandomDateWithinPastTwoMonth(): Date {
  const currentDate = new Date();
  const pastTwoMonth = new Date(currentDate.getTime() - (60 * 24 * 60 * 60 * 1000));
  const randomTime = pastTwoMonth.getTime() + Math.random() * (currentDate.getTime() - pastTwoMonth.getTime());
  return new Date(randomTime);
}

// --- Entity Creation Functions ---

async function clearDatabase() {
  // Delete all data with no cascade
  await prisma.admin.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.visit.deleteMany();

  // Delete all Cart related data
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.item.deleteMany();
  await prisma.cart.deleteMany();

  // Delete all Event related data
  await prisma.bundle.deleteMany();
  await prisma.event.deleteMany();

  // Delete all Product related data
  await prisma.album.deleteMany();
  await prisma.product.deleteMany();

  // Delete all Vendor related data
  await prisma.vendor.deleteMany();
  await prisma.city.deleteMany();

  // Delete all data with cascade (User and Category usually have cascades)
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

async function createCoreEntities(): Promise<{ adminUser: User, cities: City[] }> {
  // Create 1 Admin User
  const hashedPassword = await hash('password', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'logevent.eo@gmail.com',
      password: hashedPassword,
      name: 'Admin LogEvent',
      phone: '6289520771715',
      isAdmin: true,
      isVerified: true,
    },
  });

  // Create 4 Cities
  const sampleCities = [
    { name: 'Jakarta' }, { name: 'Bandung' }, { name: 'Yogyakarta' }, { name: 'Surabaya' },
  ];
  const cities: City[] = [];
  for (const sampleCity of sampleCities) {
    const city = await prisma.city.create({ data: sampleCity });
    cities.push(city);
  }
  return { adminUser, cities };
}

async function createUsers(hashedPassword: string): Promise<User[]> {
  const sampleUsers = [
    { email: 'ahmadghulamilham@gmail.com', password: hashedPassword, name: 'Ahmad Ghulam Ilham', phone: '1234567891', isVerified: true },
    { email: 'satrianababan@gmail.com', password: hashedPassword, name: 'Satria Octavianus Nababan', phone: '1234567892', isVerified: true },
    { email: 'jasonrivalino@gmail.com', password: hashedPassword, name: 'Jason Rivalino', phone: '1234567893', isVerified: true },
  ];
  const users: User[] = [];
  for (const sampleUser of sampleUsers) {
    const user = await prisma.user.create({ data: sampleUser });
    users.push(user);
  }
  return users;
}

async function createVendors(cities: City[], adminVendorEmail: string): Promise<{ adminVendor: Vendor, otherVendors: Vendor[] }> {
  const adminVendor = await prisma.vendor.create({
    data: {
      cityId: cities[1].id, // Bandung
      email: adminVendorEmail,
      name: 'LogEvent',
      phone: '6289520771715',
      address: 'Jl. Ganesa No. 10 Coblong, Kota Bandung, Jawa Barat Indonesia 40132',
      instagram: 'logevent.eo',
      documentUrl: 'https://drive.google.com/file/d/1W1gWA621MB6zq-JU3xsPni2QB8VxmaCn/view?usp=drive_link',
    },
  });

  const sampleVendors = [
    { cityId: cities[0].id, email: 'freshflora@gmail.com', name: 'Fresh Flora', phone: '1234567894', address: '123 Blossom Street, Greenfield', instagram: 'freshflora', socialMedia: 'Fresh Flora Official', documentUrl: 'https://drive.google.com/file/d/1W1gWA621MB6zq-JU3xsPni2QB8VxmaCn/view?usp=drive_link' },
    { cityId: cities[2].id, email: 'urbanfeast@gmail.com', name: 'Urban Feast', phone: '1234567895', address: '456 Market Avenue, Downtown City', instagram: 'urban_feast', socialMedia: 'Urban Feast Eatery', documentUrl: 'https://drive.google.com/file/d/1W1gWA621MB6zq-JU3xsPni2QB8VxmaCn/view?usp=drive_link' },
    { cityId: cities[3].id, email: 'techvisionary@gmail.com', name: 'Tech Visionary', phone: '1234567896', address: '789 Innovation Park, Silicon Valley', instagram: 'techvisionary', socialMedia: 'Tech Visionary Solutions', documentUrl: 'https://drive.google.com/file/d/1W1gWA621MB6zq-JU3xsPni2QB8VxmaCn/view?usp=drive_link' },
  ];
  const otherVendors: Vendor[] = [];
  for (const sampleVendor of sampleVendors) {
    const vendor = await prisma.vendor.create({ data: sampleVendor });
    otherVendors.push(vendor);
  }
  return { adminVendor, otherVendors };
}

async function createEventOrganizerFlow(users: User[], adminVendor: Vendor): Promise<{ eoProduct: Product, eoItems: Item[] }> {
  const eventOrganizerCategory = await prisma.category.create({
    data: { name: 'Event Organizer', fee: 0, type: 'Event Organizer' },
  });

  const eventOrganizerProduct = await prisma.product.create({
    data: {
      vendorId: adminVendor.id,
      categoryId: eventOrganizerCategory.id,
      name: 'Event Organizer',
      specification: 'Event Organizer',
      rate: 'Daily',
      price: 0,
      description: 'LogEvent juga menawarkan jasa Event Organizer profesional yang siap merancang dan mengelola event impian Anda. Tim kami yang berpengalaman akan bekerja sama dengan Anda dari tahap perencanaan hingga eksekusi, memastikan setiap detail acara Anda tertata dengan sempurna.',
      productImage: 'https://res.cloudinary.com/dfauyfqjn/image/upload/v1723522709/kop8wdcpriag8h2vtwel.png'
    },
  });

  const eventOrganizerCarts: Cart[] = [];
  const eventOrganizerItems: Item[] = [];
  for (const element of users) {
    const cart = await prisma.cart.create({
      data: { userId: element.id, type: 'Event Organizer', cartStatus: 'Checked Out' },
    });
    eventOrganizerCarts.push(cart);

    const item = await prisma.item.create({
      data: { cartId: cart.id, productId: eventOrganizerProduct.id },
    });
    eventOrganizerItems.push(item);
  }

  const eoOrderSamples = [
    { cartId: eventOrganizerCarts[0].id, name: 'Ahmad Ghulam Ilham', phone: '1234567897', address: 'Jl. Sudirman No. 1, Jakarta', notes: 'Mohon datang 30 menit sebelum acara dimulai', startDate: getRandomDateWithinPastTwoMonth(), endDate: new Date(getRandomDateWithinPastTwoMonth().getTime() + 24 * 60 * 60 * 1000), orderDate: new Date(getRandomDateWithinPastTwoMonth().getTime() - 24 * 60 * 60 * 1000), orderTotal: 2500000, orderStatus: 'Completed' },
    { cartId: eventOrganizerCarts[1].id, name: 'Satria Octavianus Nababan', phone: '1234567898', address: 'Jl. Malioboro No. 22, Yogyakarta', notes: 'Acara diadakan di ruang konferensi utama', startDate: getRandomDateWithinPastTwoMonth(), endDate: new Date(getRandomDateWithinPastTwoMonth().getTime() + 2 * 24 * 60 * 60 * 1000), orderDate: new Date(getRandomDateWithinPastTwoMonth().getTime() - 2 * 24 * 60 * 60 * 1000), orderTotal: 4500000, orderStatus: 'Completed' },
    { cartId: eventOrganizerCarts[2].id, name: 'Jason Rivalino', phone: '1234567899', address: 'Jl. Diponegoro No. 33, Bandung', notes: 'Pesanan untuk acara peluncuran produk', startDate: getRandomDateWithinPastTwoMonth(), endDate: new Date(getRandomDateWithinPastTwoMonth().getTime() + 3 * 24 * 60 * 60 * 1000), orderDate: new Date(getRandomDateWithinPastTwoMonth().getTime() - 3 * 24 * 60 * 60 * 1000), orderTotal: 7500000, orderStatus: 'Completed' },
  ];
  for (const orderSample of eoOrderSamples) {
    await prisma.order.create({ data: orderSample });
  }

  const eoReviewSamples = [
    { itemId: eventOrganizerItems[0].id, rating: 5, comment: 'Pelayanan sangat memuaskan, acara berjalan lancar!', tag: 'Pelayanan Memuaskan' },
    { itemId: eventOrganizerItems[1].id, rating: 5, comment: 'Terima kasih, acara sangat terorganisir dan sukses.', tag: 'Acara Sukses' },
    { itemId: eventOrganizerItems[2].id, rating: 5, comment: 'Tim yang sangat profesional dan mudah diajak kerja sama.', tag: 'Tim Profesional' },
  ];
  for (const reviewSample of eoReviewSamples) {
    await prisma.review.create({ data: reviewSample });
  }

  return { eoProduct: eventOrganizerProduct, eoItems: eventOrganizerItems };
}

async function createProductFlow(users: User[], otherVendors: Vendor[]): Promise<{ productCategories: Category[], products: Product[], productItems: Item[] }> {
  const productCategorySamples = [
    { name: 'Gedung', fee: 1.5, type: 'Product' },
    { name: 'Catering', fee: 1.0, type: 'Product' },
    { name: 'Sound System', fee: 0.5, type: 'Product' },
  ];
  const productCategories: Category[] = [];
  for (const sample of productCategorySamples) {
    const category = await prisma.category.create({ data: sample });
    productCategories.push(category);
  }

  const productSamples = [
    { vendorId: otherVendors[0].id, categoryId: productCategories[0].id, name: 'Balai Sartika', specification: 'Multifunction Hall', rate: 'Daily', price: 2500000, capacity: 500, description: 'Balai Sartika adalah gedung serbaguna yang cocok untuk berbagai macam acara seperti seminar, konser, dan pameran.', productImage: 'https://res.cloudinary.com/dfauyfqjn/image/upload/v1723522709/Balai_dcrq40.png' },
    { vendorId: otherVendors[1].id, categoryId: productCategories[1].id, name: 'Catering Bu Daffa', specification: 'Food & Beverage', rate: 'Quantity', price: 30000, description: 'Catering Bu Daffa menyediakan berbagai macam menu makanan dan minuman untuk acara Anda.', productImage: 'https://res.cloudinary.com/dfauyfqjn/image/upload/v1723522709/jeirx4hyelxsv9cihd63.png' },
    { vendorId: otherVendors[2].id, categoryId: productCategories[2].id, name: 'Home Theater Harman Kardon', specification: 'Sound System', rate: 'Hourly', price: 150000, description: 'Sound System adalah perangkat audio profesional yang cocok untuk acara besar seperti konser dan festival.', productImage: 'https://res.cloudinary.com/dfauyfqjn/image/upload/v1723522709/z5bwhkxdyw6ykfqaqd8f.png' },
  ];
  const products: Product[] = [];
  for (const sample of productSamples) {
    const product = await prisma.product.create({ data: sample });
    products.push(product);
  }

  const productCarts: Cart[] = [];
  const productItems: Item[] = [];
  for (let i = 0; i < users.length; i++) {
    const cart = await prisma.cart.create({ data: { userId: users[i].id, type: 'Product', cartStatus: 'Checked Out' } });
    productCarts.push(cart);

    let duration: number | null = null;
    let quantity: number | null = null;
    const product = products[i];
    if (product.rate === "Quantity") {
      quantity = Math.floor(Math.random() * 100);
    } else if (product.rate === "Hourly") {
      duration = Math.floor(Math.random() * 24);
    }
    const item = await prisma.item.create({ data: { cartId: cart.id, productId: products[i].id, duration, quantity } });
    productItems.push(item);
  }

  const productOrderSamples = [
    { cartId: productCarts[0].id, name: 'Ahmad Ghulam Ilham', phone: '1234567894', address: 'Jl. Sudirman No. 1, Jakarta', notes: 'Mohon Balai Sartika disiapkan untuk acara seminar', startDate: getRandomDateWithinPastTwoMonth(), endDate: new Date(getRandomDateWithinPastTwoMonth().getTime() + 24 * 60 * 60 * 1000), orderDate: new Date(getRandomDateWithinPastTwoMonth().getTime() - 24 * 60 * 60 * 1000), orderTotal: products[0].price * (1 + productCategories[0].fee / 100), orderStatus: 'Completed' },
    { cartId: productCarts[1].id, name: 'Satria Octavianus Nababan', phone: '1234567895', address: 'Jl. Malioboro No. 22, Yogyakarta', notes: 'Mohon Catering datang 1 jam sebelum acara dimulai', startDate: getRandomDateWithinPastTwoMonth(), endDate: new Date(getRandomDateWithinPastTwoMonth().getTime() + 2 * 24 * 60 * 60 * 1000), orderDate: new Date(getRandomDateWithinPastTwoMonth().getTime() - 2 * 24 * 60 * 60 * 1000), orderTotal: products[1].price * productItems[1].quantity! * (1 + productCategories[1].fee / 100), orderStatus: 'Completed' },
    { cartId: productCarts[2].id, name: 'Jason Rivalino', phone: '1234567896', address: 'Jl. Diponegoro No. 33, Bandung', notes: 'Mohon Home Theater Harman Kardon disiapkan untuk acara konser', startDate: getRandomDateWithinPastTwoMonth(), endDate: new Date(getRandomDateWithinPastTwoMonth().getTime() + 3 * 24 * 60 * 60 * 1000), orderDate: new Date(getRandomDateWithinPastTwoMonth().getTime() - 3 * 24 * 60 * 60 * 1000), orderTotal: products[2].price * productItems[2].duration! * (1 + productCategories[2].fee / 100), orderStatus: 'Completed' },
  ];
  for (const sample of productOrderSamples) {
    await prisma.order.create({ data: sample });
  }

  const productReviewSamples = [
    { itemId: productItems[0].id, rating: 5, comment: 'Balai Sartika sangat nyaman dan cocok untuk acara seminar.', tag: 'Kenyamanan Gedung' },
    { itemId: productItems[1].id, rating: 5, comment: 'Catering Bu Daffa sangat enak dan pelayanan sangat baik.', tag: 'Kualitas Makanan' },
    { itemId: productItems[2].id, rating: 5, comment: 'Home Theater Harman Kardon memiliki kualitas suara yang sangat baik.', tag: 'Kualitas Suara' },
  ];
  for (const sample of productReviewSamples) {
    await prisma.review.create({ data: sample });
  }

  return { productCategories, products, productItems };
}

async function createEventFlow(users: User[], products: Product[], productCategories: Category[]): Promise<{ eventCategories: Category[], events: Event[], eventItems: Item[] }> {
  const eventCategorySamples = [
    { name: 'Konser', fee: 1.5, type: 'Event' },
    { name: 'Pesta', fee: 1.0, type: 'Event' },
    { name: 'Seminar', fee: 0.5, type: 'Event' },
  ];
  const eventCategories: Category[] = [];
  for (const sample of eventCategorySamples) {
    const category = await prisma.category.create({ data: sample });
    eventCategories.push(category);
  }

  const eventSamples = [
    { categoryId: eventCategories[0].id, name: 'Konser Musik Indie', price: 3000000, capacity: 1000, description: 'Konser Musik Indie adalah acara musik yang menampilkan band-band indie terkenal di Indonesia.', eventImage: 'https://res.cloudinary.com/dfauyfqjn/image/upload/v1723522709/Show_grvzif.png' },
    { categoryId: eventCategories[1].id, name: 'Ulang Tahun Minimalis', price: 1500000, capacity: 300, description: 'Ulang Tahun Minimalis adalah pesta ulang tahun yang sederhana namun berkesan.', eventImage: 'https://res.cloudinary.com/dfauyfqjn/image/upload/v1723522709/Birthday_gfapbf.png' },
    { categoryId: eventCategories[2].id, name: 'Seminar Kewirausahaan', price: 4000000, capacity: 200, description: 'Seminar Kewirausahaan adalah seminar yang membahas tentang kewirausahaan dan peluang bisnis di Indonesia.', eventImage: 'https://res.cloudinary.com/dfauyfqjn/image/upload/v1723522709/Meeting_q87sj8.png' },
  ];
  const events: Event[] = [];
  for (const sample of eventSamples) {
    const event = await prisma.event.create({ data: sample });
    events.push(event);
  }

  // Create Event Bundles (using products created in product flow)
  const eventBundleSamples = [
    { eventId: events[0].id, productId: products[0].id },
    { eventId: events[1].id, productId: products[1].id },
    { eventId: events[2].id, productId: products[2].id },
  ];
  for (const sample of eventBundleSamples) {
    await prisma.bundle.create({ data: sample });
  }

  const eventCarts: Cart[] = [];
  const eventItems: Item[] = [];
  for (let i = 0; i < users.length; i++) {
    const cart = await prisma.cart.create({ data: { userId: users[i].id, type: 'Event', cartStatus: 'Checked Out' } });
    eventCarts.push(cart);

    const item = await prisma.item.create({ data: { cartId: cart.id, eventId: events[i].id } });
    eventItems.push(item);
  }

  const eventOrderSamples = [
    { cartId: eventCarts[0].id, name: 'Ahmad Ghulam Ilham', phone: '1234567897', address: 'Jl. Sudirman No. 1, Jakarta', notes: 'Mohon Konser Musik Indie dimulai tepat waktu', startDate: getRandomDateWithinPastTwoMonth(), endDate: new Date(getRandomDateWithinPastTwoMonth().getTime() + 24 * 60 * 60 * 1000), orderDate: new Date(getRandomDateWithinPastTwoMonth().getTime() - 24 * 60 * 60 * 1000), orderTotal: events[0].price * (1 + eventCategories[0].fee / 100), orderStatus: 'Completed' },
    { cartId: eventCarts[1].id, name: 'Satria Octavianus Nababan', phone: '1234567898', address: 'Jl. Malioboro No. 22, Yogyakarta', notes: 'Mohon Ulang Tahun Minimalis disiapkan dekorasi minimalis', startDate: getRandomDateWithinPastTwoMonth(), endDate: new Date(getRandomDateWithinPastTwoMonth().getTime() + 2 * 24 * 60 * 60 * 1000), orderDate: new Date(getRandomDateWithinPastTwoMonth().getTime() - 2 * 24 * 60 * 60 * 1000), orderTotal: 2 * events[1].price * (1 + eventCategories[1].fee / 100), orderStatus: 'Completed' },
    { cartId: eventCarts[2].id, name: 'Jason Rivalino', phone: '1234567899', address: 'Jl. Diponegoro No. 33, Bandung', notes: 'Pesanan untuk Seminar Kewirausahaan', startDate: getRandomDateWithinPastTwoMonth(), endDate: new Date(getRandomDateWithinPastTwoMonth().getTime() + 3 * 24 * 60 * 60 * 1000), orderDate: new Date(getRandomDateWithinPastTwoMonth().getTime() - 3 * 24 * 60 * 60 * 1000), orderTotal: 3 * events[2].price * (1 + eventCategories[2].fee / 100), orderStatus: 'Completed' },
  ];
  for (const sample of eventOrderSamples) {
    await prisma.order.create({ data: sample });
  }

  const eventReviewSamples = [
    { itemId: eventItems[0].id, rating: 5, comment: 'Konser Musik Indie sangat seru dan penuh kejutan!', tag: 'Acara Seru' },
    { itemId: eventItems[1].id, rating: 5, comment: 'Ulang Tahun Minimalis sangat sederhana dan berkesan.', tag: 'Pesta Sederhana' },
    { itemId: eventItems[2].id, rating: 5, comment: 'Seminar Kewirausahaan sangat informatif dan bermanfaat.', tag: 'Seminar Bermanfaat' },
  ];
  for (const sample of eventReviewSamples) {
    await prisma.review.create({ data: sample });
  }

  return { eventCategories, events, eventItems };
}

async function createFaqs() {
  const sampleFaqs = [
    { question: 'Apa itu LogEvent?', answer: 'LogEvent adalah penyedia jasa EventOrganizer, pemesanan logistik vendor dan Paket Logistik Event yang terintegrasi dalam sebuah website.' },
    { question: 'Bagaimana cara menjadi mitra vendor LogEvent?', answer: 'Lakukan pendaftaran dengan melakukan klik pada tombol Menjadi Vendor, lalu Anda akan diarahkan ke Admin kami untuk kesepakatan kerjasama.' },
  ];
  for (const sampleFaq of sampleFaqs) {
    await prisma.faq.create({ data: sampleFaq });
  }
}

async function createVisits() {
  for (let i = 0; i < 3; i++) {
    await prisma.visit.create({
      data: { ipAddress: `192.168.1.${i + 1}`, visitDate: getRandomDateWithinPastWeek() },
    });
  }
}

async function createSetting() {
  await prisma.setting.create({
    data: {
      description: 'Kami menghadirkan pengalaman terbaik untuk penyewaan vendor logistik event secara praktis. Dengan pilihan vendor yang handal dan produk yang berkualitas tinggi, kami memastikan bahwa setiap event Anda berjalan lancar dan sesuai harapan.',
      youtubeUrl: 'https://www.youtube.com/embed/ZZl2uAkUfHA',
      vendorCount: 3,
      productCount: 3,
      orderCount: 9,
    },
  });
}

async function createAdminEmails() {
  const adminEmailSamples = [
    { email: 'ahmadghulamilham@gmail.com' },
    { email: 'Satriaoctavianus28@gmail.com' },
    { email: '13521168@std.stei.itb.ac.id' },
  ];
  for (const sample of adminEmailSamples) {
    await prisma.admin.create({ data: sample });
  }
}

// --- Main Seeding Function ---
async function main() {
  console.log('Starting seeding...');
  await clearDatabase();
  console.log('Database cleared.');

  const { adminUser, cities } = await createCoreEntities();
  const hashedPassword = await hash('password', 10); // Hash password once for all users
  const users = await createUsers(hashedPassword);
  const { adminVendor, otherVendors } = await createVendors(cities, adminUser.email);

  await createEventOrganizerFlow(users, adminVendor);
  const { productCategories, products } = await createProductFlow(users, otherVendors);
  await createEventFlow(users, products, productCategories); // Pass products and productCategories

  await createFaqs();
  await createVisits();
  await createSetting();
  await createAdminEmails();

  console.log('Seeding finished.');
}

// --- Execute Main Function ---
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });