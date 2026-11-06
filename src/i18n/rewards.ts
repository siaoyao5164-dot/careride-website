/**
 * Text for registration, vouchers, referrals, the voucher-aware price estimate,
 * the WhatsApp booking message, testimonials and the privacy notice — in EN / BM / 中文.
 * Amounts are passed in already formatted (e.g. "RM8"), so they follow src/config/rewards.ts.
 */
type Fmt = (rm: string) => string

export interface RewardsText {
  nav: string
  promo: { welcome: Fmt; refer: Fmt }
  estimate: {
    transportFare: string
    crossing: string
    peak: (trips: number) => string
    accompaniment: (hours: number) => string
    subtotal: string
    voucherBalance: string
    voucherDiscount: string
    finalAmount: string
    noBalance: string
  }
  details: {
    title: string
    name: string
    mobile: string
    mobileHint: string
    date: string
    dateHint: (days: number) => string
    pickupTime: string
  }
  vouchers: {
    title: string
    checking: string
    enterMobile: string
    notRegistered: string
    registerLink: Fmt
    blocked: string
    none: string
    useNone: string
    hello: (name: string) => string
    balance: Fmt
    expires: (date: string) => string
    noExpiry: string
    reserved: string
    maxNote: (n: number) => string
    types: { welcome: string; referral: string; manual: string }
    welcomeAfterFirstRide: string
    lookupFailed: string
  }
  booking: {
    submit: string
    sending: string
    reference: (ref: string) => string
    sentTitle: string
    sentText: string
    voucherReservedNote: string
    errors: {
      name: string
      mobile: string
      date: (days: number) => string
      time: string
      voucherUnavailable: string
      location: string
      server: string
    }
  }
  message: {
    greeting: string
    reference: string
    name: string
    mobile: string
    pickup: string
    pickupMap: string
    destination: string
    destinationMap: string
    distance: (km: string, minutes: number) => string
    date: string
    pickupTime: string
    returnTime: string
    tripType: string
    oneWay: string
    roundTrip: string
    accompaniment: string
    accompanimentHours: (h: number) => string
    none: string
    transportFare: string
    crossing: string
    peak: string
    accompanimentCharge: string
    transportSubtotal: string
    voucher: string
    noVoucher: string
    finalFare: string
    notAvailable: string
    language: string
    closing: string
  }
  register: {
    title: string
    intro: string
    formTitle: string
    name: string
    mobile: string
    mobileHint: string
    referrer: string
    referrerHint: string
    consent: string
    submit: string
    submitting: string
    successTitle: string
    successText: Fmt
    successReferred: string
    rulesTitle: string
    rules: (welcome: string, referral: string, maxPerBooking: number) => string[]
    errors: {
      name: string
      mobile: string
      referrerFormat: string
      alreadyRegistered: string
      referrerNotFound: string
      selfReferral: string
      tooMany: string
      consent: string
      server: string
    }
  }
  balance: {
    title: string
    intro: string
    mobile: string
    submit: string
    checking: string
    notRegistered: string
    hello: (name: string) => string
    total: Fmt
    none: string
    statusAvailable: string
    statusReserved: string
    statusWaiting: string
  }
  privacy: {
    title: string
    linkText: string
    paragraphs: string[]
  }
  testimonials: {
    title: string
    intro: string
    ratingLabel: (n: number) => string
  }
}

