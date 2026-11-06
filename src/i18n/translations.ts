/**
 * All website text in English (en), Bahasa Melayu (ms) and Chinese (zh).
 * To change any wording, edit it here. Every language must have the same keys.
 * Prices inside sentences come from src/config/pricing.ts, so they update automatically.
 */
import { pricing, type AreaId } from '@/config/pricing'
import { rewardsText, type RewardsText } from './rewards'

const peak = `${pricing.currency}${pricing.peakSurcharge}`

export type Lang = 'en' | 'ms' | 'zh'

export const languages: { code: Lang; label: string; htmlLang: string }[] = [
  { code: 'en', label: 'EN', htmlLang: 'en' },
  { code: 'ms', label: 'BM', htmlLang: 'ms' },
  { code: 'zh', label: '中文', htmlLang: 'zh-Hans' },
]

type Money = (rm: string) => string

export interface Translation {
  skipToContent: string
  rewards: RewardsText
  nav: {
    services: string
    areas: string
    pricing: string
    booking: string
    faq: string
    contact: string
    menu: string
    language: string
  }
  theme: { toLight: string; toDark: string }
  whatsappBook: string
  hero: {
    eyebrow: string
    title: string
    text: string
    ctaEstimate: string
    badges: string[]
    imageAlt: string
  }
  services: {
    title: string
    intro: string
    items: { title: string; text: string }[]
    from: string
    priceCardsTitle: string
    oneWay: string
    roundTrip: string
    accompaniment: string
    oneWayNote: string
    roundTripNote: string
    accompanimentNote: string
  }
  areas: {
    title: string
    intro: string
    names: Record<AreaId, string>
    descriptions: Record<AreaId, string>
    mainland: string
    island: string
    everyday: string
  }
  how: {
    title: string
    steps: { title: string; text: string }[]
  }
  pricingNotes: {
    title: string
    items: {
      minOneWay: Money
      roundTrip: Money
      crossing: string
      peak: Money
      accompaniment: (first: string, extra: string) => string
      estimate: string
    }
  }
  booking: {
    title: string
    intro: string
    notice: string
    estimateTitle: string
    pickupLocation: string
    destinationLocation: string
    pickupPlaceholder: string
    destinationPlaceholder: string
    searchHint: string
    useMyLocation: string
    locating: string
    locationDenied: string
    locationOutside: string
    locationFailed: string
    searching: string
    noResults: string
    searchFailed: string
    clearLocation: string
    distanceLine: (km: string, minutes: number) => string
    rateNote: (rate: string) => string
    calculating: string
    distanceFailed: string
    tripType: string
    oneWay: string
    roundTrip: string
    pickupTime: string
    returnTime: string
    returnTimeHint: string
    needAccompaniment: string
    yes: string
    no: string
    hours: string
    hoursUnit: (n: number) => string
    decreaseHours: string
    increaseHours: string
    estimatedTotal: string
    transport: string
    transportCrossingNote: string
    accompanimentLine: (n: number) => string
    peakLine: (n: number) => string
    chooseLocations: string
    disclaimer: string
    formTitle: string
    name: string
    phone: string
    phoneHint: string
    pickupAddress: string
    pickupAddressPlaceholder: string
    destinationAddress: string
    destinationAddressPlaceholder: string
    date: string
    dateHint: (n: number) => string
    notes: string
    notesPlaceholder: string
    estimatedPrice: string
    submit: string
    submitNote: string
    errors: {
      required: string
      phone: string
      dateTooSoon: (n: number) => string
      pickup: string
      destination: string
    }
    sentTitle: string
    sentText: string
  }
  faq: {
    title: string
    items: { q: string; a: string }[]
  }
  contact: {
    title: string
    text: string
    button: string
    everyday: string
    location: string
  }
  footer: {
    rights: string
    estimateNote: string
  }
}

