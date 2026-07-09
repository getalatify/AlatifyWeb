export const id = {
  "home": {
    "hero": {
      "tagline": "Alat pemrosesan gambar yang mengutamakan privasi, berjalan sepenuhnya di browser kamu"
    },
    "features": {
      "card1": {
        "text": "Semua algoritma dieksekusi secara lokal di dalam tab browser kamu yang terisolasi. Tidak ada server yang menyimpan file kamu."
      },
      "card2": {
        "text": "Lewati waktu tunggu unggahan sepenuhnya. Proses gambar beresolusi tinggi langsung di perangkat kamu."
      }
    }
  },
  "about": {
    "intro": "Alat pemrosesan gambar seharusnya menghormati privasi kamu.",
    "why": {
      "p1": "Sebagian besar alat gambar online mengharuskan kamu mengunggah file ke server mereka. Itu berarti gambar kamu — yang mungkin berisi momen pribadi, aset bisnis, atau konten sensitif — melewati infrastruktur orang lain.",
      "p2": "Alatify berbeda: setiap alat berjalan sepenuhnya di browser kamu menggunakan WebAssembly. File kamu tidak pernah meninggalkan perangkat kamu. Kami percaya pada penyediaan utilitas yang cepat, bertenaga, dan benar-benar privat yang menghormati otonomi pengguna."
    },
    "offer": {
      "li1": "Sebuah paket browser lengkap yang terdiri dari Image Compressor, Background Remover, Image Resizer, Format Converter, dan Image Cropper.",
      "li2": "Tanpa pendaftaran pengguna, tanpa unggahan di sisi server, dan tanpa cookie analitik.",
      "li3": "Proses file dengan ukuran apa pun tanpa pendaftaran, kartu kredit, atau batasan tersembunyi.",
      "li4": "Eksekusi kode yang transparan dan dapat berfungsi secara offline menggunakan kontainer web standar."
    },
    "who": {
      "p1": "Alatify dirancang dan dibangun oleh seorang pengembang independen di Indonesia. Didorong oleh semangat untuk teknologi yang mengutamakan privasi dan pengalaman pengguna yang bersih, platform ini dirancang untuk membuktikan bahwa aplikasi berbasis browser dapat mencapai kemampuan tingkat profesional tanpa mengorbankan privasi pengguna.",
      "p2": "Stack teknologi kami menggunakan Next.js, WebAssembly, dan Tailwind CSS, dengan hosting dan pengiriman aset statis yang disediakan oleh Vercel. Jika kamu merasa Alatify berguna, silakan bagikan dengan orang lain yang menghargai privasi!"
    },
    "road": {
      "p1": "Alatify dibangun untuk terus berkembang. Rangkaian alatnya kini mencakup penghapusan latar, kompresi, konversi format, pengubahan ukuran, pemotongan, pembersihan EXIF, watermark, dan AI upscaling — semuanya berjalan secara lokal di browser kamu, dengan alat baru yang mengutamakan privasi ditambahkan dari waktu ke waktu.",
      "p2_start": "Umpan balik kamu sangat berharga. Jika kamu memiliki saran, permintaan fitur, atau bug untuk dilaporkan, hubungi kami di",
      "p2_end": "."
    }
  },
  "privacy": {
    "short": "Alatify tidak mengumpulkan, menyimpan, atau mengirimkan gambar atau data pribadi kamu. Semua pemrosesan terjadi sepenuhnya di browser kamu. Tidak ada pendaftaran akun, tidak ada pelacakan pengguna, dan tidak ada analitik pihak ketiga.",
    "collect": {
      "p1": "Karena Alatify dirancang untuk berjalan 100% secara lokal di komputer kamu, kami tidak mengakses atau mengumpulkan hal-hal berikut:",
      "li1": "File kamu tidak pernah diunggah ke server jarak jauh mana pun. File tersebut diurai dan diubah secara lokal di dalam sandbox browser kamu.",
      "li2": "Kami tidak mencatat parameter koneksi kamu.",
      "li3": "Kami tidak memantau seberapa sering kamu menggunakan alat kami atau pengaturan apa yang kamu terapkan.",
      "li4": "Kami tidak menggunakan kode pelacakan, cookie pihak ketiga, atau sidik jari browser.",
      "li5": "Tidak ada nama, alamat email, kredensial pembayaran, atau akun yang diperlukan."
    },
    "do": {
      "p1": "Untuk menyediakan utilitas pemrosesan gambar kami tanpa beban server, Alatify beroperasi berdasarkan prinsip-prinsip ini:",
      "li1": "Kami mengompilasi alat menggunakan WebAssembly dan JavaScript sisi klien. Semua komputasi dieksekusi di dalam utas browser kamu menggunakan sumber daya perangkat keras lokal kamu.",
      "li2": "Model AI (seperti bobot mesin Background Remover) diunduh ke dalam cache browser kamu sekali. Model tersebut disimpan secara lokal di perangkat kamu untuk penggunaan berulang dan tidak pernah dikirimkan.",
      "li3": "Aset web kami (HTML, CSS, JS) disajikan sebagai file statis melalui Content Delivery Networks (CDNs) global untuk ketersediaan tinggi."
    },
    "thirdParty": {
      "p1": "Kami meminimalkan koneksi pihak ketiga. Satu-satunya layanan eksternal yang terlibat adalah penyedia web host standar yang diperlukan untuk menampilkan halaman ini:",
      "li1": "Platform kami di-host di Vercel. Vercel secara otomatis memproses log server web standar (yang berisi header anonim) untuk menyajikan sumber daya statis dan melindungi dari serangan DDoS.",
      "li2": "Model jaringan saraf yang digunakan dalam penghapusan latar belakang diunduh langsung ke browser kamu dari host imgly CDN. Setelah diunduh, model tersebut berjalan secara lokal.",
      "li3": "Kami sengaja mengecualikan Google Analytics, Facebook Pixel, Mixpanel, Hotjar, atau alat pelacak lainnya."
    },
    "rights": {
      "p1": "Di bawah GDPR, CCPA, dan standar privasi global, hak-hak kamu secara otomatis dihormati:",
      "li1": "Kamu tidak perlu meminta penghapusan data kamu karena kami tidak pernah mengumpulkannya.",
      "li2": "Kamu dapat menghapus sepenuhnya bobot saraf dan data model yang tersimpan di cache dengan membersihkan cache browser kamu.",
      "li3": "Karena tidak ada pengumpulan data atau pelacakan sama sekali, tidak diperlukan spanduk cookie, formulir opt-out, atau pusat preferensi privasi."
    },
    "contact": {
      "start": "Punya pertanyaan tentang arsitektur lokal-pertama kami? Hubungi kami di",
      "end": ""
    }
  },
  "terms": {
    "short": "Gunakan Alatify secara bebas untuk keperluan pribadi maupun komersial. Kami menyediakan alat berbasis browser ini \"apa adanya\" tanpa jaminan. Kamu tetap bertanggung jawab penuh atas gambar yang kamu proses, dan kamu tidak boleh menggunakan Alatify untuk menangani konten ilegal.",
    "license": {
      "p1": "Kami memberi kamu lisensi yang mengizinkan dan bebas royalti untuk menggunakan Alatify berdasarkan ketentuan berikut:",
      "li1": "Kamu bebas mengubah dan mengekspor gambar untuk produk komersial, desain pribadi, branding media sosial, atau publikasi cetak.",
      "li2": "Kamu tidak diharuskan memberikan kredit kepada Alatify atau menautkan kembali ke layanan kami pada hasil karya akhir kamu.",
      "li3": "Tidak ada batasan tingkat pemrosesan, batas unggah, atau dinding akun karena semua proses ditenagai oleh perangkat lokal kamu sendiri.",
    },
    "user": {
      "p1": "Karena Alatify hanya berjalan secara lokal, kami tidak memantau atau membatasi gambar apa yang kamu impor. Namun, dengan menggunakan layanan ini, kamu menyetujui tanggung jawab berikut:",
      "li1": "Kamu memverifikasi bahwa kamu memiliki atau memiliki hak lisensi yang sesuai atas gambar yang kamu impor dan ubah.",
      "li2": "Kamu tidak boleh menggunakan Alatify untuk memproses materi yang ilegal, melecehkan, atau berbahaya, termasuk aset berhak cipta tanpa izin, atau materi ilegal lainnya.",
      "li3": "Kamu menerima tanggung jawab untuk memastikan perangkat kamu memiliki sumber daya CPU dan RAM yang memadai untuk menjalankan komputasi WebAssembly yang berat secara aman."
    },
    "disclaimer": {
      "p1": "Silakan tinjau batasan tanggung jawab standar yang mengatur layanan berbasis browser kami:",
      "li1": "Alatify disediakan tanpa jaminan dalam bentuk apa pun, baik tersurat maupun tersirat. Kami tidak menjamin ketersediaan berkelanjutan, kompatibilitas dengan semua format file, atau rendering yang bebas dari kesalahan.",
      "li2": "Karena file gambar kamu diproses secara langsung dan tidak pernah disimpan di server mana pun, kami tidak dapat memulihkan konfigurasi atau editan yang hilang. Kami tidak bertanggung jawab atas kehilangan data apa pun.",
      "li3": "Hasil output (kompresi, pengubahan ukuran, pemformatan) adalah perkiraan. Verifikasi semua parameter output dan integritas file sebelum menyebarkan gambar ke tahap produksi."
    },
    "changes": "Ketentuan ini dapat berubah sewaktu-waktu secara berkala. Ketentuan layanan terbaru dan yang mengatur akan selalu dapat diakses di halaman ini. Penggunaan berkelanjutan kamu atas Alatify setelah perubahan diterapkan merupakan bentuk penerimaan terhadap ketentuan yang diperbarui tersebut.",
    "contact": {
      "start": "Punya pertanyaan tentang ketentuan layanan kami? Hubungi kami di",
      "end": ""
    }
  },
  "shared": {
    "privacyNotice": {
      "body": "Alatify memproses file grafis kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat privat kamu ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau retensi data di sisi server."
    },
    "related": {
      "blur": "",
      "exif-cleaner-metadata": "",
      "exif-cleaner-gps": "",
      "exif-cleaner-tags": "",
      "exif-cleaner-info": "",
      "bg-remover": "",
      "bg-remover-backdrops": "",
      "upscaler": "",
      "compressor-savings": "",
      "compressor-offline": "",
      "resizer-dimensions": "",
      "resizer-pixels": "",
      "converter-formats": "",
      "converter-instantly": "",
      "watermark": ""
    }
  },
  "tools": {
    "compressor": {
      "intro": "Kurangi ukuran file gambar hingga 90% sekaligus menjaganya tetap tajam — sepenuhnya di browser kamu. Pilih kompresi lossy untuk ukuran terkecil atau lossless untuk mempertahankan setiap piksel, dan proses seluruh kumpulan sekaligus. Tanpa unggah, tanpa pendaftaran — gambar kamu tidak pernah meninggalkan perangkat kamu.",
      "howItWorks": {
        "step1": "Tambahkan satu atau banyak gambar.",
        "step2": "Pilih lossy atau lossless, dan atur target kualitas kamu.",
        "step3": "Perkecil gambar secara instan, di perangkat kamu.",
        "step4": "Simpan file yang lebih kecil secara individual atau sebagai ZIP."
      },
      "useCases": {
        "case1": "Gambar yang lebih kecil dimuat lebih cepat serta meningkatkan kecepatan halaman dan SEO.",
        "case2": "Dapatkan ukuran di bawah batas lampiran dan unggahan tanpa kehilangan kualitas.",
        "case3": "Kosongkan ruang penyimpanan dengan memperkecil pustaka foto yang besar.",
        "case4": "Penuhi persyaratan ukuran platform sekaligus menjaga gambar tetap tajam."
      },
      "faq": {
        "q1": "Seberapa jauh ukuran gambar saya bisa berkurang?",
        "a1": "Sering kali hingga 90% lebih kecil, tergantung pada gambar dan pengaturan kualitas, sementara tetap terlihat tajam secara visual.",
        "q2": "Apakah alat ini mengunggah gambar saya?",
        "a2": "Tidak. Kompresi berjalan sepenuhnya di browser kamu; file kamu tidak pernah meninggalkan perangkat kamu.",
        "q3": "Apa perbedaan antara lossy dan lossless?",
        "a3": "Lossy memberikan ukuran terkecil dengan membuang beberapa detail yang tidak terlihat; lossless mempertahankan setiap piksel dan tetap mengurangi ukuran. Kamu yang memilih.",
        "q4": "Dapatkah saya mengompres banyak gambar sekaligus?",
        "a4": "Ya — kompres sekaligus dalam jumlah banyak dan unduh semuanya sebagai ZIP.",
        "q5": "Format apa saja yang didukung?",
        "a5": "JPG, PNG, dan WebP."
      },
      "privacyNotice": "Alatify memproses file grafis kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat privat kamu ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Kompres gambar JPG, PNG, dan WebP secara instan dan privat di perangkat kamu sendiri."
    },
    "bg-remover": {
      "sizes": {
        "isnet_quint8": "~45 MB",
        "isnet_fp16": "~85 MB",
        "isnet": "~170 MB"
      },
      "intro": "Sebagian besar penghapus latar belakang gratis mengunggah gambar kamu ke server mereka — dan banyak yang diam-diam menggunakannya untuk melatih AI mereka atau membatasi unduhan gratis pada resolusi rendah. Alatify berjalan sepenuhnya di browser kamu menggunakan AI di perangkat yang diakselerasi GPU. Foto kamu tidak pernah meninggalkan perangkat kamu. Tanpa pendaftaran, tanpa watermark, tanpa batas resolusi, dan tanpa batasan jumlah yang kamu proses — kualitas penuh, sepenuhnya privat, tanpa batas.",
      "howItWorks": {
        "step1": "Letakkan gambar kamu. Gambar tetap berada di perangkat kamu.",
        "step2": "AI di perangkat mendeteksi subjek dan menghapus latar belakang, diakselerasi GPU, dalam hitungan detik.",
        "step3": "Dapatkan potongan bersih dengan latar belakang transparan, pada resolusi penuh.",
        "step4": "Simpan PNG transparan kamu. Tanpa watermark, tanpa batasan."
      },
      "useCases": {
        "case1": "Foto produk dengan latar belakang transparan atau putih yang bersih untuk daftar Amazon, Etsy, Shopify, dan eBay.",
        "case2": "Isolasi diri kamu untuk foto profesional atau LinkedIn yang bersih.",
        "case3": "Potong logo, objek, atau orang untuk dimasukkan ke dalam desain, slide, dan thumbnail.",
        "case4": "Tempatkan subjek kamu di latar belakang apa pun untuk postingan, cerita, dan grafis."
      },
      "faq": {
        "q1": "Apakah ini benar-benar gratis dan tanpa batas?",
        "a1": "Ya — tanpa pendaftaran, tanpa watermark, tanpa batas harian, dan tanpa batasan resolusi. Alat ini berjalan di perangkat kamu sendiri, jadi tidak ada yang perlu kami batasi.",
        "q2": "Apakah alat ini mengunggah gambar saya ke server?",
        "a2": "Tidak. Berbeda dengan sebagian besar penghapus gratis yang memproses di sisi server — dan beberapa yang menggunakan unggahan kamu untuk melatih AI mereka — Alatify menjalankan AI sepenuhnya di browser kamu. Gambar kamu tidak pernah meninggalkan perangkat kamu.",
        "q3": "Apakah saya mendapatkan resolusi penuh?",
        "a3": "Ya. Banyak alat gratis membatasi unduhan pada resolusi rendah dan mengenakan biaya untuk HD. Alatify memberi kamu potongan resolusi penuh secara gratis.",
        "q4": "Bagaimana cara kerjanya tanpa mengunggah?",
        "a4": "Alat ini menggunakan AI di perangkat (via WebGPU/WebAssembly) yang berjalan secara lokal di browser kamu — perangkat kamu sendiri yang melakukan pemrosesan.",
        "q5": "Untuk apa saya bisa menggunakan hasilnya?",
        "a5": "Foto produk, PNG transparan untuk desain, foto profil, postingan sosial, dan daftar pasar — di mana saja kamu membutuhkan potongan yang bersih."
      },
      "privacyNotice": "Alatify menghapus latar belakang gambar seluruhnya di dalam tab browser kamu menggunakan AI di perangkat yang diakselerasi GPU. Foto kamu tidak pernah diunggah ke server, tidak pernah digunakan untuk melatih model, dan tidak pernah dicatat — membuat alat ini 100% kebal terhadap kebocoran atau retensi data di sisi server. Dapatkan PNG transparan resolusi penuh yang bebas watermark tanpa batas, diproses secara privat di perangkat kamu sendiri.",
      "onnxNotice": "",
      "modelNotice": "",
      "runtimeNotice": "Penggunaan pertama juga akan mengunduh runtime AI (~33 MB) sekali. Setelah itu semuanya disimpan di cache offline — penggunaan berikutnya akan dimuat secara instan."
    },
    "blur": {
      "intro": "Kaburkan wajah, pelat nomor, dan kredensial sensitif secara aman di browser web kamu. Seret kotak persegi panjang atau gambar sapuan kuas bebas untuk menghancurkan data piksel sensitif secara offline sepenuhnya.",
      "howItWorks": {
        "step1": "Unggah gambar kamu melalui seret-lepas, dialog file, atau unduh dari URL yang aman.",
        "step2": "Pilih mode Box untuk pelat/teks, atau mode Brush untuk target organik seperti wajah.",
        "step3": "Gambar persegi panjang atau lukis jalur. Sesuaikan ukuran dan intensitas keburaman secara dinamis.",
        "step4": "Klik Unduh. Alatify menghancurkan data piksel yang mendasarinya dan menghapus metadata EXIF."
      },
      "faq": {
        "q1": "Bagaimana cara mengaburkan pelat nomor sebelum menjual mobil secara online?",
        "a1": "Unggah foto, beralih ke Box Mode atau Brush Mode, tutupi area pelat nomor, dan terapkan efek pikselasi atau buram. Ini mencegah pengeruk otomatis dan agregator data menautkan kendaraan kamu ke registrasi lisensi pribadi kamu.",
        "q2": "Dapatkah saya menyunting kata sandi atau kredensial sensitif dari tangkapan layar?",
        "a2": "Ya. Untuk kata sandi, angka keuangan, atau kunci yang sangat sensitif, kami sangat menyarankan penggunaan efek Solid Fill. Berbeda dengan keburaman atau pikselasi yang mungkin dapat dipulihkan sebagian oleh AI, Solid Fill menggantikan area target dengan piksel hitam sepenuhnya.",
        "q3": "Apakah aman mengaburkan anak-anak atau wajah sebelum mempostingnya secara online?",
        "a3": "Tentu saja. Pilih Brush Mode untuk melukis di atas wajah dengan ukuran kuas yang dapat disesuaikan. Karena semuanya berjalan secara lokal di dalam browser web kamu yang di-sandbox, foto asli yang belum disunting tidak pernah dikirimkan melalui internet.",
        "q4": "Apakah halaman ini mengunggah gambar saya ke server?",
        "a4": "Tidak. Semua utilitas Alatify beroperasi pada model privasi yang ketat. Rendering gambar, penyusunan kotak, rendering piksel, dan kompilasi file dieksekusi sepenuhnya di sisi klien. File asli tidak pernah meninggalkan mesin kamu."
      },
      "privacyNotice": "Alatify memproses file grafis kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat privat kamu ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Kaburkan wajah, pelat nomor, dan kredensial sensitif secara aman dan privat di perangkat kamu sendiri.",
      "autoDetectHelp": ""
    },
    "converter": {
      "intro": "Konversi gambar di antara sembilan format — termasuk favorit web seperti WebP, format desain seperti SVG dan TIFF, serta format khusus seperti ICO (favicon) dan PDF — sepenuhnya di browser kamu. Seret beberapa file sekaligus, pilih format output, dan konversi dalam satu klik. Tanpa unggah, tanpa pendaftaran, tanpa watermark — file kamu tidak pernah meninggalkan perangkat kamu.",
      "howItWorks": {
        "step1": "Tambahkan satu atau banyak gambar (seret-lepas atau pemilih file).",
        "step2": "Pilih output kamu: JPG, PNG, WebP, PDF, ICO, SVG, TIFF, BMP, atau GIF.",
        "step3": "Proses semuanya sekaligus, secara instan, di perangkat kamu.",
        "step4": "Simpan satu per satu, atau ambil semuanya sebagai ZIP."
      },
      "useCases": {
        "case1": "Perkecil gambar untuk situs web yang memuat lebih cepat tanpa kehilangan kualitas.",
        "case2": "Buat favicon untuk situs web kamu dalam format yang benar.",
        "case3": "Gabungkan beberapa gambar menjadi satu PDF multi-halaman.",
        "case4": "Lacak gambar raster menjadi grafik vektor yang dapat diskalakan.",
        "case5": "Konversi foto iPhone menjadi JPG yang kompatibel secara universal."
      },
      "faq": {
        "q1": "Format apa saja yang bisa saya konversi?",
        "a1": "JPG, PNG, WebP, PDF, ICO, SVG, TIFF, BMP, dan GIF — ditambah input HEIC dari iPhone.",
        "q2": "Apakah alat ini mengunggah file saya ke server?",
        "a2": "Tidak. Konversi berjalan sepenuhnya di browser kamu; file kamu tidak pernah meninggalkan perangkat kamu.",
        "q3": "Dapatkah saya mengonversi banyak gambar sekaligus?",
        "a3": "Ya — seret beberapa file, konversi semuanya dalam satu klik, dan unduh sebagai ZIP.",
        "q4": "Bagaimana cara mengonversi PNG ke favicon ICO?",
        "a4": "Unggah PNG, pilih ICO sebagai format output, dan unduh — siap digunakan sebagai favicon situs.",
        "q5": "Dapatkah saya mengonversi foto HEIC dari iPhone saya?",
        "a5": "Ya. Tambahkan file HEIC kamu dan konversi ke JPG atau PNG secara instan."
      },
      "privacyNotice": "Alatify memproses file grafis kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat privat kamu ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Konversi gambar antara format JPG, PNG, WebP, PDF, ICO, SVG, TIFF, BMP, dan GIF secara instan dan privat di perangkat kamu sendiri.",
      "svgTooLarge": "",
      "alphaBackdropHelp": ""
    },
    "cropper": {
      "intro": "Potong ke rasio tetap atau secara bebas dengan pegangan yang dapat diseret, lalu luruskan dengan rotasi presisi — semuanya dengan pratinjau real-time di browser kamu. Tanpa unggah, tanpa pendaftaran — foto kamu tidak pernah meninggalkan perangkat kamu.",
      "howItWorks": {
        "step1": "Letakkan gambar kamu. Gambar tetap berada di perangkat kamu.",
        "step2": "Seret pegangan untuk pemotongan bebas, atau pilih rasio tetap seperti 1:1 atau 16:9.",
        "step3": "Putar untuk meratakan foto yang miring atau menyelaraskan subjek kamu.",
        "step4": "Simpan gambar hasil potongan kamu."
      },
      "useCases": {
        "case1": "Potong ke rasio tepat yang digunakan platform — kotak 1:1, spanduk 16:9, ukuran cerita.",
        "case2": "Bingkai foto wajah kamu dengan sempurna untuk profil atau avatar apa pun.",
        "case3": "Potong thumbnail yang ketat dan menarik perhatian untuk video dan artikel.",
        "case4": "Pangkas tepi yang mengganggu atau luruskan cakrawala yang miring."
      },
      "faq": {
        "q1": "Dapatkah saya memotong ke rasio tertentu?",
        "a1": "Ya — pilih rasio umum seperti 1:1, 4:3, atau 16:9, atau seret pegangan untuk pemotongan yang sepenuhnya bebas.",
        "q2": "Apakah alat ini mengunggah foto saya ke server?",
        "a2": "Tidak. Pemotongan berjalan sepenuhnya di browser kamu; foto kamu tidak pernah meninggalkan perangkat kamu.",
        "q3": "Dapatkah saya meluruskan foto yang miring?",
        "a3": "Ya — gunakan rotasi untuk meratakan cakrawala yang miring atau menyelaraskan subjek sebelum memotong.",
        "q4": "Apakah pemotongan akan menurunkan kualitas gambar saya?",
        "a4": "Tidak — pemotongan mempertahankan piksel asli di dalam area yang dipilih pada kualitas penuh.",
        "q5": "Dapatkah saya melakukan pemotongan bentuk bebas alih-alih rasio tetap?",
        "a5": "Ya — seret pegangan ke ukuran dan posisi apa pun yang kamu suka."
      },
      "privacyNotice": "Alatify memproses file grafis kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat privat kamu ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Potong dan putar gambar secara instan dan privat di perangkat kamu sendiri."
    },
    "exif-cleaner": {
      "intro": "Setiap foto yang diambil ponsel kamu membawa metadata EXIF tersembunyi — koordinat GPS, model kamera, tanggal, dan detail perangkat — yang ikut berpindah bersama file saat kamu membagikannya. Alatify menunjukkan kepada kamu apa yang tersembunyi di dalam secara tepat, lalu membersihkannya hingga bersih. Semuanya berjalan di browser kamu: foto kamu tidak pernah diunggah, dan pembersihan sepenuhnya lossless, sehingga hanya metadata yang dihapus — kualitas gambar kamu tetap tidak tersentuh.",
      "howItWorks": {
        "step1": "Seret dan letakkan foto kamu, atau pilih file. File tetap berada di perangkat kamu.",
        "step2": "Lihat semua metadata yang terdeteksi, dengan peringatan menonjol jika lokasi GPS ada.",
        "step3": "Hapus metadata secara lossless. Tanpa kompresi ulang, tanpa kehilangan kualitas.",
        "step4": "Simpan salinan bersih dengan nol metadata, siap dibagikan dengan aman."
      },
      "useCases": {
        "case1": "Foto yang diambil di rumah menyematkan lokasi GPS kamu. Hapus sebelum memposting ke Facebook Marketplace, eBay, atau Craigslist sehingga daftar tidak dapat mengungkapkan alamat kamu.",
        "case2": "Foto liburan dapat menyiarkan bahwa kamu sedang jauh dari rumah. Hapus lokasi dan stempel waktu sebelum memposting.",
        "case3": "Koordinat GPS yang tepat dapat mengarahkan orang asing ke pintu kamu. Bersihkan foto kamu sebelum membagikannya secara publik.",
        "case4": "Hapus data lokasi sebelum mengirimkan ke klien atau menerbitkannya secara online."
      },
      "faq": {
        "q1": "Bukankah Instagram atau Facebook sudah menghapus data EXIF?",
        "a1": "Postingan publik di sebagian besar platform menghapus EXIF — tetapi mereka menyimpan yang asli secara internal, dan banyak metode berbagi (mengirim file secara langsung, penyimpanan cloud, beberapa platform) menjaga metadata tetap utuh. Membersihkannya sendiri terlebih dahulu adalah satu-satunya cara untuk memastikannya.",
        "q2": "Bagaimana cara menghapus lokasi GPS sebelum menjual sesuatu secara online?",
        "a2": "Unggah foto, periksa peringatan GPS, hapus metadata, dan unduh salinan bersih untuk diposting — tidak ada data lokasi yang terlampir.",
        "q3": "Apakah menghapus metadata akan mengurangi kualitas foto saya?",
        "a3": "Tidak. Alatify menghapus metadata secara lossless dengan mengedit struktur biner file secara langsung — piksel kamu tidak pernah dikompresi ulang, jadi kualitasnya identik.",
        "q4": "Dapatkah saya melihat metadata apa yang terkandung dalam foto saya terlebih dahulu?",
        "a4": "Ya. Sebelum membersihkan, Alatify menampilkan semua metadata yang terdeteksi — koordinat GPS, model kamera, tanggal, dan info perangkat — jadi kamu tahu persis apa yang kamu hapus.",
        "q5": "Apakah foto saya diunggah ke server?",
        "a5": "Tidak. Deteksi dan pembersihan berjalan sepenuhnya di browser kamu. Foto kamu tidak pernah meninggalkan perangkat kamu."
      },
      "privacyNotice": "Alatify memproses file grafis kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat privat kamu ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Hapus riwayat lokasi (GPS Latitude/Longitude), penanda perangkat (produsen/model), log riwayat perangkat lunak, dan stempel waktu pengambilan secara instan dan aman sebelum didistribusikan.",
      "alreadyCleanNotice": "",
      "coordinatesNotice": ""
    },
    "id-protector": {
      "intro": "Setiap hari, jutaan foto ID mentah (KTP, SIM, paspor) dibagikan secara online, mengekspos mereka terhadap pencurian identitas dan penipuan. ID Privacy Shield memungkinkan kamu menyensor detail sensitif dengan blok padat yang tidak dapat dibalik dan menerapkan watermark ubin untuk menegakkan konteks penggunaan tertentu. Semuanya berjalan 100% secara lokal di browser kamu: dokumen kamu tidak pernah menyentuh server, dan file yang diunduh secara otomatis menghapus semua metadata tersembunyi.",
      "howItWorks": {
        "step1": "Pilih KTP, SIM, paspor, atau foto ID kamu. Dokumen kamu tidak pernah meninggalkan browser kamu.",
        "step2": "Gambar kotak sensor SOLID di atas bidang sensitif seperti nomor NIK/ID, tanda tangan, dan alamat.",
        "step3": "Tambahkan watermark ubin diagonal yang menyatakan tujuan dan tanggal untuk mencegah penggunaan kembali tanpa izin.",
        "step4": "Simpan PNG yang dilindungi secara langsung. Sensor ditanamkan langsung ke dalam piksel dan metadata dihapus."
      },
      "useCases": {
        "case1": "Amankan salinan KTP, SIM, atau paspor kamu sebelum mengirimkannya ke penyedia rental. Tambahkan watermark yang berisi nama agensi rental dan tanggal untuk menghindari penggunaan kembali.",
        "case2": "Sensor nomor non-esensial dan blok tanda tangan sebelum mengirimkan ID kamu ke platform gig atau portal verifikasi pasar freelance.",
        "case3": "Hindari mengirim foto ID mentah yang tidak dilindungi melalui WhatsApp atau email untuk reservasi hotel, kontrak freelance, atau pendaftaran layanan."
      },
      "faq": {
        "q1": "Apakah file ID saya diunggah ke server?",
        "a1": "Tidak. ID Privacy Shield berjalan sepenuhnya di browser web kamu. Semua pemrosesan, penyensoran, dan pelapisan watermark dilakukan secara lokal melalui sandbox canvas APIs. Dokumen pribadi kamu tidak pernah menyentuh server kami.",
        "q2": "Apakah kotak sensor padat dapat dibalikkan?",
        "a2": "Tidak. Saat kamu menggunakan sensor Solid, piksel ditanamkan langsung ke dalam PNG output, secara permanen menimpa piksel asli. Perlu dicatat bahwa Blur secara teoritis dapat dibalikkan, jadi kami sangat menyarankan blok Solid untuk data yang sangat sensitif.",
        "q3": "Apakah watermark mencegah pemotongan?",
        "a3": "Ya. Dengan memilih opsi Tiled Pattern, watermark akan di-render berulang kali di seluruh kanvas dokumen. Ini membuatnya tidak mungkin untuk memotong watermark keluar tanpa memotong konten ID itu sendiri.",
        "q4": "Apakah alat ini berfungsi di perangkat seluler?",
        "a4": "Ya. ID Privacy Shield responsif dan mendukung penuh kontrol sentuh, memungkinkan kamu menggambar kotak sensor dan mengunduh dokumen di smartphone dan tablet.",
        "q5": "Apakah metadata dan data EXIF dihapus?",
        "a5": "Ya. Mengodekan ulang gambar yang diubah ke PNG secara otomatis menghapus semua metadata EXIF, koordinat GPS, tag perangkat, dan parameter riwayat untuk privasi maksimal."
      },
      "privacyNotice": "Alatify memproses file ID kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah dokumen atau koordinat privat kamu ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Sensor nomor identitas sensitif, lapisi watermark ubin diagonal, dan hapus metadata EXIF GPS/kamera secara instan dan aman di perangkat kamu sendiri sebelum didistribusikan.",
      "uploadInstructions": ""
    },
    "qr-toolkit": {
      "intro": "Buat QR codes statis sepenuhnya offline yang menjadi milik kamu selamanya tanpa jebakan kedaluwarsa dinamis. Pindai QR codes yang tidak dikenal dan audit titik akhirnya secara aman di dalam tab browser kamu: hapus parameter pelacakan dan analisis URL sebelum membukanya.",
      "howItWorks": {
        "step1": "Pilih mode URL, Teks, atau Wi-Fi. Ketik detailnya. QR di-render segera secara offline.",
        "step2": "Sesuaikan ukuran, margin, warna kustom, dan koreksi kesalahan sebelum mengunduh PNG/SVG.",
        "step3": "Arahkan kamera kamu atau letakkan gambar. Dekode dieksekusi secara lokal di dalam browser kamu.",
        "step4": "Verifikasi domain target, bersihkan parameter pelacakan, dan tinjau peringatan pada jalur yang dipersingkat."
      },
      "faq": {
        "q1": "Apa yang dimaksud dengan QR code bebas pelacak?",
        "a1": "Banyak layanan generator QR memaksa kamu menggunakan tautan dinamis yang mengarah ke proksi pengalihan. Ini melacak lokasi, perangkat, dan frekuensi kamu. Alatify menghasilkan QR codes statis yang mengodekan teks mentah secara langsung: nol pelacakan, nol kedaluwarsa, sepenuhnya milik kamu.",
        "q2": "Mengapa Safe Scanner menghapus parameter pelacakan URL?",
        "a2": "QR codes semakin banyak digunakan untuk pelacakan pemasaran atau phishing (quishing). Saat kamu memindai URL, kami mendeteksi parameter seperti UTM dan ID klien, menghapusnya, dan mengungkapkan domain langsung sehingga kamu tahu persis di mana kamu mendarat.",
        "q3": "Dapatkah pemindai mengikuti tautan pemendek untuk memeriksa tujuan?",
        "a3": "Tidak. Menyelesaikan pengalihan dari pemendek seperti bit.ly atau tinyurl memerlukan pengiriman permintaan ke server eksternal, yang membocorkan IP dan metadata kamu. Agar tetap 100% privat, kami menandai URL yang dipersingkat dengan pemberitahuan keamanan sehingga kamu dapat melanjutkan dengan hati-hati.",
        "q4": "Apakah umpan kamera yang dipindai atau gambar yang diunggah dikirim ke server mana pun?",
        "a4": "Tidak pernah. Semua dekoder dan generator beroperasi secara lokal di mesin klien kamu menggunakan sandbox eksekusi JS. Tidak ada titik akhir API, pelacak analitik, atau pengambilan jaringan yang digunakan selama operasi."
      },
      "privacyNotice": "Alatify memproses QR codes kamu sepenuhnya secara lokal menggunakan sandboxed client APIs di dalam tab browser kamu. Kami tidak pernah mengunggah URL, konten teks biasa, umpan kamera, atau file grafis yang diunggah. Alat ini 100% offline dan bebas telemetri, menjaga semua tujuan yang dipindai dan payload yang dihasilkan sepenuhnya privat di perangkat kamu."
    },
    "resizer": {
      "intro": "Ubah ukuran gambar berdasarkan piksel yang tepat, berdasarkan persentase, atau dengan rasio aspek terkunci — semuanya di browser kamu. Pencuplikan ulang berkualitas tinggi menjaga tepi tetap tajam, dan kamu dapat mengubah ukuran seluruh kumpulan sekaligus. Tanpa unggah, tanpa pendaftaran — gambar kamu tidak pernah meninggalkan perangkat kamu.",
      "howItWorks": {
        "step1": "Tambahkan satu atau banyak gambar.",
        "step2": "Masukkan piksel yang tepat, skala berdasarkan persentase, atau kunci rasio aspek.",
        "step3": "Terapkan ke semua gambar sekaligus dengan pencuplikan ulang berkualitas tinggi.",
        "step4": "Simpan satu per satu atau sebagai ZIP."
      },
      "useCases": {
        "case1": "Ubah ukuran ke dimensi tepat yang diharapkan platform — postingan persegi, cerita, spanduk, dan foto profil.",
        "case2": "Perkecil foto yang terlalu besar agar memuat lebih cepat dan sesuai dengan batas unggahan.",
        "case3": "Ubah ukuran seluruh folder gambar ke dimensi yang sama dalam sekali jalan.",
        "case4": "Capai dimensi piksel yang tepat untuk tata letak dan templat."
      },
      "faq": {
        "q1": "Dapatkah saya mengubah ukuran ke dimensi piksel yang tepat?",
        "a1": "Ya — masukkan lebar dan tinggi yang tepat dalam piksel, skala berdasarkan persentase, atau kunci rasio aspek untuk menghindari peregangan.",
        "q2": "Apakah alat ini mengunggah gambar saya ke server?",
        "a2": "Tidak. Pengubahan ukuran berjalan sepenuhnya di browser kamu; file kamu tidak pernah meninggalkan perangkat kamu.",
        "q3": "Apakah pengubahan ukuran akan meregangkan atau mendistorsi gambar saya?",
        "a3": "Tidak jika kamu mengunci rasio aspeknya — ini akan menskalakan secara proporsional. Kamu juga dapat membukanya untuk pengubahan ukuran bebas.",
        "q4": "Dapatkah saya mengubah ukuran banyak gambar sekaligus?",
        "a4": "Ya — ubah ukuran kumpulan semuanya ke dimensi yang sama dan unduh sebagai ZIP.",
        "q5": "Apakah pengubahan ukuran akan menurunkan kualitas?",
        "a5": "Alatify menggunakan pencuplikan ulang berkualitas tinggi untuk menjaga hasil tetap setajam mungkin saat melakukan penskalaan."
      },
      "privacyNotice": "Alatify memproses file grafis kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat privat kamu ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Ubah ukuran gambar berdasarkan piksel, persentase, atau rasio aspek secara instan dan privat di perangkat kamu sendiri.",
      "cropBehaviorHelp": "",
      "fitBehaviorHelp": ""
    },
    "steganography": {
      "intro": "Lindungi komunikasi kamu secara offline. Tanamkan teks privat ke dalam gambar melalui steganografi Least Significant Bit (LSB), dengan enkripsi kata sandi AES-GCM opsional. File tetap terlihat identik di mata telanjang. Semuanya berjalan sepenuhnya di dalam sandbox browser kamu: tanpa server, tanpa kebocoran.",
      "howItWorks": {
        "step1": "Pilih gambar inang pembawa. Lapisan transparan diratakan menjadi putih solid di dalam memori.",
        "step2": "Ketik pesan rahasia. Memasukkan kata sandi akan memicu enkripsi AES-GCM 256-bit sebelum dikemas.",
        "step3": "Bit biner dari payload yang dikemas menggantikan Least Significant Bits dari saluran gambar RGB.",
        "step4": "Ekspor hanya sebagai format PNG. Ini menjamin bahwa algoritma kompresi tidak mengubah piksel LSB."
      },
      "faq": {
        "q1": "Apakah steganografi saya akan bertahan jika dikirim melalui WhatsApp atau Instagram?",
        "a1": "Tidak. Aplikasi obrolan dan media sosial secara otomatis mengonversi file menjadi JPEGs/WebPs lossy untuk menghemat bandwidth. Ini menghancurkan variasi piksel LSB. Untuk mempertahankan pesan, bagikan PNG stego sebagai file Dokumen yang tidak dikompresi atau tautan unduhan langsung.",
        "q2": "Apakah steganografi LSB tidak dapat dideteksi secara matematis?",
        "a2": "Tidak. Steganografi LSB membuat pembawa tidak dapat dibedakan secara visual oleh mata manusia. Namun, pemindai stego khusus dapat mendeteksi perubahan statistik dalam distribusi piksel (steganalisis). Untuk penyangkalan keamanan tinggi, enkripsi dengan kata sandi yang kuat.",
        "q3": "Format pesan apa saja yang dapat saya tanamkan?",
        "a3": "Kamu dapat menanamkan teks biasa, catatan markdown, kunci lisensi, atau string konfigurasi apa pun. Kami memberlakukan pemeriksaan batas kapasitas yang jelas untuk mencegah pemotongan, berdasarkan dimensi alami dari gambar pembawa yang diunggah.",
        "q4": "Apakah gambar atau data kata sandi saya dikirim ke server mana pun?",
        "a4": "Tidak pernah. Semua enkripsi (menggunakan Web Crypto API) dan penyesuaian LSB tingkat piksel terjadi di sisi klien di dalam browser. File asli dan kata sandi kamu tidak pernah meninggalkan perangkat kamu."
      },
      "privacyNotice": "Alatify memproses file grafis kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah file, pesan rahasia, atau kata sandi kamu ke cloud eksternal. Penanaman LSB, derivasi kunci PBKDF2, dan enkripsi AES-GCM berjalan sepenuhnya offline, melindungi data kamu dari kebocoran di sisi server.",
      "passwordHelp": ""
    },
    "upscaler": {
      "intro": "Pertajam dan perbesar foto kamu dengan jaringan saraf Real-ESRGAN yang berjalan sepenuhnya di browser kamu. Berjalan 100% di browser kamu — gambar kamu tidak pernah meninggalkan perangkat kamu.",
      "howItWorks": {
        "step1": "Letakkan gambar kamu. Gambar tetap berada di perangkat kamu.",
        "step2": "Pilih 2x untuk kecepatan atau 4x untuk detail maksimum.",
        "step3": "AI di perangkat menyempurnakan gambar ubin demi ubin, diakselerasi GPU jika didukung.",
        "step4": "Simpan PNG kamu yang lebih tajam dan beresolusi lebih tinggi."
      },
      "useCases": {
        "case1": "Perbesar foto lama atau beresolusi rendah tanpa kehilangan ketajaman atau detail.",
        "case2": "Pertajam dan tingkatkan ukuran gambar produk untuk daftar Amazon, Shopify, atau Etsy yang bersih.",
        "case3": "Siapkan gambar untuk pencetakan fisik format besar atau tampilan DPI tinggi.",
        "case4": "Pulihkan detail dan perbaiki artefak pada grafik yang dikompresi berat atau diperkecil.",
        "case5": "Tingkatkan ukuran output Midjourney, DALL-E, atau Stable Diffusion untuk unduhan resolusi tinggi.",
        "case6": "Sempurnakan tangkapan layar dan grafik untuk presentasi dan slide deck."
      },
      "faq": {
        "q1": "Apakah gambar saya diunggah ke server?",
        "a1": "Tidak. Semua pemrosesan terjadi secara lokal di browser kamu — gambar kamu tidak pernah meninggalkan perangkat kamu.",
        "q2": "Bagaimana cara kerja AI upscaler?",
        "a2": "Alat ini menggunakan jaringan saraf Real-ESRGAN yang merekonstruksi detail dan mempertajam tepi, berjalan pada GPU perangkat kamu melalui WebGPU (dengan fallback CPU).",
        "q3": "Apa perbedaan antara 2x dan 4x?",
        "a3": "2x lebih cepat dan bagus untuk pembesaran sedang; 4x menghasilkan hasil yang lebih besar dan lebih tajam tetapi memakan waktu lebih lama.",
        "q4": "Apakah ini gratis?",
        "a4": "Ya — sepenuhnya gratis, tanpa akun atau pendaftaran.",
        "q5": "Format apa saja yang didukung?",
        "a5": "JPG, PNG, dan WebP; outputnya adalah PNG lossless.",
        "q6": "Mengapa operasi pertama memakan waktu sejenak?",
        "a6": "Penggunaan pertama mengunduh model AI sebesar ~33MB sekali saja. Setelah itu akan disimpan di cache, jadi operasi selanjutnya menjadi instan dan bahkan berfungsi secara offline.",
        "q7": "Apakah ada batas ukuran?",
        "a7": "Gambar yang sangat besar diturunkan ukurannya sebelum ditingkatkan ukurannya agar tetap andal di ponsel dan perangkat kelas menengah.",
        "q8": "Apakah ini berfungsi secara offline?",
        "a8": "Ya — setelah model disimpan di cache, browser kamu dapat meningkatkan ukuran tanpa koneksi internet."
      },
      "privacyNotice": "Alatify meningkatkan ukuran gambar seluruhnya di dalam tab browser kamu menggunakan AI di perangkat yang diakselerasi GPU. Foto kamu tidak pernah diunggah ke server, tidak pernah digunakan untuk melatih model, dan tidak pernah dicatat — membuat alat ini 100% kebal terhadap kebocoran atau retensi data di sisi server. Dapatkan gambar upscaled resolusi tinggi bebas watermark tanpa batas, diproses secara privat di perangkat kamu sendiri.",
      "fasterOptionDesc": "",
      "sharperOptionDesc": "",
      "gpuWarning": "",
      "localWarning": ""
    },
    "watermark": {
      "intro": "",
      "howItWorks": {
        "step1": "Tambahkan satu atau banyak gambar (hingga 30).",
        "step2": "Pilih watermark teks atau logo dan atur gayanya: ukuran, opasitas, warna, rotasi.",
        "step3": "Jepret ke sudut, ubin di seluruh gambar, atau seret ke mana pun kamu suka.",
        "step4": "Simpan gambar ber-watermark kamu secara individual atau sebagai ZIP."
      },
      "useCases": {
        "case1": "Cegah pencurian gambar dan penggunaan kembali tanpa izin dengan watermark yang terlihat.",
        "case2": "Tambahkan logo atau handle kamu ke foto sebelum memposting atau membagikannya.",
        "case3": "Terapkan watermark yang sama ke seluruh kumpulan sekaligus dalam satu langkah.",
        "case4": "Ulangi watermark secara diagonal sehingga tidak dapat dipotong begitu saja."
      },
      "faq": {
        "q1": "Apakah alat ini mengunggah gambar atau logo saya?",
        "a1": "Tidak. Semuanya berjalan di browser kamu; gambar dan logo kamu tidak pernah meninggalkan perangkat kamu.",
        "q2": "Dapatkah saya memberi watermark pada banyak gambar sekaligus?",
        "a2": "Ya — tambahkan hingga 30 gambar dan unduh semuanya sebagai ZIP dengan watermark yang sama diterapkan.",
        "q3": "Dapatkah saya menggunakan logo saya sendiri?",
        "a3": "Ya. Unggah PNG (transparansi didukung) dan sesuaikan ukuran serta opasitasnya.",
        "q4": "Apakah watermark akan terlihat sama di berbagai ukuran gambar yang berbeda?",
        "a4": "Ya. Ukuran diatur relatif terhadap lebar masing-masing gambar, sehingga watermark tetap proporsional baik fotonya besar maupun kecil.",
        "q5": "Dapatkah saya menghentikan orang memotong watermark?",
        "a5": "Gunakan mode ubin (tiled) untuk mengulang watermark secara diagonal di seluruh gambar, yang membuatnya jauh lebih sulit dihapus dengan memotong.",
        "q6": "Format apa saja yang bisa saya ekspor?",
        "a6": "Pertahankan format asli, atau ekspor sebagai JPG, PNG, atau WebP."
      },
      "privacyNotice": "Alatify memproses file grafis kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat watermark privat kamu ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Amankan merek dan lindungi gambar kamu secara langsung di perangkat kamu sendiri.",
      "previewResolutionNotice": ""
    },
    "stock-finder": {
      "intro": "Cari di Unsplash, Pexels, dan Pixabay sekaligus — dan tidak seperti kebanyakan pencari stok yang hanya menampilkan foto, Alatify juga menampilkan ilustrasi dan vektor. Temukan gambar yang pas, lalu langsung buka di alat edit Alatify untuk menghapus latarnya, mengompresnya, atau mengonversinya — semuanya gratis, tanpa daftar akun.",
      "howItWorks": {
        "step1": "Ketik kata kunci untuk mencari stok gratis di Unsplash, Pexels, dan Pixabay sekaligus.",
        "step2": "Persempit berdasarkan jenis konten (foto, ilustrasi, atau vektor), sumber, dan orientasi.",
        "step3": "Pilih gambar yang kamu inginkan.",
        "step4": "Buka dengan satu klik di alat Alatify, atau unduh langsung."
      },
      "useCases": {
        "case1": "Fotografi berkualitas tinggi dan bebas royalti untuk blog, artikel, dan postingan media sosial.",
        "case2": "Grafik yang dapat diskalakan untuk presentasi, desain, dan thumbnail — bukan sekadar foto.",
        "case3": "Gambar lebar beresolusi tinggi untuk situs web dan header.",
        "case4": "Kirim hasil mana pun langsung ke Alatify untuk menghapus latar, mengompres, atau mengonversi."
      },
      "faq": {
        "q1": "Apakah gambarnya bebas digunakan?",
        "a1": "Ya — hasil berasal dari Unsplash, Pexels, dan Pixabay, yang menyediakan gambar bebas digunakan. Beberapa sumber meminta atribusi ke fotografer, yang ditampilkan di samping setiap gambar.",
        "q2": "Apakah saya bisa menemukan ilustrasi dan vektor, bukan hanya foto?",
        "a2": "Ya. Kebanyakan pencari stok hanya menampilkan foto — Alatify juga menampilkan ilustrasi dan vektor, jadi kamu bisa mencari berdasarkan jenis konten.",
        "q3": "Apakah saya bisa langsung mengedit gambar setelah menemukannya?",
        "a3": "Ya — buka hasil mana pun dengan satu klik di alat berbasis browser Alatify untuk menghapus latarnya, mengompresnya, mengonversinya, dan lainnya.",
        "q4": "Apakah saya perlu mendaftar?",
        "a4": "Tidak. Cari dan edit dengan bebas, tanpa perlu akun.",
        "q5": "Dari mana gambar-gambar ini berasal?",
        "a5": "Tiga pustaka stok gratis terbesar: Unsplash, Pexels, dan Pixabay."
      }
    },
    "html-to-markdown": {
      "intro": "Konversi kode sumber HTML atau file .html menjadi Markdown yang bersih dan mudah dibaca — sepenuhnya di browser kamu. Tempel markup atau unggah file, lalu salin atau unduh hasilnya. Tanpa unggah server, tanpa akun, dan konten kamu tidak pernah meninggalkan perangkat.",
      "howItWorks": {
        "step1": "Tempel HTML ke editor atau unggah file .html lokal dari perangkat kamu.",
        "step2": "Konverter mengurai markup kamu secara lokal menggunakan Turndown di dalam sandbox browser.",
        "step3": "Heading, daftar, tautan, tebal/miring, blockquote, dan blok kode dipetakan ke Markdown.",
        "step4": "Salin output ke clipboard atau unduh sebagai file .md secara instan."
      },
      "useCases": {
        "subtitle": "Ubah halaman web, ekspor, dan cuplikan HTML menjadi draf Markdown yang dapat diedit.",
        "case1": "Migrasikan posting blog, landing page, atau ekspor CMS ke Markdown untuk static site generator.",
        "case2": "Konversi halaman wiki internal, dokumen bantuan, atau basis pengetahuan HTML menjadi file .md portabel.",
        "case3": "Arsipkan HTML newsletter atau email secara lokal dan format ulang menjadi Markdown berbasis teks.",
        "case4": "Ubah sumber halaman web tersimpan menjadi catatan Markdown untuk Obsidian, Notion, atau GitHub."
      },
      "faq": {
        "q1": "Apakah HTML saya diunggah ke server?",
        "a1": "Tidak. Semua parsing dan konversi berjalan di dalam browser kamu. Kode sumber HTML tidak pernah dikirim ke backend atau layanan pihak ketiga mana pun.",
        "q2": "Elemen HTML apa saja yang didukung?",
        "a2": "Elemen umum seperti heading, paragraf, tebal/miring, tautan, daftar berurutan dan tak berurutan, blockquote, blok kode, dan garis horizontal dikonversi. Tata letak kompleks mungkin disederhanakan menjadi Markdown linear.",
        "q3": "Bisakah mengunggah file halaman web lengkap?",
        "a3": "Ya. Unggah file .html atau .htm apa pun dan alat ini membacanya secara lokal, lalu mengonversi seluruh sumber dokumen ke Markdown.",
        "q4": "Apakah tabel akan dikonversi ke sintaks tabel Markdown?",
        "a4": "Turndown standar tidak menyertakan plugin tabel GFM. Tabel HTML menggunakan perilaku default Turndown — tidak dapat diandalkan untuk dikonversi ke sintaks tabel pipa Markdown. Tabel kompleks atau bersarang mungkin menjadi teks polos atau output yang disederhanakan. Tinjau hasilnya jika struktur tabel penting.",
        "q5": "Apakah saya harus membayar atau membuat akun?",
        "a5": "Tidak. Seperti semua alat di Alatify, konverter ini sepenuhnya gratis, tanpa batas pemakaian, dan tidak memerlukan pendaftaran."
      },
      "privacyNotice": "Alatify memproses file HTML kamu sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser kamu. Kami tidak pernah mengunggah kode sumber atau konten pribadi kamu ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Konversi HTML ke Markdown secara aman langsung di perangkat kamu sendiri.",
      "placeholder": "Tempel HTML atau unggah file .html untuk melihat output Markdown yang dikonversi di sini.",
      "downloadMd": "Unduh .md"
    "pdf-to-image": {
      "intro": "Konversi halaman PDF menjadi gambar JPG atau PNG berkualitas tinggi langsung di browser kamu. Pilih halaman atau rentang tertentu, sesuaikan skala resolusi, dan unduh halaman individual atau arsip ZIP gabungan. Tanpa unggah, tanpa pendaftaran — 100% privat.",
      "howItWorks": {
        "step1": "Unggah dokumen PDF kamu dengan menyeretnya masuk atau memilih file.",
        "step2": "Pilih PNG (menjaga transparansi) atau JPG (latar belakang putih) dan atur skala render.",
        "step3": "Pilih semua halaman atau tentukan rentang halaman khusus untuk diekstrak.",
        "step4": "Klik Konversi dan unduh gambar kamu atau ZIP yang berisi semua halaman."
      },
      "useCases": {
        "case1": "Konversi slide presentasi atau halaman dokumen menjadi gambar untuk disematkan di halaman web atau slide.",
        "case2": "Ekstrak foto, tanda terima, atau diagram satu halaman dari PDF sebagai aset gambar bersih.",
        "case3": "Ubah dokumen menjadi gambar media sosial yang tidak memerlukan pembaca PDF.",
        "case4": "Konversi lembar keuangan sensitif secara lokal di perangkat kamu tanpa melewati server pihak ketiga."
      },
      "faq": {
        "q1": "Apakah PDF saya diunggah ke server untuk konversi?",
        "a1": "Tidak. Semuanya berjalan di dalam sandbox browser kamu. Halaman PDF dirender langsung ke elemen canvas lokal, menjaga keamanan file kamu.",
        "q2": "Format apa saja yang bisa saya gunakan untuk menyimpan halaman?",
        "a2": "Kamu dapat mengekspor halaman sebagai PNG (terbaik untuk grafis tanpa penurunan kualitas) atau JPEG (format terkompresi resolusi tinggi dengan latar belakang putih).",
        "q3": "Apa fungsi pengaturan skala render?",
        "a3": "Ini mengontrol resolusi gambar keluaran. Skala 1x mencocokkan dimensi halaman default PDF, sedangkan 2x dan 3x mengalikan piksel untuk teks dan grafis yang lebih tajam dan berkualitas cetak.",
        "q4": "Dapatkah saya mengonversi sebagian halaman saja?",
        "a4": "Ya. Kamu dapat memilih semua halaman, memilih halaman tertentu dari daftar visual, atau menentukan rentang khusus (misalnya 1-3, 5).",
        "q5": "Apakah alat ini mendukung file yang dilindungi kata sandi?",
        "a5": "PDF yang dilindungi atau dienkripsi tidak dapat dirender di browser. Kamu harus menghapus perlindungan kata sandi terlebih dahulu sebelum mengunggah."
      },
      "privacyNotice": "Alatify memproses file PDF kamu sepenuhnya secara lokal menggunakan API sandbox di dalam tab browser kamu. Kami tidak pernah mengunggah file kamu ke cloud eksternal, membuat alat ini 100% aman dari kebocoran data.",
      "scaleStandard": "1x (Standar)",
      "scaleHigh": "2x (Tinggi)",
      "scaleMaximum": "3x (Maksimum)",
      "scaleHelper": "Skala lebih tinggi = gambar lebih tajam, tetapi ukuran file lebih besar dan pemrosesan lebih lambat."
    },
    "image-to-pdf": {
      "intro": "Gabungkan beberapa gambar JPG, PNG, atau WebP menjadi satu dokumen PDF yang terorganisir dengan indah. Atur ulang halaman dengan seret-dan-lepas atau tombol geser, atur dimensi halaman, margin, dan orientasi — semuanya dihitung secara lokal di perangkat kamu.",
      "howItWorks": {
        "step1": "Tambahkan satu atau beberapa gambar (seret-dan-lepas atau pilih beberapa file).",
        "step2": "Atur ulang halaman dengan menyeret thumbnail atau menggunakan tombol Naik/Turun.",
        "step3": "Konfigurasikan ukuran halaman (sesuaikan dengan gambar, A4, atau Letter), orientasi, dan margin.",
        "step4": "Hasilkan dan unduh dokumen PDF multi-halaman yang disusun secara instan."
      },
      "useCases": {
        "case1": "Gabungkan gambar pindaian, tanda terima, atau sketsa menjadi satu dokumen PDF untuk pengiriman atau pengarsipan.",
        "case2": "Buat portofolio digital, kompilasi foto, atau dek slide dari file desain terpisah.",
        "case3": "Ubah urutan foto menjadi dokumen multi-halaman terstruktur untuk pembacaan yang mudah.",
        "case4": "Susun catatan sensitif, kontrak, atau KTP secara lokal dan privat tanpa risiko kebocoran data."
      },
      "faq": {
        "q1": "Apakah gambar saya diunggah ke server?",
        "a1": "Tidak. Pembuatan PDF dilakukan sepenuhnya di sisi klien menggunakan jsPDF di tab browser kamu. File kamu tidak pernah meninggalkan perangkat kamu.",
        "q2": "Dapatkah saya mengatur urutan halaman?",
        "a2": "Ya. Kamu dapat menyeret thumbnail halaman untuk mengaturnya kembali, atau menggunakan tombol Naik dan Turun (dirancang untuk berfungsi dengan andal di layar seluler/sentuh).",
        "q3": "Pilihan ukuran halaman apa saja yang saya miliki?",
        "a3": "Ukuran standar seperti A4 dan Letter dengan gambar yang diskalakan agar pas.",
        "q4": "Apakah gambar saya dikompresi saat menyusun?",
        "a4": "Alat ini menyematkan gambar secara langsung ke dalam PDF. Untuk ukuran file yang optimal, kamu dapat kompresi gambar sumber kamu menggunakan Kompresor Gambar kami sebelum menyusun.",
        "q5": "Berapa banyak gambar yang dapat saya tambahkan sekaligus?",
        "a5": "Tidak ada batasan ketat, tetapi menyusun lusinan gambar resolusi tinggi dapat memakan memori yang signifikan. Alat ini menangani set standar dengan lancar."
      },
      "privacyNotice": "Alatify menyusun gambar kamu ke dalam PDF sepenuhnya secara lokal menggunakan API sandbox di dalam tab browser kamu. Kami tidak pernah mengunggah file kamu ke cloud eksternal, membuat alat ini 100% aman dari kebocoran data."
    }
  }
};