const en: RewardsText = {
  nav: 'Rewards',
  promo: {
    welcome: (rm) => `Welcome to CareRide! Enjoy ${rm} OFF your first ride. More Than a Ride, We Care.`,
    refer: (rm) => `Refer a friend to CareRide and earn ${rm} OFF your next ride!`,
  },
  estimate: {
    transportFare: 'Transport fare',
    crossing: 'Mainland–island crossing surcharge',
    peak: (n) => `Peak-hour charge (${n} ${n === 1 ? 'trip' : 'trips'})`,
    accompaniment: (h) => `Hospital accompaniment (${h} hours)`,
    subtotal: 'Subtotal',
    voucherBalance: 'Available voucher balance',
    voucherDiscount: 'Voucher discount',
    finalAmount: 'Final estimated amount',
    noBalance: 'Enter your registered mobile number to use your vouchers.',
  },
  details: {
    title: 'Your details',
    name: 'Your name',
    mobile: 'Mobile number',
    mobileHint: 'e.g. 012-345 6789. Registered customers see their vouchers here.',
    date: 'Travel date',
    dateHint: (n) => `Choose a date at least ${n} days from today.`,
    pickupTime: 'Pickup time',
  },
  vouchers: {
    title: 'Your vouchers',
    checking: 'Checking your vouchers…',
    enterMobile: 'Enter your mobile number above to see your vouchers.',
    notRegistered: 'This number is not registered yet.',
    registerLink: (rm) => `Register free and get ${rm} off your first ride`,
    blocked: 'Vouchers are not available for this account. Please contact CareRide on WhatsApp.',
    none: 'You have no vouchers available right now.',
    useNone: 'Don’t use a voucher',
    hello: (name) => `Hello, ${name}`,
    balance: (rm) => `Available voucher balance: ${rm}`,
    expires: (d) => `Valid until ${d}`,
    noExpiry: 'No expiry date',
    reserved: 'Reserved for a booking you already sent',
    maxNote: (n) => (n === 1 ? 'You can use 1 voucher per booking.' : `You can use up to ${n} vouchers per booking.`),
    types: { welcome: 'First Ride Voucher', referral: 'Referral Voucher', manual: 'CareRide Voucher' },
    welcomeAfterFirstRide: 'Your First Ride Voucher can only be used on your first completed ride.',
    lookupFailed: 'We could not check your vouchers right now. You can still book.',
  },
  booking: {
    submit: 'Book via WhatsApp',
    sending: 'Preparing your booking…',
    reference: (ref) => `Booking reference: ${ref}`,
    sentTitle: 'WhatsApp is opening with your booking details.',
    sentText: 'Please press Send in WhatsApp. Your booking is not confirmed until CareRide replies.',
    voucherReservedNote:
      'Your voucher is reserved for this booking. It is only used when CareRide completes your trip. If the booking is cancelled, the voucher comes back to you.',
    errors: {
      name: 'Please enter your name.',
      mobile: 'Please enter a valid Malaysian mobile number, e.g. 012-345 6789.',
      date: (n) => `Please choose a travel date at least ${n} days from today.`,
      time: 'Please choose a pickup time.',
      voucherUnavailable: 'This voucher can no longer be used. Please check your vouchers and try again.',
      location: 'Please choose pickup and destination locations in Penang.',
      server: 'Something went wrong. Please try again, or message us on WhatsApp directly.',
    },
  },
  message: {
    greeting: 'Hello CareRide, I would like to book a ride.',
    reference: 'Booking reference',
    name: 'Name',
    mobile: 'Mobile number',
    pickup: 'Pickup location',
    pickupMap: 'Pickup map',
    destination: 'Destination',
    destinationMap: 'Destination map',
    distance: (km, min) => `Road distance: ${km} one way (about ${min} min)`,
    date: 'Travel date',
    pickupTime: 'Pickup time',
    returnTime: 'Return pickup time',
    tripType: 'Trip type',
    oneWay: 'One-way',
    roundTrip: 'Round trip',
    accompaniment: 'Hospital accompaniment',
    accompanimentHours: (h) => `${h} hours`,
    none: 'No',
    transportFare: 'Transport fare',
    crossing: 'Mainland–island crossing surcharge',
    peak: 'Peak-hour charge',
    accompanimentCharge: 'Accompaniment charge',
    transportSubtotal: 'Subtotal',
    voucher: 'Voucher',
    noVoucher: 'None',
    finalFare: 'Final estimated fare',
    notAvailable: 'Not available, please quote me',
    language: 'Preferred language',
    closing: 'Please let me know if you can confirm this booking. Thank you.',
  },
  register: {
    title: 'Register & get rewards',
    intro: 'Register once with your mobile number. It is free and takes less than a minute.',
    formTitle: 'Customer registration',
    name: 'Full name',
    mobile: 'Mobile number',
    mobileHint: 'Your mobile number is your customer ID. Each number can register once.',
    referrer: 'Introduced by (Mobile Number)',
    referrerHint: 'Optional. The mobile number of the CareRide customer who told you about us.',
    consent: 'I have read the privacy notice and agree that CareRide may keep my details to manage my bookings and vouchers.',
    submit: 'Register',
    submitting: 'Registering…',
    successTitle: 'Welcome to CareRide! More Than a Ride, We Care.',
    successText: (rm) => `Your ${rm} First Ride Voucher is ready. Enter your mobile number when you book and it is taken off your fare.`,
    successReferred: 'Thank you for joining through a friend. They have received their referral reward.',
    rulesTitle: 'Voucher terms',
    rules: (w, r, max) => [
      `${w} First Ride Voucher: for your first completed booking only.`,
      `${r} Referral Voucher: for your next eligible trip after a friend registers with your number.`,
      max === 1 ? 'One voucher per booking.' : `Up to ${max} vouchers per booking.`,
      'Vouchers apply to transport fares only, not to accompaniment charges.',
      'Vouchers cannot be exchanged for cash and have an expiry date.',
      'A voucher is reserved when you book and used only after CareRide completes your trip.',
    ],
    errors: {
      name: 'Please enter your full name.',
      mobile: 'Please enter a valid Malaysian mobile number, e.g. 012-345 6789.',
      referrerFormat: 'The “Introduced by” number is not a valid Malaysian mobile number.',
      alreadyRegistered: 'This mobile number is already registered. You can check your vouchers below.',
      referrerNotFound: 'We could not find a CareRide customer with the “Introduced by” number. Please check it, or leave it empty.',
      selfReferral: 'You cannot enter your own mobile number as “Introduced by”.',
      tooMany: 'Too many registrations from this connection today. Please try again tomorrow or contact us on WhatsApp.',
      consent: 'Please tick the box to agree to the privacy notice.',
      server: 'Registration is not working right now. Please try again later.',
    },
  },
  balance: {
    title: 'Check my vouchers',
    intro: 'Enter your registered mobile number to see your voucher balance.',
    mobile: 'Registered mobile number',
    submit: 'Check vouchers',
    checking: 'Checking…',
    notRegistered: 'This number is not registered yet. Register above to get your First Ride Voucher.',
    hello: (name) => `Hello, ${name}`,
    total: (rm) => `Available balance: ${rm}`,
    none: 'You have no vouchers right now.',
    statusAvailable: 'Available',
    statusReserved: 'Reserved for a booking',
    statusWaiting: 'Only for your first ride',
  },
  privacy: {
    title: 'Privacy notice',
    linkText: 'Read the privacy notice',
    paragraphs: [
      'CareRide collects your name, mobile number, the mobile number of the person who introduced you (if any), and your booking details (pickup, destination, date and time).',
      'We use this information only to manage your bookings, vouchers and referral rewards, and to contact you about your trips. We do not sell your information or use it for unrelated marketing.',
      'Your details are stored in a secure database that only the CareRide administrator can access. Locations you search for are sent to OpenStreetMap services to find addresses and road distances.',
      'In line with Malaysia’s Personal Data Protection Act 2010, you can ask to see, correct or delete your information at any time by messaging CareRide on WhatsApp.',
    ],
  },
  testimonials: {
    title: 'What our customers say',
    intro: 'Real words from people we have driven and accompanied around Penang.',
    ratingLabel: (n) => `Rated ${n} out of 5`,
  },
}