const en: Translation = {
  skipToContent: 'Skip to main content',
  rewards: rewardsText.en,
  nav: {
    services: 'Services',
    areas: 'Areas',
    pricing: 'Pricing',
    booking: 'Book',
    faq: 'FAQ',
    contact: 'Contact',
    menu: 'Menu',
    language: 'Language',
  },
  theme: { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' },
  whatsappBook: 'Book on WhatsApp',
  hero: {
    eyebrow: 'Private transport & hospital accompaniment in Penang',
    title: 'More Than a Ride, We Care.',
    text: "Reliable private transport and hospital accompaniment services across Penang. We don't just take you there; we care for you along the way.",
    ctaEstimate: 'Get a price estimate',
    badges: ['Open every day', 'Hospital accompaniment', 'Mainland & Penang Island'],
    imageAlt: 'A CareRide staff member helping an elderly man walk outside Penang General Hospital',
  },
  services: {
    title: 'Our services',
    intro:
      'From a simple private car ride to a full hospital visit with someone by your side, we plan each trip around your needs.',
    items: [
      {
        title: 'Private car transport',
        text: 'A comfortable private car with a careful driver, for any trip around Penang.',
      },
      {
        title: 'Hospital transport',
        text: 'Safe, on-time rides to hospitals and clinics for check-ups, treatment and follow-ups.',
      },
      {
        title: 'Hospital accompaniment',
        text: 'We walk with you into the hospital, help with registration and stay by your side.',
      },
      {
        title: 'Waiting during appointments',
        text: 'No need to rush. We wait for you while you see the doctor, so you are never left alone.',
      },
      {
        title: 'Return-trip transport',
        text: 'We bring you home after your appointment, so the whole journey is taken care of.',
      },
      {
        title: 'Hourly waiting & accompaniment',
        text: 'Book accompaniment by the hour, from 2 hours, for longer hospital visits.',
      },
    ],
    from: 'From',
    priceCardsTitle: 'Simple starting prices',
    oneWay: 'One-way transport',
    roundTrip: 'Round-trip transport',
    accompaniment: 'Hospital accompaniment',
    oneWayNote: 'Per one-way trip',
    roundTripNote: 'There and back',
    accompanimentNote: 'First 2 hours',
  },
  areas: {
    title: 'Service areas in Penang',
    intro:
      'We serve the mainland and Penang Island every day. Tell us your exact pickup point and destination when you book.',
    names: {
      bm: 'Bukit Mertajam (BM)',
      perai: 'Perai',
      'seberang-jaya': 'Seberang Jaya',
      butterworth: 'Butterworth',
      'penang-island': 'Penang Island',
    },
    descriptions: {
      bm: 'Bukit Mertajam transport to hospitals, clinics and anywhere in Penang.',
      perai: 'Perai transport for hospital appointments, errands and family visits.',
      'seberang-jaya': 'Seberang Jaya transport with a caring, patient driver.',
      butterworth: 'Butterworth transport to the mainland or across to the island.',
      'penang-island': 'Penang Island private transport, including hospital trips.',
    },
    mainland: 'Mainland',
    island: 'Island',
    everyday: 'Available every day',
  },
  how: {
    title: 'How booking works',
    steps: [
      {
        title: 'Check your estimate',
        text: 'Choose your areas and trip type below to see an estimated price straight away.',
      },
      {
        title: 'Send your details on WhatsApp',
        text: 'Fill in the booking form. We prepare a WhatsApp message with all your details for you.',
      },
      {
        title: 'We confirm personally',
        text: 'CareRide replies on WhatsApp to confirm the time and final price. Your booking is confirmed only then.',
      },
    ],
  },
  pricingNotes: {
    title: 'Pricing notes',
    items: {
      minOneWay: (rm) => `One-way trips start from ${rm}.`,
      roundTrip: (rm) => `Round trips start from ${rm}.`,
      crossing:
        'Trips between the mainland and Penang Island include a crossing charge in the transport fare.',
      peak: (rm) => `Peak hours (7:30am–9:00am and 5:00pm–7:00pm): add ${rm} per trip.`,
      accompaniment: (first, extra) =>
        `Hospital accompaniment: ${first} for the first 2 hours, then ${extra} for each extra hour.`,
      estimate: 'All prices shown are estimates. CareRide confirms the final price on WhatsApp.',
    },
  },
  booking: {
    title: 'Book your ride',
    intro: 'Get your price estimate, then send your booking request to us on WhatsApp.',
    notice: 'Please book at least 3 days before departure.',
    estimateTitle: 'Price estimate',
    pickupLocation: 'Pickup location',
    destinationLocation: 'Destination',
    pickupPlaceholder: 'Search address, building or place',
    destinationPlaceholder: 'Search hospital, clinic or address',
    searchHint: 'Type at least 3 letters, then choose from the list.',
    useMyLocation: 'Use my current location',
    locating: 'Finding your location…',
    locationDenied: 'Location access was not allowed. Please type your address instead.',
    locationOutside: 'Your current location is outside our Penang service area. Please type your pickup address.',
    locationFailed: 'We could not find your location. Please type your address instead.',
    searching: 'Searching…',
    noResults: 'No places found in Penang. Try a nearby landmark or road name.',
    searchFailed: 'Search is not working right now. Please try again, or book on WhatsApp.',
    clearLocation: 'Clear',
    distanceLine: (km, minutes) => `Road distance: ${km} one way (about ${minutes} min)`,
    rateNote: (rate) => `${rate} per km`,
    calculating: 'Calculating the road distance…',
    distanceFailed: 'We could not calculate the distance right now. You can still send your request and we will quote you on WhatsApp.',
    tripType: 'Trip type',
    oneWay: 'One-way',
    roundTrip: 'Round trip',
    pickupTime: 'Pickup time',
    returnTime: 'Return pickup time',
    returnTimeHint: 'Your best guess is fine.',
    needAccompaniment: 'Do you need hospital accompaniment?',
    yes: 'Yes',
    no: 'No',
    hours: 'Waiting / accompaniment hours',
    hoursUnit: (n) => `${n} hours`,
    decreaseHours: 'Fewer hours',
    increaseHours: 'More hours',
    estimatedTotal: 'Estimated total',
    transport: 'Transport fare',
    transportCrossingNote: 'Includes mainland–island crossing charge',
    accompanimentLine: (n) => `Hospital accompaniment (${n} hours)`,
    peakLine: (n) => `Peak-hour charge (${n} ${n === 1 ? 'trip' : 'trips'})`,
    chooseLocations: 'Enter your exact pickup location and destination to see your estimate.',
    disclaimer:
      'This is an estimate only. The final price is confirmed by CareRide on WhatsApp.',
    formTitle: 'Your booking details',
    name: 'Your name',
    phone: 'Contact number',
    phoneHint: 'e.g. 012-345 6789',
    pickupAddress: 'Exact pickup location',
    pickupAddressPlaceholder: 'House address, building or landmark',
    destinationAddress: 'Exact destination',
    destinationAddressPlaceholder: 'e.g. hospital or clinic name',
    date: 'Travel date',
    dateHint: (n) => `Choose a date at least ${n} days from today.`,
    notes: 'Notes (optional)',
    notesPlaceholder: 'e.g. wheelchair user, number of passengers',
    estimatedPrice: 'Estimated price',
    submit: 'Send booking request on WhatsApp',
    submitNote:
      'Your booking is not confirmed yet. CareRide will reply on WhatsApp to confirm.',
    errors: {
      required: 'Please fill in this field.',
      phone: 'Please enter a valid phone number.',
      dateTooSoon: (n) => `Please choose a date at least ${n} days from today.`,
      pickup: 'Please search and choose your pickup location.',
      destination: 'Please search and choose your destination.',
    },
    sentTitle: 'WhatsApp is opening',
    sentText:
      'Please press send in WhatsApp. Your booking is confirmed only after CareRide replies.',
  },
  faq: {
    title: 'Common questions',
    items: [
      {
        q: 'How early should I book?',
        a: 'Please book at least 3 days before departure, so we can plan your trip properly.',
      },
      {
        q: 'Do you operate every day?',
        a: 'Yes. CareRide operates every day. Send us a WhatsApp message to check availability.',
      },
      {
        q: 'Can someone stay with me at the hospital?',
        a: 'Yes. With hospital accompaniment, we go with you, wait during your appointment and bring you home. It starts from 2 hours.',
      },
      {
        q: 'How is the price calculated?',
        a: `We calculate the road distance between your exact pickup and destination. Trips between the mainland and Penang Island include a crossing surcharge, and trips starting in peak hours add ${peak}. Registered customers can use vouchers to reduce the transport fare.`,
      },
      {
        q: 'Is the price on the website final?',
        a: 'No. The calculator gives an estimate. CareRide confirms the final price with you on WhatsApp before your trip.',
      },
      {
        q: 'Which areas do you cover?',
        a: 'Bukit Mertajam, Perai, Seberang Jaya, Butterworth and Penang Island.',
      },
    ],
  },
  contact: {
    title: 'Contact CareRide',
    text: 'Need a reliable ride or someone to accompany you to the hospital? Contact CareRide today. We are here to help make your journey safer, easier and more comfortable.',
    button: 'Chat with us on WhatsApp',
    everyday: 'Open every day',
    location: 'Penang, Malaysia',
  },
  footer: {
    rights: 'All rights reserved.',
    estimateNote: 'Prices on this website are estimates and are confirmed on WhatsApp.',
  },
}

const ms: Translation = {
  skipToContent: 'Langkau ke kandungan utama',
  rewards: rewardsText.ms,
  nav: {
    services: 'Perkhidmatan',
    areas: 'Kawasan',
    pricing: 'Harga',
    booking: 'Tempah',
    faq: 'Soalan',
    contact: 'Hubungi',
    menu: 'Menu',
    language: 'Bahasa',
  },
  theme: { toLight: 'Tukar ke mod cerah', toDark: 'Tukar ke mod gelap' },
  whatsappBook: 'Tempah di WhatsApp',
  hero: {
    eyebrow: 'Pengangkutan persendirian & teman ke hospital di Pulau Pinang',
    title: 'Bukan Sekadar Perjalanan, Kami Prihatin.',
    text: 'Perkhidmatan pengangkutan persendirian dan teman ke hospital yang boleh dipercayai di seluruh Pulau Pinang. Kami bukan sahaja menghantar anda; kami menjaga anda sepanjang perjalanan.',
    ctaEstimate: 'Kira anggaran harga',
    badges: ['Buka setiap hari', 'Teman ke hospital', 'Tanah Besar & Pulau Pinang'],
    imageAlt: 'Kakitangan CareRide membantu seorang warga emas berjalan di luar Hospital Pulau Pinang',
  },
  services: {
    title: 'Perkhidmatan kami',
    intro:
      'Dari perjalanan kereta biasa hingga lawatan hospital dengan orang di sisi anda, kami rancang setiap perjalanan ikut keperluan anda.',
    items: [
      {
        title: 'Kereta persendirian',
        text: 'Kereta yang selesa dengan pemandu yang berhati-hati, untuk perjalanan di sekitar Pulau Pinang.',
      },
      {
        title: 'Pengangkutan ke hospital',
        text: 'Perjalanan selamat dan tepat masa ke hospital dan klinik untuk pemeriksaan dan rawatan.',
      },
      {
        title: 'Teman ke hospital',
        text: 'Kami berjalan bersama anda ke hospital, bantu pendaftaran dan sentiasa di sisi anda.',
      },
      {
        title: 'Menunggu semasa temujanji',
        text: 'Tak perlu tergesa-gesa. Kami tunggu semasa anda berjumpa doktor, jadi anda tidak bersendirian.',
      },
      {
        title: 'Perjalanan pulang',
        text: 'Kami hantar anda pulang selepas temujanji, jadi seluruh perjalanan dijaga.',
      },
      {
        title: 'Teman & menunggu ikut jam',
        text: 'Tempah teman ke hospital ikut jam, bermula 2 jam, untuk lawatan yang lebih lama.',
      },
    ],
    from: 'Dari',
    priceCardsTitle: 'Harga permulaan yang mudah',
    oneWay: 'Perjalanan sehala',
    roundTrip: 'Perjalanan pergi balik',
    accompaniment: 'Teman ke hospital',
    oneWayNote: 'Setiap perjalanan sehala',
    roundTripNote: 'Pergi dan balik',
    accompanimentNote: '2 jam pertama',
  },
  areas: {
    title: 'Kawasan perkhidmatan di Pulau Pinang',
    intro:
      'Kami berkhidmat di Tanah Besar dan Pulau Pinang setiap hari. Beritahu kami lokasi ambil dan destinasi yang tepat semasa menempah.',
    names: {
      bm: 'Bukit Mertajam (BM)',
      perai: 'Perai',
      'seberang-jaya': 'Seberang Jaya',
      butterworth: 'Butterworth',
      'penang-island': 'Pulau Pinang (Pulau)',
    },
    descriptions: {
      bm: 'Pengangkutan Bukit Mertajam ke hospital, klinik dan ke mana-mana di Pulau Pinang.',
      perai: 'Pengangkutan Perai untuk temujanji hospital, urusan harian dan lawatan keluarga.',
      'seberang-jaya': 'Pengangkutan Seberang Jaya dengan pemandu yang prihatin dan sabar.',
      butterworth: 'Pengangkutan Butterworth di Tanah Besar atau menyeberang ke pulau.',
      'penang-island': 'Pengangkutan persendirian di Pulau Pinang, termasuk ke hospital.',
    },
    mainland: 'Tanah Besar',
    island: 'Pulau',
    everyday: 'Ada setiap hari',
  },
  how: {
    title: 'Cara menempah',
    steps: [
      {
        title: 'Semak anggaran harga',
        text: 'Pilih kawasan dan jenis perjalanan di bawah untuk melihat anggaran harga dengan segera.',
      },
      {
        title: 'Hantar butiran di WhatsApp',
        text: 'Isi borang tempahan. Kami sediakan mesej WhatsApp dengan semua butiran anda.',
      },
      {
        title: 'Kami sahkan sendiri',
        text: 'CareRide akan membalas di WhatsApp untuk mengesahkan masa dan harga akhir. Tempahan hanya sah selepas itu.',
      },
    ],
  },
  pricingNotes: {
    title: 'Nota harga',
    items: {
      minOneWay: (rm) => `Perjalanan sehala bermula dari ${rm}.`,
      roundTrip: (rm) => `Perjalanan pergi balik bermula dari ${rm}.`,
      crossing:
        'Perjalanan antara Tanah Besar dan Pulau Pinang termasuk caj menyeberang dalam tambang.',
      peak: (rm) =>
        `Waktu puncak (7:30 pagi–9:00 pagi dan 5:00 petang–7:00 petang): tambah ${rm} setiap perjalanan.`,
      accompaniment: (first, extra) =>
        `Teman ke hospital: ${first} untuk 2 jam pertama, kemudian ${extra} untuk setiap jam tambahan.`,
      estimate: 'Semua harga adalah anggaran. CareRide akan sahkan harga akhir di WhatsApp.',
    },
  },
  booking: {
    title: 'Tempah perjalanan anda',
    intro: 'Dapatkan anggaran harga, kemudian hantar permintaan tempahan kepada kami di WhatsApp.',
    notice: 'Sila tempah sekurang-kurangnya 3 hari sebelum perjalanan.',
    estimateTitle: 'Anggaran harga',
    pickupLocation: 'Lokasi ambil',
    destinationLocation: 'Destinasi',
    pickupPlaceholder: 'Cari alamat, bangunan atau tempat',
    destinationPlaceholder: 'Cari hospital, klinik atau alamat',
    searchHint: 'Taip sekurang-kurangnya 3 huruf, kemudian pilih dari senarai.',
    useMyLocation: 'Guna lokasi semasa saya',
    locating: 'Mencari lokasi anda…',
    locationDenied: 'Akses lokasi tidak dibenarkan. Sila taip alamat anda.',
    locationOutside: 'Lokasi semasa anda di luar kawasan servis kami di Pulau Pinang. Sila taip alamat ambil anda.',
    locationFailed: 'Kami tidak dapat mencari lokasi anda. Sila taip alamat anda.',
    searching: 'Mencari…',
    noResults: 'Tiada tempat dijumpai di Pulau Pinang. Cuba mercu tanda atau nama jalan berdekatan.',
    searchFailed: 'Carian tidak berfungsi sekarang. Sila cuba lagi, atau tempah di WhatsApp.',
    clearLocation: 'Padam',
    distanceLine: (km, minutes) => `Jarak jalan: ${km} sehala (kira-kira ${minutes} minit)`,
    rateNote: (rate) => `${rate} sekilometer`,
    calculating: 'Mengira jarak jalan…',
    distanceFailed: 'Kami tidak dapat mengira jarak sekarang. Anda masih boleh hantar permintaan dan kami akan beri sebut harga di WhatsApp.',
    tripType: 'Jenis perjalanan',
    oneWay: 'Sehala',
    roundTrip: 'Pergi balik',
    pickupTime: 'Masa ambil',
    returnTime: 'Masa ambil untuk pulang',
    returnTimeHint: 'Anggaran pun tidak mengapa.',
    needAccompaniment: 'Perlukan teman ke hospital?',
    yes: 'Ya',
    no: 'Tidak',
    hours: 'Jam menunggu / teman',
    hoursUnit: (n) => `${n} jam`,
    decreaseHours: 'Kurangkan jam',
    increaseHours: 'Tambah jam',
    estimatedTotal: 'Anggaran jumlah',
    transport: 'Tambang pengangkutan',
    transportCrossingNote: 'Termasuk caj menyeberang Tanah Besar–Pulau',
    accompanimentLine: (n) => `Teman ke hospital (${n} jam)`,
    peakLine: (n) => `Caj waktu puncak (${n} perjalanan)`,
    chooseLocations: 'Masukkan lokasi ambil dan destinasi yang tepat untuk melihat anggaran harga.',
    disclaimer: 'Ini hanya anggaran. Harga akhir akan disahkan oleh CareRide di WhatsApp.',
    formTitle: 'Butiran tempahan anda',
    name: 'Nama anda',
    phone: 'Nombor telefon',
    phoneHint: 'cth. 012-345 6789',
    pickupAddress: 'Lokasi ambil yang tepat',
    pickupAddressPlaceholder: 'Alamat rumah, bangunan atau mercu tanda',
    destinationAddress: 'Destinasi yang tepat',
    destinationAddressPlaceholder: 'cth. nama hospital atau klinik',
    date: 'Tarikh perjalanan',
    dateHint: (n) => `Pilih tarikh sekurang-kurangnya ${n} hari dari hari ini.`,
    notes: 'Nota (pilihan)',
    notesPlaceholder: 'cth. pengguna kerusi roda, bilangan penumpang',
    estimatedPrice: 'Anggaran harga',
    submit: 'Hantar permintaan tempahan di WhatsApp',
    submitNote: 'Tempahan anda belum disahkan. CareRide akan membalas di WhatsApp untuk mengesahkan.',
    errors: {
      required: 'Sila isi ruangan ini.',
      phone: 'Sila masukkan nombor telefon yang sah.',
      dateTooSoon: (n) => `Sila pilih tarikh sekurang-kurangnya ${n} hari dari hari ini.`,
      pickup: 'Sila cari dan pilih lokasi ambil anda.',
      destination: 'Sila cari dan pilih destinasi anda.',
    },
    sentTitle: 'WhatsApp sedang dibuka',
    sentText: 'Sila tekan hantar di WhatsApp. Tempahan hanya sah selepas CareRide membalas.',
  },
  faq: {
    title: 'Soalan lazim',
    items: [
      {
        q: 'Berapa awal saya perlu menempah?',
        a: 'Sila tempah sekurang-kurangnya 3 hari sebelum perjalanan supaya kami boleh merancang dengan baik.',
      },
      {
        q: 'Adakah anda beroperasi setiap hari?',
        a: 'Ya. CareRide beroperasi setiap hari. Hantar mesej WhatsApp untuk semak kekosongan.',
      },
      {
        q: 'Bolehkah seseorang menemani saya di hospital?',
        a: 'Boleh. Dengan perkhidmatan teman ke hospital, kami pergi bersama anda, menunggu semasa temujanji dan menghantar anda pulang. Bermula dari 2 jam.',
      },
      {
        q: 'Bagaimana harga dikira?',
        a: `Kami mengira jarak jalan antara lokasi ambil dan destinasi anda yang tepat. Perjalanan antara tanah besar dan Pulau Pinang termasuk surcaj lintasan, dan perjalanan bermula pada waktu puncak dikenakan tambahan ${peak}. Pelanggan berdaftar boleh guna baucar untuk mengurangkan tambang pengangkutan.`,
      },
      {
        q: 'Adakah harga di laman web ini harga akhir?',
        a: 'Tidak. Kalkulator memberi anggaran sahaja. CareRide akan sahkan harga akhir di WhatsApp sebelum perjalanan.',
      },
      {
        q: 'Kawasan mana yang anda liputi?',
        a: 'Bukit Mertajam, Perai, Seberang Jaya, Butterworth dan Pulau Pinang.',
      },
    ],
  },
  contact: {
    title: 'Hubungi CareRide',
    text: 'Perlukan perjalanan yang boleh dipercayai atau seseorang untuk menemani anda ke hospital? Hubungi CareRide hari ini. Kami sedia membantu menjadikan perjalanan anda lebih selamat, mudah dan selesa.',
    button: 'Hubungi kami di WhatsApp',
    everyday: 'Buka setiap hari',
    location: 'Pulau Pinang, Malaysia',
  },
  footer: {
    rights: 'Hak cipta terpelihara.',
    estimateNote: 'Harga di laman web ini adalah anggaran dan akan disahkan di WhatsApp.',
  },
}

const zh: Translation = {
  skipToContent: '跳到主要内容',
  rewards: rewardsText.zh,
  nav: {
    services: '服务',
    areas: '服务地区',
    pricing: '价格',
    booking: '预订',
    faq: '常见问题',
    contact: '联系我们',
    menu: '菜单',
    language: '语言',
  },
  theme: { toLight: '切换到浅色模式', toDark: '切换到深色模式' },
  whatsappBook: 'WhatsApp 预订',
  hero: {
    eyebrow: '槟城私人用车与陪诊服务',
    title: '不只是接送，更是关怀。',
    text: '我们在槟城各地提供可靠的私人接送和医院陪诊服务。我们不只是送您到目的地，更在路上用心照顾您。',
    ctaEstimate: '查看估价',
    badges: ['每天营业', '医院陪诊', '威省与槟岛'],
    imageAlt: 'CareRide 工作人员在槟城中央医院外陪同一位长者步行',
  },
  services: {
    title: '我们的服务',
    intro: '无论是普通的私人用车，还是需要有人陪同的医院看诊，我们都会按照您的需要安排行程。',
    items: [
      { title: '私人用车接送', text: '舒适的私人车辆，细心的司机，带您去槟城各地。' },
      { title: '医院接送', text: '安全准时地送您去医院和诊所，做检查、治疗或复诊。' },
      { title: '医院陪诊', text: '我们陪您走进医院，帮忙挂号，一直在您身边。' },
      { title: '看诊期间等候', text: '不用赶时间。您看医生时我们在旁等候，您不会是一个人。' },
      { title: '回程接送', text: '看诊结束后我们送您回家，整个行程都照顾好。' },
      { title: '按小时陪诊与等候', text: '可按小时预订陪诊服务，2 小时起，适合较长的医院行程。' },
    ],
    from: '起价',
    priceCardsTitle: '简单清楚的起价',
    oneWay: '单程接送',
    roundTrip: '来回接送',
    accompaniment: '医院陪诊',
    oneWayNote: '每趟单程',
    roundTripNote: '去程加回程',
    accompanimentNote: '首 2 小时',
  },
  areas: {
    title: '槟城服务地区',
    intro: '我们每天服务威省和槟岛。预订时请告诉我们准确的上车地点和目的地。',
    names: {
      bm: '大山脚 (Bukit Mertajam)',
      perai: '北赖 (Perai)',
      'seberang-jaya': '诗布朗再也 (Seberang Jaya)',
      butterworth: '北海 (Butterworth)',
      'penang-island': '槟岛 (Penang Island)',
    },
    descriptions: {
      bm: '大山脚接送，去医院、诊所或槟城任何地方。',
      perai: '北赖接送，医院复诊、办事或探亲都可以。',
      'seberang-jaya': '诗布朗再也接送，司机细心又有耐心。',
      butterworth: '北海接送，威省内或过桥去槟岛。',
      'penang-island': '槟岛私人接送，包括医院行程。',
    },
    mainland: '威省',
    island: '槟岛',
    everyday: '每天都有服务',
  },
  how: {
    title: '预订步骤',
    steps: [
      { title: '查看估价', text: '在下面选择地区和行程类型，马上看到估计价格。' },
      {
        title: '通过 WhatsApp 发送资料',
        text: '填写预订表格，我们会帮您准备好包含所有资料的 WhatsApp 信息。',
      },
      {
        title: '我们亲自确认',
        text: 'CareRide 会在 WhatsApp 回复，确认时间和最终价格。收到确认后预订才算成功。',
      },
    ],
  },
  pricingNotes: {
    title: '价格说明',
    items: {
      minOneWay: (rm) => `单程 ${rm} 起。`,
      roundTrip: (rm) => `来回 ${rm} 起。`,
      crossing: '威省与槟岛之间的行程，车费已包含过海费用。',
      peak: (rm) => `高峰时段（早上 7:30–9:00 和傍晚 5:00–7:00）：每趟加 ${rm}。`,
      accompaniment: (first, extra) => `医院陪诊：首 2 小时 ${first}，之后每小时 ${extra}。`,
      estimate: '网站上的价格都是估价，最终价格由 CareRide 在 WhatsApp 确认。',
    },
  },
  booking: {
    title: '预订行程',
    intro: '先查看估价，然后通过 WhatsApp 把预订请求发给我们。',
    notice: '请至少在出发前 3 天预订。',
    estimateTitle: '估价',
    pickupLocation: '上车地点',
    destinationLocation: '目的地',
    pickupPlaceholder: '搜索地址、建筑或地点',
    destinationPlaceholder: '搜索医院、诊所或地址',
    searchHint: '输入至少 3 个字，然后从列表中选择。',
    useMyLocation: '使用我目前的位置',
    locating: '正在查找您的位置…',
    locationDenied: '未获得定位权限，请直接输入地址。',
    locationOutside: '您目前的位置不在我们的槟城服务范围内，请输入上车地址。',
    locationFailed: '无法找到您的位置，请直接输入地址。',
    searching: '搜索中…',
    noResults: '在槟城找不到这个地点，请试试附近的地标或路名。',
    searchFailed: '搜索暂时无法使用，请再试一次，或直接通过 WhatsApp 预订。',
    clearLocation: '清除',
    distanceLine: (km, minutes) => `道路距离：单程 ${km}（约 ${minutes} 分钟）`,
    rateNote: (rate) => `每公里 ${rate}`,
    calculating: '正在计算道路距离…',
    distanceFailed: '暂时无法计算距离。您仍然可以发送请求，我们会在 WhatsApp 报价。',
    tripType: '行程类型',
    oneWay: '单程',
    roundTrip: '来回',
    pickupTime: '上车时间',
    returnTime: '回程上车时间',
    returnTimeHint: '大概时间就可以。',
    needAccompaniment: '需要医院陪诊吗？',
    yes: '需要',
    no: '不需要',
    hours: '等候 / 陪诊时数',
    hoursUnit: (n) => `${n} 小时`,
    decreaseHours: '减少时数',
    increaseHours: '增加时数',
    estimatedTotal: '估计总价',
    transport: '车费',
    transportCrossingNote: '已包含威省与槟岛之间的过海费用',
    accompanimentLine: (n) => `医院陪诊（${n} 小时）`,
    peakLine: (n) => `高峰时段附加费（${n} 趟）`,
    chooseLocations: '请输入准确的上车地点和目的地，查看估价。',
    disclaimer: '这只是估价。最终价格由 CareRide 在 WhatsApp 确认。',
    formTitle: '预订资料',
    name: '您的姓名',
    phone: '联系电话',
    phoneHint: '例如 012-345 6789',
    pickupAddress: '准确上车地点',
    pickupAddressPlaceholder: '住家地址、大楼或地标',
    destinationAddress: '准确目的地',
    destinationAddressPlaceholder: '例如医院或诊所名称',
    date: '出发日期',
    dateHint: (n) => `请选择至少 ${n} 天后的日期。`,
    notes: '备注（可不填）',
    notesPlaceholder: '例如使用轮椅、乘客人数',
    estimatedPrice: '估计价格',
    submit: '通过 WhatsApp 发送预订请求',
    submitNote: '您的预订还没有确认。CareRide 会在 WhatsApp 回复确认。',
    errors: {
      required: '请填写这一栏。',
      phone: '请输入正确的电话号码。',
      dateTooSoon: (n) => `请选择至少 ${n} 天后的日期。`,
      pickup: '请搜索并选择上车地点。',
      destination: '请搜索并选择目的地。',
    },
    sentTitle: '正在打开 WhatsApp',
    sentText: '请在 WhatsApp 按发送。CareRide 回复确认后，预订才算成功。',
  },
  faq: {
    title: '常见问题',
    items: [
      { q: '需要提前多久预订？', a: '请至少在出发前 3 天预订，让我们好好安排您的行程。' },
      { q: '每天都营业吗？', a: '是的，CareRide 每天营业。请发 WhatsApp 询问是否有空档。' },
      {
        q: '可以有人在医院陪我吗？',
        a: '可以。选择医院陪诊服务，我们会陪您去医院、在看诊时等候，再送您回家。2 小时起。',
      },
      {
        q: '价格是怎么计算的？',
        a: `我们会计算您准确的上车地点和目的地之间的道路距离。往返威省和槟岛的行程另加跨海附加费，高峰时段出发的行程另加 ${peak}。已注册的顾客可以使用优惠券减少车费。`,
      },
      {
        q: '网站上的价格是最终价格吗？',
        a: '不是。计算器显示的是估价。出发前 CareRide 会在 WhatsApp 和您确认最终价格。',
      },
      { q: '服务哪些地区？', a: '大山脚、北赖、诗布朗再也、北海和槟岛。' },
    ],
  },
  contact: {
    title: '联系 CareRide',
    text: '需要可靠的接送，或有人陪您去医院吗？今天就联系 CareRide。我们会让您的行程更安全、更轻松、更舒适。',
    button: '在 WhatsApp 联系我们',
    everyday: '每天营业',
    location: '马来西亚槟城',
  },
  footer: {
    rights: '版权所有。',
    estimateNote: '本网站价格均为估价，以 WhatsApp 确认为准。',
  },
}

export const translations: Record<Lang, Translation> = { en, ms, zh }
