// Indonesian Locations Data: Provinces, Cities/Regencies, and Districts

export interface ProvinceData {
  name: string;
  cities: {
    name: string;
    districts: string[];
  }[];
}

export const INDONESIA_LOCATIONS: ProvinceData[] = [
  {
    name: 'DKI Jakarta',
    cities: [
      {
        name: 'Jakarta Selatan',
        districts: [
          'Kebayoran Baru',
          'Kebayoran Lama',
          'Cilandak',
          'Pesanggrahan',
          'Pasar Minggu',
          'Jagakarsa',
          'Mampang Prapatan',
          'Pancoran',
          'Tebet',
          'Setiabudi'
        ]
      },
      {
        name: 'Jakarta Pusat',
        districts: [
          'Gambir',
          'Tanah Abang',
          'Menteng',
          'Senen',
          'Cempaka Putih',
          'Johar Baru',
          'Kemayoran',
          'Sawah Besar'
        ]
      },
      {
        name: 'Jakarta Barat',
        districts: [
          'Cengkareng',
          'Grogol Petamburan',
          'Kalideres',
          'Kebon Jeruk',
          'Kembangan',
          'Palmerah',
          'Taman Sari',
          'Tambora'
        ]
      },
      {
        name: 'Jakarta Timur',
        districts: [
          'Matraman',
          'Pulo Gadung',
          'Jatinegara',
          'Duren Sawit',
          'Kramat Jati',
          'Makasar',
          'Pasar Rebo',
          'Ciracas',
          'Cipayung',
          'Cakung'
        ]
      },
      {
        name: 'Jakarta Utara',
        districts: [
          'Penjaringan',
          'Tanjung Priok',
          'Koja',
          'Cilincing',
          'Pademangan',
          'Kelapa Gading'
        ]
      },
      {
        name: 'Kepulauan Seribu',
        districts: ['Kepulauan Seribu Selatan', 'Kepulauan Seribu Utara']
      }
    ]
  },
  {
    name: 'Jawa Barat',
    cities: [
      {
        name: 'Kota Bandung',
        districts: [
          'Coblong',
          'Cicendo',
          'Sumur Bandung',
          'Andir',
          'Astanaanyar',
          'Babakan Ciparay',
          'Bandung Kidul',
          'Bandung Kulon',
          'Bandung Wetan',
          'Batununggal',
          'Bojongloa Kaler',
          'Bojongloa Kidul',
          'Buahbatu',
          'Cibeunying Kaler',
          'Cibeunying Kidul',
          'Cibiru',
          'Cidadap',
          'Cinambo',
          'Gedebage',
          'Kiaracondong',
          'Lengkong',
          'Mandalajati',
          'Panyileukan',
          'Rancasari',
          'Regol',
          'Sukajadi',
          'Sukasari',
          'Ujungberung'
        ]
      },
      {
        name: 'Kota Bekasi',
        districts: [
          'Bekasi Barat',
          'Bekasi Timur',
          'Bekasi Selatan',
          'Bekasi Utara',
          'Medan Satria',
          'Rawalumbu',
          'Pondok Gede',
          'Jatiasih',
          'Jatisampurna',
          'Mustika Jaya',
          'Bantargebang',
          'Pondok Melati'
        ]
      },
      {
        name: 'Kota Depok',
        districts: [
          'Beji',
          'Pancoran Mas',
          'Cipayung',
          'Sukmajaya',
          'Cilodong',
          'Cimanggis',
          'Tapos',
          'Sawangan',
          'Bojongsari',
          'Limo',
          'Cinere'
        ]
      },
      {
        name: 'Kota Bogor',
        districts: [
          'Bogor Barat',
          'Bogor Selatan',
          'Bogor Tengah',
          'Bogor Timur',
          'Bogor Utara',
          'Tanah Sareal'
        ]
      },
      {
        name: 'Kab. Bogor',
        districts: [
          'Cibinong',
          'Babakan Madang',
          'Bojonggede',
          'Ciawi',
          'Ciampea',
          'Cileungsi',
          'Gunung Putri',
          'Kemang',
          'Klapanunggal',
          'Parung',
          'Citeureup',
          'Sukaraja'
        ]
      },
      {
        name: 'Kab. Bekasi',
        districts: [
          'Cikarang Barat',
          'Cikarang Pusat',
          'Cikarang Selatan',
          'Cikarang Timur',
          'Cikarang Utara',
          'Tambun Selatan',
          'Tambun Utara',
          'Cibitung',
          'Setu',
          'Tarumajaya'
        ]
      },
      {
        name: 'Kota Cimahi',
        districts: ['Cimahi Selatan', 'Cimahi Tengah', 'Cimahi Utara']
      },
      {
        name: 'Kab. Bandung',
        districts: [
          'Baleendah',
          'Banjaran',
          'Bojongsoang',
          'Cangkuang',
          'Cicalengka',
          'Cileunyi',
          'Katapang',
          'Margaasih',
          'Margahayu',
          'Soreang'
        ]
      },
      {
        name: 'Kab. Bandung Barat',
        districts: ['Lembang', 'Ngamprah', 'Padalarang', 'Parongpong', 'Batujajar', 'Cisarua']
      },
      {
        name: 'Kota Cirebon',
        districts: ['Harjamukti', 'Kejaksan', 'Kesambi', 'Lemahwungkuk', 'Pekalipan']
      },
      {
        name: 'Kota Sukabumi',
        districts: [
          'Baros',
          'Cibeureum',
          'Cikole',
          'Citamiang',
          'Gunungpuyuh',
          'Lembursitu',
          'Warudoyong'
        ]
      },
      {
        name: 'Kota Tasikmalaya',
        districts: ['Cihideung', 'Cipedes', 'Indihiang', 'Kawalu', 'Mangkubumi', 'Tawang']
      },
      {
        name: 'Kab. Karawang',
        districts: [
          'Karawang Barat',
          'Karawang Timur',
          'Telukjambe Timur',
          'Telukjambe Barat',
          'Klari',
          'Cikampek'
        ]
      }
    ]
  },
  {
    name: 'Banten',
    cities: [
      {
        name: 'Kota Tangerang Selatan',
        districts: [
          'Serpong',
          'Serpong Utara',
          'Pondok Aren',
          'Ciputat',
          'Ciputat Timur',
          'Pamulang',
          'Setu'
        ]
      },
      {
        name: 'Kota Tangerang',
        districts: [
          'Batuceper',
          'Benda',
          'Cibodas',
          'Ciledug',
          'Cipondoh',
          'Jatiuwung',
          'Karangtengah',
          'Karawaci',
          'Larangan',
          'Neglasari',
          'Periuk',
          'Pinang',
          'Tangerang'
        ]
      },
      {
        name: 'Kab. Tangerang',
        districts: [
          'Balaraja',
          'Cikupa',
          'Curug',
          'Kelapa Dua',
          'Kosambi',
          'Legok',
          'Pagedangan',
          'Pasar Kemis',
          'Sepatan',
          'Teluknaga',
          'Tigaraksa'
        ]
      },
      {
        name: 'Kota Serang',
        districts: ['Cipocok Jaya', 'Curug', 'Kasemen', 'Serang', 'Taktakan', 'Walantaka']
      },
      {
        name: 'Kota Cilegon',
        districts: [
          'Cibeber',
          'Cilegon',
          'Citangkil',
          'Ciwandan',
          'Gerogol',
          'Jombang',
          'Pulomerak',
          'Purwakarta'
        ]
      },
      {
        name: 'Kab. Serang',
        districts: ['Anyar', 'Baros', 'Ciruas', 'Kikubulu', 'Kragilan', 'Pontang', 'Waringinkurung']
      },
      {
        name: 'Kab. Pandeglang',
        districts: ['Pandeglang', 'Majasari', 'Labuan', 'Menes', 'Cadasari']
      },
      {
        name: 'Kab. Lebak',
        districts: ['Rangkasbitung', 'Cibadak', 'Malingping', 'Bayah']
      }
    ]
  },
  {
    name: 'DI Yogyakarta',
    cities: [
      {
        name: 'Kota Yogyakarta',
        districts: [
          'Danurejan',
          'Gedongtengen',
          'Gondokusuman',
          'Gondomanan',
          'Jetis',
          'Kotagede',
          'Kraton',
          'Mantrijeron',
          'Mergangsan',
          'Ngampilan',
          'Pakualaman',
          'Tegalrejo',
          'Umbulharjo',
          'Wirobrajan'
        ]
      },
      {
        name: 'Kab. Sleman',
        districts: [
          'Depok',
          'Mlati',
          'Ngaglik',
          'Gamping',
          'Godean',
          'Kalasan',
          'Berbah',
          'Prambanan',
          'Sleman',
          'Tempel',
          'Turi',
          'Pakem',
          'Cangkringan'
        ]
      },
      {
        name: 'Kab. Bantul',
        districts: [
          'Bantul',
          'Banguntapan',
          'Sewon',
          'Kasihan',
          'Piyungan',
          'Pleret',
          'Imogiri',
          'Kretek',
          'Sanden',
          'Sedayu',
          'Pandak',
          'Srandakan'
        ]
      },
      {
        name: 'Kab. Kulon Progo',
        districts: ['Wates', 'Pengasih', 'Sentolo', 'Galur', 'Lendah', 'Temon']
      },
      {
        name: 'Kab. Gunungkidul',
        districts: ['Wonosari', 'Playen', 'Patuk', 'Semanu', 'Karangmojo']
      }
    ]
  },
  {
    name: 'Jawa Tengah',
    cities: [
      {
        name: 'Kota Semarang',
        districts: [
          'Banyumanik',
          'Candisari',
          'Gajahmungkur',
          'Gayamsari',
          'Genuk',
          'Gunungpati',
          'Ngaliyan',
          'Pedurungan',
          'Semarang Barat',
          'Semarang Selatan',
          'Semarang Tengah',
          'Semarang Timur',
          'Semarang Utara',
          'Tembalang',
          'Tugu'
        ]
      },
      {
        name: 'Kota Surakarta (Solo)',
        districts: ['Banjarsari', 'Jebres', 'Laweyan', 'Pasar Kliwon', 'Serengan']
      },
      {
        name: 'Kab. Sukoharjo',
        districts: ['Kartasura', 'Grogol', 'Baki', 'Sukoharjo', 'Mojolaban']
      },
      {
        name: 'Kab. Klaten',
        districts: [
          'Klaten Utara',
          'Klaten Tengah',
          'Klaten Selatan',
          'Delanggu',
          'Prambanan',
          'Jogonalan'
        ]
      },
      {
        name: 'Kota Magelang',
        districts: ['Magelang Selatan', 'Magelang Tengah', 'Magelang Utara']
      },
      {
        name: 'Kota Salatiga',
        districts: ['Argomulyo', 'Sidomukti', 'Sidorejo', 'Tingkir']
      },
      {
        name: 'Kota Pekalongan',
        districts: [
          'Pekalongan Barat',
          'Pekalongan Selatan',
          'Pekalongan Timur',
          'Pekalongan Utara'
        ]
      },
      {
        name: 'Kota Tegal',
        districts: ['Margadana', 'Tegal Barat', 'Tegal Selatan', 'Tegal Timur']
      },
      {
        name: 'Kab. Banyumas (Purwokerto)',
        districts: [
          'Purwokerto Barat',
          'Purwokerto Selatan',
          'Purwokerto Timur',
          'Purwokerto Utara',
          'Baturraden',
          'Sokaraja'
        ]
      },
      {
        name: 'Kab. Kudus',
        districts: ['Kota Kudus', 'Jati', 'Gebog', 'Kaliwungu', 'Bae']
      }
    ]
  },
  {
    name: 'Jawa Timur',
    cities: [
      {
        name: 'Kota Surabaya',
        districts: [
          'Gubeng',
          'Wonokromo',
          'Tegalsari',
          'Genteng',
          'Bubutan',
          'Rungkut',
          'Sukolilo',
          'Mulyorejo',
          'Kenjeran',
          'Krembangan',
          'Pabean Cantian',
          'Semampir',
          'Sawahan',
          'Wonocolo',
          'Wiyung',
          'Dukuh Pakis',
          'Gayungan',
          'Jambangan',
          'Karangpilang',
          'Sambikerep',
          'Tandes',
          'Lakarsantri',
          'Pakal',
          'Benowo'
        ]
      },
      {
        name: 'Kota Malang',
        districts: ['Klojen', 'Blimbing', 'Lowokwaru', 'Sukun', 'Kedungkandang']
      },
      {
        name: 'Kota Batu',
        districts: ['Batu', 'Bumiaji', 'Junrejo']
      },
      {
        name: 'Kab. Sidoarjo',
        districts: [
          'Sidoarjo',
          'Waru',
          'Candi',
          'Gedangan',
          'Sedati',
          'Buduran',
          'Taman',
          'Krian',
          'Sukodono'
        ]
      },
      {
        name: 'Kab. Gresik',
        districts: ['Gresik', 'Kebomas', 'Manyar', 'Driyorejo', 'Menganti', 'Cerme']
      },
      {
        name: 'Kota Kediri',
        districts: ['Kota', 'Mojoroto', 'Pesantren']
      },
      {
        name: 'Kota Madiun',
        districts: ['Kartoharjo', 'Manguharjo', 'Taman']
      },
      {
        name: 'Kab. Jember',
        districts: ['Kaliwates', 'Sumbersari', 'Patrang', 'Ambulu', 'Tanggul']
      },
      {
        name: 'Kab. Banyuwangi',
        districts: ['Banyuwangi', 'Giri', 'Kalipuro', 'Rogojampi', 'Genteng']
      }
    ]
  },
  {
    name: 'Bali',
    cities: [
      {
        name: 'Kota Denpasar',
        districts: ['Denpasar Barat', 'Denpasar Selatan', 'Denpasar Timur', 'Denpasar Utara']
      },
      {
        name: 'Kab. Badung',
        districts: ['Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi', 'Abiansemal', 'Petang']
      },
      {
        name: 'Kab. Gianyar',
        districts: ['Ubud', 'Gianyar', 'Sukawati', 'Blahbatuh', 'Tampaksiring']
      },
      {
        name: 'Kab. Tabanan',
        districts: ['Tabanan', 'Kediri', 'Marga', 'Baturiti']
      },
      {
        name: 'Kab. Buleleng (Singaraja)',
        districts: ['Buleleng', 'Sukasada', 'Seririt', 'Banjar']
      }
    ]
  },
  {
    name: 'Sumatera Utara',
    cities: [
      {
        name: 'Kota Medan',
        districts: [
          'Medan Kota',
          'Medan Barat',
          'Medan Baru',
          'Medan Petisah',
          'Medan Sunggal',
          'Medan Selayang',
          'Medan Tembung',
          'Medan Helvetia',
          'Medan Denai',
          'Medan Johor',
          'Medan Amplas',
          'Medan Timur',
          'Medan Perjuangan',
          'Medan Maimun',
          'Medan Polonia',
          'Medan Marelan',
          'Medan Labuhan',
          'Medan Belawan',
          'Medan Deli',
          'Medan Tuntungan'
        ]
      },
      {
        name: 'Kab. Deli Serdang',
        districts: [
          'Lubuk Pakam',
          'Percut Sei Tuan',
          'Sunggal',
          'Tanjung Morawa',
          'Pancur Batu',
          'Batang Kuis'
        ]
      },
      {
        name: 'Kota Binjai',
        districts: ['Binjai Barat', 'Binjai Kota', 'Binjai Selatan', 'Binjai Timur', 'Binjai Utara']
      },
      {
        name: 'Kota Pematangsiantar',
        districts: [
          'Siantar Barat',
          'Siantar Marihat',
          'Siantar Marimbun',
          'Siantar Martoba',
          'Siantar Selatan',
          'Siantar Sitalasari',
          'Siantar Timur',
          'Siantar Utara'
        ]
      }
    ]
  },
  {
    name: 'Sumatera Barat',
    cities: [
      {
        name: 'Kota Padang',
        districts: [
          'Padang Barat',
          'Padang Timur',
          'Padang Selatan',
          'Padang Utara',
          'Koto Tangah',
          'Kuranji',
          'Nanggalo',
          'Lubuk Begalung',
          'Lubuk Kilangan',
          'Pauh',
          'Bungus Teluk Kabung'
        ]
      },
      {
        name: 'Kota Bukittinggi',
        districts: ['Aur Birugo Tigo Baleh', 'Guguk Panjang', 'Mandiangin Koto Selayan']
      },
      {
        name: 'Kota Payakumbuh',
        districts: [
          'Payakumbuh Barat',
          'Payakumbuh Selatan',
          'Payakumbuh Timur',
          'Payakumbuh Utara',
          'Lamposi Tigo Nagori'
        ]
      }
    ]
  },
  {
    name: 'Riau',
    cities: [
      {
        name: 'Kota Pekanbaru',
        districts: [
          'Bukit Raya',
          'Marpoyan Damai',
          'Payung Sekaki',
          'Pekanbaru Kota',
          'Rumbai',
          'Rumbai Barat',
          'Rumbai Timur',
          'Sail',
          'Senapelan',
          'Sukajadi',
          'Tenayan Raya',
          'Tuah Madani',
          'Kulim',
          'Binawidya',
          'Lima Puluh'
        ]
      },
      {
        name: 'Kota Dumai',
        districts: [
          'Dumai Barat',
          'Dumai Kota',
          'Dumai Selatan',
          'Dumai Timur',
          'Medang Kampai',
          'Sungai Sembilan'
        ]
      },
      {
        name: 'Kab. Kampar',
        districts: ['Bangkinang Kota', 'Siak Hulu', 'Tambang', 'Tapung', 'Kampar']
      }
    ]
  },
  {
    name: 'Kepulauan Riau',
    cities: [
      {
        name: 'Kota Batam',
        districts: [
          'Batam Kota',
          'Batu Ampar',
          'Bengkong',
          'Lubuk Baja',
          'Nongsa',
          'Sekupang',
          'Sagulung',
          'Batu Aji',
          'Sei Beduk'
        ]
      },
      {
        name: 'Kota Tanjungpinang',
        districts: [
          'Bukit Bestari',
          'Tanjungpinang Barat',
          'Tanjungpinang Kota',
          'Tanjungpinang Timur'
        ]
      }
    ]
  },
  {
    name: 'Sumatera Selatan',
    cities: [
      {
        name: 'Kota Palembang',
        districts: [
          'Ilir Barat I',
          'Ilir Barat II',
          'Ilir Timur I',
          'Ilir Timur II',
          'Ilir Timur III',
          'Seberang Ulu I',
          'Seberang Ulu II',
          'Sukarami',
          'Alang-Alang Lebar',
          'Sako',
          'Kemuning',
          'Plaju',
          'Kalidoni',
          'Bukit Kecil'
        ]
      },
      {
        name: 'Kota Prabumulih',
        districts: [
          'Prabumulih Barat',
          'Prabumulih Selatan',
          'Prabumulih Timur',
          'Prabumulih Utara'
        ]
      }
    ]
  },
  {
    name: 'Lampung',
    cities: [
      {
        name: 'Kota Bandar Lampung',
        districts: [
          'Bumi Waras',
          'Enggal',
          'Kedamaian',
          'Kedaton',
          'Kemiling',
          'Labuhan Ratu',
          'Langkapura',
          'Panjang',
          'Rajabasa',
          'Sukabumi',
          'Sukarame',
          'Tanjung Karang Barat',
          'Tanjung Karang Pusat',
          'Tanjung Karang Timur',
          'Tanjung Senang',
          'Telukbetung Barat',
          'Telukbetung Selatan',
          'Telukbetung Timur',
          'Telukbetung Utara',
          'Way Halim'
        ]
      },
      {
        name: 'Kota Metro',
        districts: ['Metro Barat', 'Metro Pusat', 'Metro Selatan', 'Metro Timur', 'Metro Utara']
      }
    ]
  },
  {
    name: 'Kalimantan Timur',
    cities: [
      {
        name: 'Kota Samarinda',
        districts: [
          'Loa Janan Ilir',
          'Palaran',
          'Samarinda Ilir',
          'Samarinda Kota',
          'Samarinda Seberang',
          'Samarinda Ulu',
          'Samarinda Utara',
          'Sambutan',
          'Sungai Kunjang',
          'Sungai Pinang'
        ]
      },
      {
        name: 'Kota Balikpapan',
        districts: [
          'Balikpapan Barat',
          'Balikpapan Kota',
          'Balikpapan Selatan',
          'Balikpapan Tengah',
          'Balikpapan Timur',
          'Balikpapan Utara'
        ]
      },
      {
        name: 'Kab. Kutai Kartanegara',
        districts: [
          'Tenggarong',
          'Tenggarong Seberang',
          'Loa Janan',
          'Loa Kulu',
          'Samboja',
          'Muara Badak'
        ]
      }
    ]
  },
  {
    name: 'Kalimantan Barat',
    cities: [
      {
        name: 'Kota Pontianak',
        districts: [
          'Pontianak Barat',
          'Pontianak Kota',
          'Pontianak Selatan',
          'Pontianak Tenggara',
          'Pontianak Timur',
          'Pontianak Utara'
        ]
      },
      {
        name: 'Kota Singkawang',
        districts: [
          'Singkawang Barat',
          'Singkawang Selatan',
          'Singkawang Tengah',
          'Singkawang Timur',
          'Singkawang Utara'
        ]
      },
      {
        name: 'Kab. Kubu Raya',
        districts: ['Sungai Raya', 'Sungai Kakap', 'Kuala Mandor B', 'Rasau Jaya']
      }
    ]
  },
  {
    name: 'Kalimantan Selatan',
    cities: [
      {
        name: 'Kota Banjarmasin',
        districts: [
          'Banjarmasin Barat',
          'Banjarmasin Selatan',
          'Banjarmasin Tengah',
          'Banjarmasin Timur',
          'Banjarmasin Utara'
        ]
      },
      {
        name: 'Kota Banjarbaru',
        districts: [
          'Banjarbaru Selatan',
          'Banjarbaru Utara',
          'Cempaka',
          'Landasan Ulin',
          'Liang Anggang'
        ]
      }
    ]
  },
  {
    name: 'Sulawesi Selatan',
    cities: [
      {
        name: 'Kota Makassar',
        districts: [
          'Biringkanaya',
          'Bontoala',
          'Makassar',
          'Mamajang',
          'Manggala',
          'Mariso',
          'Panakkukang',
          'Rappocini',
          'Tallo',
          'Tamalanrea',
          'Tamalate',
          'Ujung Pandang',
          'Ujung Tanah',
          'Wajo',
          'Kepulauan Sangkarrang'
        ]
      },
      {
        name: 'Kab. Gowa',
        districts: ['Somba Opu', 'Pallangga', 'Bontomarannu', 'Barombong', 'Bajeng']
      },
      {
        name: 'Kab. Maros',
        districts: ['Turikale', 'Mandai', 'Maros Baru', 'Tanralili', 'Moncongloe']
      },
      {
        name: 'Kota Parepare',
        districts: ['Bacukiki', 'Bacukiki Barat', 'Soreang', 'Ujung']
      },
      {
        name: 'Kota Palopo',
        districts: [
          'Bara',
          'Mungkajang',
          'Sendana',
          'Tellu Wanua',
          'Wara',
          'Wara Barat',
          'Wara Selatan',
          'Wara Timur',
          'Wara Utara'
        ]
      }
    ]
  },
  {
    name: 'Sulawesi Utara',
    cities: [
      {
        name: 'Kota Manado',
        districts: [
          'Bunaken',
          'Bunaken Kepulauan',
          'Malalayang',
          'Mapanget',
          'Paal Dua',
          'Sario',
          'Singkil',
          'Tikala',
          'Tuminting',
          'Wanea',
          'Wenang'
        ]
      },
      {
        name: 'Kota Tomohon',
        districts: [
          'Tomohon Barat',
          'Tomohon Selatan',
          'Tomohon Tengah',
          'Tomohon Timur',
          'Tomohon Utara'
        ]
      },
      {
        name: 'Kab. Minahasa Utara',
        districts: ['Airmadidi', 'Kalawat', 'Kauditan', 'Likupang Timur']
      }
    ]
  },
  {
    name: 'Nusa Tenggara Barat',
    cities: [
      {
        name: 'Kota Mataram',
        districts: ['Ampenan', 'Cakranegara', 'Mataram', 'Sandubaya', 'Sekarbela', 'Selaparang']
      },
      {
        name: 'Kab. Lombok Barat',
        districts: ['Gerung', 'Kediri', 'Narmada', 'Batulayar', 'Gunungsari']
      },
      {
        name: 'Kab. Lombok Tengah',
        districts: ['Praya', 'Pujut', 'Jonggat', 'Pringgarata']
      }
    ]
  },
  {
    name: 'Nusa Tenggara Timur',
    cities: [
      {
        name: 'Kota Kupang',
        districts: ['Alak', 'Kelapa Lima', 'Kota Raja', 'Kota Lama', 'Maulafa', 'Oebobo']
      }
    ]
  },
  {
    name: 'Papua',
    cities: [
      {
        name: 'Kota Jayapura',
        districts: ['Abepura', 'Heram', 'Jayapura Selatan', 'Jayapura Utara', 'Muara Tami']
      },
      {
        name: 'Kab. Jayapura',
        districts: ['Sentani', 'Sentani Barat', 'Sentani Timur', 'Waibu']
      }
    ]
  }
];

export const ALL_PROVINCES = INDONESIA_LOCATIONS.map((p) => p.name);

export function getCitiesByProvince(provinceName: string): string[] {
  const found = INDONESIA_LOCATIONS.find(
    (p) => p.name.toLowerCase() === provinceName.toLowerCase()
  );
  return found ? found.cities.map((c) => c.name) : [];
}

export function getDistrictsByCity(provinceName: string, cityName: string): string[] {
  const province = INDONESIA_LOCATIONS.find(
    (p) => p.name.toLowerCase() === provinceName.toLowerCase()
  );
  if (!province) return [];
  const city = province.cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
  return city ? city.districts : [];
}