const ms: RewardsText = {
  nav: 'Ganjaran',
  promo: {
    welcome: (rm) => `Selamat datang ke CareRide! Nikmati ${rm} DISKAUN untuk perjalanan pertama anda. More Than a Ride, We Care.`,
    refer: (rm) => `Perkenalkan rakan kepada CareRide dan dapatkan ${rm} DISKAUN untuk perjalanan anda yang seterusnya!`,
  },
  estimate: {
    transportFare: 'Tambang pengangkutan',
    crossing: 'Surcaj lintasan tanah besar–pulau',
    peak: (n) => `Caj waktu puncak (${n} perjalanan)`,
    accompaniment: (h) => `Teman ke hospital (${h} jam)`,
    subtotal: 'Jumlah kecil',
    voucherBalance: 'Baki baucar tersedia',
    voucherDiscount: 'Diskaun baucar',
    finalAmount: 'Anggaran jumlah akhir',
    noBalance: 'Masukkan nombor telefon bimbit berdaftar untuk guna baucar anda.',
  },
  details: {
    title: 'Butiran anda',
    name: 'Nama anda',
    mobile: 'Nombor telefon bimbit',
    mobileHint: 'cth. 012-345 6789. Pelanggan berdaftar boleh lihat baucar di sini.',
    date: 'Tarikh perjalanan',
    dateHint: (n) => `Pilih tarikh sekurang-kurangnya ${n} hari dari hari ini.`,
    pickupTime: 'Masa ambil',
  },
  vouchers: {
    title: 'Baucar anda',
    checking: 'Menyemak baucar anda…',
    enterMobile: 'Masukkan nombor telefon bimbit di atas untuk melihat baucar anda.',
    notRegistered: 'Nombor ini belum didaftarkan.',
    registerLink: (rm) => `Daftar percuma dan dapatkan ${rm} diskaun untuk perjalanan pertama`,
    blocked: 'Baucar tidak tersedia untuk akaun ini. Sila hubungi CareRide di WhatsApp.',
    none: 'Anda tiada baucar buat masa ini.',
    useNone: 'Jangan guna baucar',
    hello: (name) => `Helo, ${name}`,
    balance: (rm) => `Baki baucar tersedia: ${rm}`,
    expires: (d) => `Sah sehingga ${d}`,
    noExpiry: 'Tiada tarikh luput',
    reserved: 'Ditempah untuk tempahan yang telah anda hantar',
    maxNote: (n) => (n === 1 ? 'Anda boleh guna 1 baucar bagi setiap tempahan.' : `Anda boleh guna sehingga ${n} baucar bagi setiap tempahan.`),
    types: { welcome: 'Baucar Perjalanan Pertama', referral: 'Baucar Rujukan', manual: 'Baucar CareRide' },
    welcomeAfterFirstRide: 'Baucar Perjalanan Pertama hanya boleh digunakan untuk perjalanan pertama yang selesai.',
    lookupFailed: 'Kami tidak dapat menyemak baucar anda sekarang. Anda masih boleh membuat tempahan.',
  },
  booking: {
    submit: 'Tempah melalui WhatsApp',
    sending: 'Menyediakan tempahan anda…',
    reference: (ref) => `Nombor rujukan tempahan: ${ref}`,
    sentTitle: 'WhatsApp sedang dibuka dengan butiran tempahan anda.',
    sentText: 'Sila tekan Hantar di WhatsApp. Tempahan anda belum disahkan sehingga CareRide membalas.',
    voucherReservedNote:
      'Baucar anda ditempah untuk tempahan ini. Ia hanya digunakan selepas CareRide menyelesaikan perjalanan anda. Jika tempahan dibatalkan, baucar akan dikembalikan kepada anda.',
    errors: {
      name: 'Sila masukkan nama anda.',
      mobile: 'Sila masukkan nombor telefon bimbit Malaysia yang sah, cth. 012-345 6789.',
      date: (n) => `Sila pilih tarikh perjalanan sekurang-kurangnya ${n} hari dari hari ini.`,
      time: 'Sila pilih masa ambil.',
      voucherUnavailable: 'Baucar ini tidak boleh digunakan lagi. Sila semak baucar anda dan cuba lagi.',
      location: 'Sila pilih lokasi ambil dan destinasi di Pulau Pinang.',
      server: 'Berlaku ralat. Sila cuba lagi, atau hantar mesej terus kepada kami di WhatsApp.',
    },
  },
  message: {
    greeting: 'Helo CareRide, saya ingin menempah perjalanan.',
    reference: 'Nombor rujukan tempahan',
    name: 'Nama',
    mobile: 'Nombor telefon bimbit',
    pickup: 'Lokasi ambil',
    pickupMap: 'Peta lokasi ambil',
    destination: 'Destinasi',
    destinationMap: 'Peta destinasi',
    distance: (km, min) => `Jarak jalan: ${km} sehala (kira-kira ${min} minit)`,
    date: 'Tarikh perjalanan',
    pickupTime: 'Masa ambil',
    returnTime: 'Masa ambil pulang',
    tripType: 'Jenis perjalanan',
    oneWay: 'Sehala',
    roundTrip: 'Pergi balik',
    accompaniment: 'Teman ke hospital',
    accompanimentHours: (h) => `${h} jam`,
    none: 'Tidak',
    transportFare: 'Tambang pengangkutan',
    crossing: 'Surcaj lintasan tanah besar–pulau',
    peak: 'Caj waktu puncak',
    accompanimentCharge: 'Caj teman',
    transportSubtotal: 'Jumlah kecil',
    voucher: 'Baucar',
    noVoucher: 'Tiada',
    finalFare: 'Anggaran tambang akhir',
    notAvailable: 'Tiada, sila beri sebut harga',
    language: 'Bahasa pilihan',
    closing: 'Sila maklumkan jika tempahan ini boleh disahkan. Terima kasih.',
  },
  register: {
    title: 'Daftar & dapatkan ganjaran',
    intro: 'Daftar sekali dengan nombor telefon bimbit anda. Percuma dan kurang dari seminit.',
    formTitle: 'Pendaftaran pelanggan',
    name: 'Nama penuh',
    mobile: 'Nombor telefon bimbit',
    mobileHint: 'Nombor telefon bimbit anda ialah ID pelanggan anda. Setiap nombor hanya boleh didaftar sekali.',
    referrer: 'Diperkenalkan oleh (Nombor Telefon Bimbit)',
    referrerHint: 'Pilihan. Nombor telefon bimbit pelanggan CareRide yang memperkenalkan kami kepada anda.',
    consent: 'Saya telah membaca notis privasi dan bersetuju CareRide menyimpan butiran saya untuk mengurus tempahan dan baucar saya.',
    submit: 'Daftar',
    submitting: 'Mendaftar…',
    successTitle: 'Selamat datang ke CareRide! More Than a Ride, We Care.',
    successText: (rm) => `Baucar Perjalanan Pertama ${rm} anda sudah sedia. Masukkan nombor telefon bimbit semasa menempah dan ia akan ditolak daripada tambang.`,
    successReferred: 'Terima kasih kerana menyertai melalui rakan. Rakan anda telah menerima ganjaran rujukan.',
    rulesTitle: 'Terma baucar',
    rules: (w, r, max) => [
      `Baucar Perjalanan Pertama ${w}: hanya untuk tempahan pertama anda yang selesai.`,
      `Baucar Rujukan ${r}: untuk perjalanan layak anda yang seterusnya selepas rakan mendaftar dengan nombor anda.`,
      max === 1 ? 'Satu baucar bagi setiap tempahan.' : `Sehingga ${max} baucar bagi setiap tempahan.`,
      'Baucar hanya untuk tambang pengangkutan, bukan caj teman.',
      'Baucar tidak boleh ditukar kepada wang tunai dan mempunyai tarikh luput.',
      'Baucar ditempah semasa anda menempah dan hanya digunakan selepas CareRide menyelesaikan perjalanan anda.',
    ],
    errors: {
      name: 'Sila masukkan nama penuh anda.',
      mobile: 'Sila masukkan nombor telefon bimbit Malaysia yang sah, cth. 012-345 6789.',
      referrerFormat: 'Nombor “Diperkenalkan oleh” bukan nombor telefon bimbit Malaysia yang sah.',
      alreadyRegistered: 'Nombor telefon bimbit ini sudah didaftarkan. Anda boleh semak baucar anda di bawah.',
      referrerNotFound: 'Kami tidak menjumpai pelanggan CareRide dengan nombor “Diperkenalkan oleh”. Sila semak, atau biarkan kosong.',
      selfReferral: 'Anda tidak boleh memasukkan nombor anda sendiri sebagai “Diperkenalkan oleh”.',
      tooMany: 'Terlalu banyak pendaftaran dari sambungan ini hari ini. Sila cuba esok atau hubungi kami di WhatsApp.',
      consent: 'Sila tandakan kotak untuk bersetuju dengan notis privasi.',
      server: 'Pendaftaran tidak berfungsi sekarang. Sila cuba sebentar lagi.',
    },
  },
  balance: {
    title: 'Semak baucar saya',
    intro: 'Masukkan nombor telefon bimbit berdaftar untuk melihat baki baucar anda.',
    mobile: 'Nombor telefon bimbit berdaftar',
    submit: 'Semak baucar',
    checking: 'Menyemak…',
    notRegistered: 'Nombor ini belum didaftarkan. Daftar di atas untuk mendapatkan Baucar Perjalanan Pertama.',
    hello: (name) => `Helo, ${name}`,
    total: (rm) => `Baki tersedia: ${rm}`,
    none: 'Anda tiada baucar buat masa ini.',
    statusAvailable: 'Tersedia',
    statusReserved: 'Ditempah untuk tempahan',
    statusWaiting: 'Hanya untuk perjalanan pertama',
  },
  privacy: {
    title: 'Notis privasi',
    linkText: 'Baca notis privasi',
    paragraphs: [
      'CareRide mengumpul nama anda, nombor telefon bimbit, nombor telefon bimbit orang yang memperkenalkan anda (jika ada), dan butiran tempahan anda (lokasi ambil, destinasi, tarikh dan masa).',
      'Kami menggunakan maklumat ini hanya untuk mengurus tempahan, baucar dan ganjaran rujukan anda, serta menghubungi anda tentang perjalanan anda. Kami tidak menjual maklumat anda atau menggunakannya untuk pemasaran lain.',
      'Butiran anda disimpan dalam pangkalan data selamat yang hanya boleh diakses oleh pentadbir CareRide. Lokasi yang anda cari dihantar kepada perkhidmatan OpenStreetMap untuk mencari alamat dan jarak jalan.',
      'Selaras dengan Akta Perlindungan Data Peribadi 2010, anda boleh meminta untuk melihat, membetulkan atau memadam maklumat anda pada bila-bila masa dengan menghantar mesej kepada CareRide di WhatsApp.',
    ],
  },
  testimonials: {
    title: 'Kata pelanggan kami',
    intro: 'Kata-kata sebenar daripada mereka yang pernah kami bawa dan temani di Pulau Pinang.',
    ratingLabel: (n) => `Penilaian ${n} daripada 5`,
  },
}

const zh: RewardsText = {
  nav: '优惠奖励',
  promo: {
    welcome: (rm) => `欢迎来到 CareRide！首次乘车立减 ${rm}。More Than a Ride, We Care.`,
    refer: (rm) => `推荐朋友加入 CareRide，下次乘车立减 ${rm}！`,
  },
  estimate: {
    transportFare: '车费',
    crossing: '威省–槟岛跨海附加费',
    peak: (n) => `高峰时段附加费（${n} 趟）`,
    accompaniment: (h) => `医院陪同（${h} 小时）`,
    subtotal: '小计',
    voucherBalance: '可用优惠券余额',
    voucherDiscount: '优惠券折扣',
    finalAmount: '最终估计金额',
    noBalance: '输入您注册的手机号码即可使用优惠券。',
  },
  details: {
    title: '您的资料',
    name: '您的姓名',
    mobile: '手机号码',
    mobileHint: '例如 012-345 6789。已注册的顾客会在这里看到自己的优惠券。',
    date: '出行日期',
    dateHint: (n) => `请选择至少 ${n} 天后的日期。`,
    pickupTime: '上车时间',
  },
  vouchers: {
    title: '您的优惠券',
    checking: '正在查询您的优惠券…',
    enterMobile: '请在上面输入手机号码，查看您的优惠券。',
    notRegistered: '这个号码还没有注册。',
    registerLink: (rm) => `免费注册，首次乘车立减 ${rm}`,
    blocked: '此账户无法使用优惠券，请通过 WhatsApp 联系 CareRide。',
    none: '您目前没有可用的优惠券。',
    useNone: '不使用优惠券',
    hello: (name) => `您好，${name}`,
    balance: (rm) => `可用优惠券余额：${rm}`,
    expires: (d) => `有效期至 ${d}`,
    noExpiry: '无到期日',
    reserved: '已为您之前发送的预订保留',
    maxNote: (n) => `每次预订最多可使用 ${n} 张优惠券。`,
    types: { welcome: '首次乘车优惠券', referral: '推荐优惠券', manual: 'CareRide 优惠券' },
    welcomeAfterFirstRide: '首次乘车优惠券只能用于您第一次完成的行程。',
    lookupFailed: '暂时无法查询您的优惠券，您仍然可以预订。',
  },
  booking: {
    submit: '通过 WhatsApp 预订',
    sending: '正在准备您的预订…',
    reference: (ref) => `预订编号：${ref}`,
    sentTitle: '正在打开 WhatsApp，并附上您的预订资料。',
    sentText: '请在 WhatsApp 中按"发送"。CareRide 回复确认之前，您的预订尚未确认。',
    voucherReservedNote: '您的优惠券已为这次预订保留，只有在 CareRide 完成您的行程后才会使用。如果预订取消，优惠券会退回给您。',
    errors: {
      name: '请输入您的姓名。',
      mobile: '请输入有效的马来西亚手机号码，例如 012-345 6789。',
      date: (n) => `请选择至少 ${n} 天后的出行日期。`,
      time: '请选择上车时间。',
      voucherUnavailable: '这张优惠券已无法使用，请查看您的优惠券后再试。',
      location: '请选择槟城范围内的上车地点和目的地。',
      server: '出现问题，请再试一次，或直接通过 WhatsApp 联系我们。',
    },
  },
  message: {
    greeting: '您好 CareRide，我想预订用车。',
    reference: '预订编号',
    name: '姓名',
    mobile: '手机号码',
    pickup: '上车地点',
    pickupMap: '上车地点地图',
    destination: '目的地',
    destinationMap: '目的地地图',
    distance: (km, min) => `道路距离：单程 ${km}（约 ${min} 分钟）`,
    date: '出行日期',
    pickupTime: '上车时间',
    returnTime: '回程上车时间',
    tripType: '行程类型',
    oneWay: '单程',
    roundTrip: '往返',
    accompaniment: '医院陪同',
    accompanimentHours: (h) => `${h} 小时`,
    none: '不需要',
    transportFare: '车费',
    crossing: '威省–槟岛跨海附加费',
    peak: '高峰时段附加费',
    accompanimentCharge: '陪同费用',
    transportSubtotal: '小计',
    voucher: '优惠券',
    noVoucher: '无',
    finalFare: '最终估计车费',
    notAvailable: '暂无，请报价',
    language: '偏好语言',
    closing: '请告诉我这个预订能否确认，谢谢。',
  },
  register: {
    title: '注册领取优惠',
    intro: '用手机号码注册一次即可，免费，不到一分钟完成。',
    formTitle: '顾客注册',
    name: '全名',
    mobile: '手机号码',
    mobileHint: '您的手机号码就是您的顾客编号，每个号码只能注册一次。',
    referrer: '介绍人（手机号码）',
    referrerHint: '选填。介绍您认识 CareRide 的顾客的手机号码。',
    consent: '我已阅读隐私声明，并同意 CareRide 保存我的资料，用于管理我的预订和优惠券。',
    submit: '注册',
    submitting: '正在注册…',
    successTitle: '欢迎来到 CareRide！More Than a Ride, We Care.',
    successText: (rm) => `您的 ${rm} 首次乘车优惠券已经可以使用。预订时输入手机号码，即可从车费中扣除。`,
    successReferred: '感谢您通过朋友介绍加入，您的朋友已获得推荐奖励。',
    rulesTitle: '优惠券条款',
    rules: (w, r, max) => [
      `${w} 首次乘车优惠券：只限您第一次完成的预订。`,
      `${r} 推荐优惠券：朋友用您的号码注册后，可用于您的下一次符合条件的行程。`,
      `每次预订最多使用 ${max} 张优惠券。`,
      '优惠券只适用于车费，不适用于陪同费用。',
      '优惠券不能兑换现金，并设有到期日。',
      '预订时优惠券会被保留，只有在 CareRide 完成您的行程后才会使用。',
    ],
    errors: {
      name: '请输入您的全名。',
      mobile: '请输入有效的马来西亚手机号码，例如 012-345 6789。',
      referrerFormat: '"介绍人"号码不是有效的马来西亚手机号码。',
      alreadyRegistered: '这个手机号码已经注册过了，您可以在下面查看您的优惠券。',
      referrerNotFound: '找不到使用"介绍人"号码的 CareRide 顾客，请检查号码，或留空。',
      selfReferral: '不能把自己的手机号码填为"介绍人"。',
      tooMany: '今天从这个网络注册的次数太多，请明天再试，或通过 WhatsApp 联系我们。',
      consent: '请勾选同意隐私声明。',
      server: '注册暂时无法使用，请稍后再试。',
    },
  },
  balance: {
    title: '查看我的优惠券',
    intro: '输入您注册的手机号码，查看优惠券余额。',
    mobile: '注册的手机号码',
    submit: '查看优惠券',
    checking: '正在查询…',
    notRegistered: '这个号码还没有注册。请在上面注册，领取首次乘车优惠券。',
    hello: (name) => `您好，${name}`,
    total: (rm) => `可用余额：${rm}`,
    none: '您目前没有优惠券。',
    statusAvailable: '可使用',
    statusReserved: '已为预订保留',
    statusWaiting: '只限首次乘车',
  },
  privacy: {
    title: '隐私声明',
    linkText: '阅读隐私声明',
    paragraphs: [
      'CareRide 会收集您的姓名、手机号码、介绍人的手机号码（如有），以及您的预订资料（上车地点、目的地、日期和时间）。',
      '我们只会用这些资料来管理您的预订、优惠券和推荐奖励，并就您的行程与您联系。我们不会出售您的资料，也不会用于无关的营销。',
      '您的资料保存在安全的数据库中，只有 CareRide 管理员可以查看。您搜索的地点会发送到 OpenStreetMap 服务，用于查找地址和道路距离。',
      '根据马来西亚《2010 年个人资料保护法令》，您可以随时通过 WhatsApp 联系 CareRide，要求查看、更正或删除您的资料。',
    ],
  },
  testimonials: {
    title: '顾客的评价',
    intro: '来自我们在槟城接送和陪同过的顾客的真实评价。',
    ratingLabel: (n) => `评分 ${n}/5`,
  },
}

export const rewardsText = { en, ms, zh }
