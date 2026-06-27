export const id = {
  "home": {
    "hero": {
      "tagline": "Alat pemrosesan gambar yang mengutamakan privasi, berjalan sepenuhnya di browser Anda"
    },
    "features": {
      "card1": {
        "text": "Semua algoritma dieksekusi secara lokal di dalam tab browser Anda yang terisolasi. Tidak ada server yang menyimpan file Anda."
      },
      "card2": {
        "text": "Lewati waktu tunggu unggahan sepenuhnya. Proses gambar beresolusi tinggi langsung di perangkat Anda."
      }
    }
  },
  "about": {
    "intro": "Alat pemrosesan gambar seharusnya menghormati privasi Anda.",
    "why": {
      "p1": "Sebagian besar alat gambar online mengharuskan Anda mengunggah file ke server mereka. Itu berarti gambar Anda — yang mungkin berisi momen pribadi, aset bisnis, atau konten sensitif — melewati infrastruktur orang lain.",
      "p2": "Alatify berbeda: setiap alat berjalan sepenuhnya di browser Anda menggunakan WebAssembly. File Anda tidak pernah meninggalkan perangkat Anda. Kami percaya pada penyediaan utilitas yang cepat, bertenaga, dan benar-benar privat yang menghormati otonomi pengguna."
    },
    "offer": {
      "li1": "Sebuah paket browser lengkap yang terdiri dari Image Compressor, Background Remover, Image Resizer, Format Converter, dan Image Cropper.",
      "li2": "Tanpa pendaftaran pengguna, tanpa unggahan di sisi server, dan tanpa cookie analitik.",
      "li3": "Proses file dengan ukuran apa pun tanpa pendaftaran, kartu kredit, atau batasan tersembunyi.",
      "li4": "Eksekusi kode yang transparan dan dapat berfungsi secara offline menggunakan kontainer web standar."
    },
    "who": {
      "p1": "Alatify dirancang dan dibangun oleh seorang pengembang independen di Indonesia. Didorong oleh semangat untuk teknologi yang mengutamakan privasi dan pengalaman pengguna yang bersih, platform ini dirancang untuk membuktikan bahwa aplikasi berbasis browser dapat mencapai kemampuan tingkat profesional tanpa mengorbankan privasi pengguna.",
      "p2": "Stack teknologi kami menggunakan Next.js, WebAssembly, dan Tailwind CSS, dengan hosting dan pengiriman aset statis yang disediakan oleh Vercel. Jika Anda merasa Alatify berguna, silakan bagikan dengan orang lain yang menghargai privasi!"
    },
    "road": {
      "p1": "Alatify dibangun untuk terus berkembang. Rangkaian alatnya kini mencakup penghapusan latar, kompresi, konversi format, pengubahan ukuran, pemotongan, pembersihan EXIF, watermark, dan AI upscaling — semuanya berjalan secara lokal di browser Anda, dengan alat baru yang mengutamakan privasi ditambahkan dari waktu ke waktu.",
      "p2_start": "Umpan balik Anda sangat berharga. Jika Anda memiliki saran, permintaan fitur, atau bug untuk dilaporkan, hubungi kami di",
      "p2_end": "."
    }
  },
  "privacy": {
    "short": "Alatify tidak mengumpulkan, menyimpan, atau mengirimkan gambar atau data pribadi Anda. Semua pemrosesan terjadi sepenuhnya di browser Anda. Tidak ada pendaftaran akun, tidak ada pelacakan pengguna, dan tidak ada analitik pihak ketiga.",
    "collect": {
      "p1": "Karena Alatify dirancang untuk berjalan 100% secara lokal di komputer Anda, kami tidak mengakses atau mengumpulkan hal-hal berikut:",
      "li1": "File Anda tidak pernah diunggah ke server jarak jauh mana pun. File tersebut diurai dan diubah secara lokal di dalam sandbox browser Anda.",
      "li2": "Kami tidak mencatat parameter koneksi Anda.",
      "li3": "Kami tidak memantau seberapa sering Anda menggunakan alat kami atau pengaturan apa yang Anda terapkan.",
      "li4": "Kami tidak menggunakan kode pelacakan, cookie pihak ketiga, atau sidik jari browser.",
      "li5": "Tidak ada nama, alamat email, kredensial pembayaran, atau akun yang diperlukan."
    },
    "do": {
      "p1": "Untuk menyediakan utilitas pemrosesan gambar kami tanpa beban server, Alatify beroperasi berdasarkan prinsip-prinsip ini:",
      "li1": "Kami mengompilasi alat menggunakan WebAssembly dan JavaScript sisi klien. Semua komputasi dieksekusi di dalam utas browser Anda menggunakan sumber daya perangkat keras lokal Anda.",
      "li2": "Model AI (seperti bobot mesin Background Remover) diunduh ke dalam cache browser Anda sekali. Model tersebut disimpan secara lokal di perangkat Anda untuk penggunaan berulang dan tidak pernah dikirimkan.",
      "li3": "Aset web kami (HTML, CSS, JS) disajikan sebagai file statis melalui Content Delivery Networks (CDNs) global untuk ketersediaan tinggi."
    },
    "thirdParty": {
      "p1": "Kami meminimalkan koneksi pihak ketiga. Satu-satunya layanan eksternal yang terlibat adalah penyedia web host standar yang diperlukan untuk menampilkan halaman ini:",
      "li1": "Platform kami di-host di Vercel. Vercel secara otomatis memproses log server web standar (yang berisi header anonim) untuk menyajikan sumber daya statis dan melindungi dari serangan DDoS.",
      "li2": "Model jaringan saraf yang digunakan dalam penghapusan latar belakang diunduh langsung ke browser Anda dari host imgly CDN. Setelah diunduh, model tersebut berjalan secara lokal.",
      "li3": "Kami sengaja mengecualikan Google Analytics, Facebook Pixel, Mixpanel, Hotjar, atau alat pelacak lainnya."
    },
    "rights": {
      "p1": "Di bawah GDPR, CCPA, dan standar privasi global, hak-hak Anda secara otomatis dihormati:",
      "li1": "Anda tidak perlu meminta penghapusan data Anda karena kami tidak pernah mengumpulkannya.",
      "li2": "Anda dapat menghapus sepenuhnya bobot saraf dan data model yang tersimpan di cache dengan membersihkan cache browser Anda.",
      "li3": "Karena tidak ada pengumpulan data atau pelacakan sama sekali, tidak diperlukan spanduk cookie, formulir opt-out, atau pusat preferensi privasi."
    },
    "contact": {
      "start": "Punya pertanyaan tentang arsitektur lokal-pertama kami? Hubungi kami di",
      "end": ""
    }
  },
  "terms": {
    "short": "Gunakan Alatify secara bebas untuk keperluan pribadi maupun komersial. Kami menyediakan alat berbasis browser ini \"apa adanya\" tanpa jaminan. Anda tetap bertanggung jawab penuh atas gambar yang Anda proses, dan Anda tidak boleh menggunakan Alatify untuk menangani konten ilegal.",
    "license": {
      "p1": "Kami memberi Anda lisensi yang mengizinkan dan bebas royalti untuk menggunakan Alatify berdasarkan ketentuan berikut:",
      "li1": "Anda bebas mengubah dan mengekspor gambar untuk produk komersial, desain pribadi, branding media sosial, atau publikasi cetak.",
      "li2": "Anda tidak diharuskan memberikan kredit kepada Alatify atau menautkan kembali ke layanan kami pada hasil karya akhir Anda.",
      "li3": "Tidak ada batasan tingkat pemrosesan, batas unggah, atau dinding akun karena semua proses ditenagai oleh perangkat lokal Anda sendiri.",
    },
    "user": {
      "p1": "Karena Alatify hanya berjalan secara lokal, kami tidak memantau atau membatasi gambar apa yang Anda impor. Namun, dengan menggunakan layanan ini, Anda menyetujui tanggung jawab berikut:",
      "li1": "Anda memverifikasi bahwa Anda memiliki atau memiliki hak lisensi yang sesuai atas gambar yang Anda impor dan ubah.",
      "li2": "Anda tidak boleh menggunakan Alatify untuk memproses materi yang ilegal, melecehkan, atau berbahaya, termasuk aset berhak cipta tanpa izin, atau materi ilegal lainnya.",
      "li3": "Anda menerima tanggung jawab untuk memastikan perangkat Anda memiliki sumber daya CPU dan RAM yang memadai untuk menjalankan komputasi WebAssembly yang berat secara aman."
    },
    "disclaimer": {
      "p1": "Silakan tinjau batasan tanggung jawab standar yang mengatur layanan berbasis browser kami:",
      "li1": "Alatify disediakan tanpa jaminan dalam bentuk apa pun, baik tersurat maupun tersirat. Kami tidak menjamin ketersediaan berkelanjutan, kompatibilitas dengan semua format file, atau rendering yang bebas dari kesalahan.",
      "li2": "Karena file gambar Anda diproses secara langsung dan tidak pernah disimpan di server mana pun, kami tidak dapat memulihkan konfigurasi atau editan yang hilang. Kami tidak bertanggung jawab atas kehilangan data apa pun.",
      "li3": "Hasil output (kompresi, pengubahan ukuran, pemformatan) adalah perkiraan. Verifikasi semua parameter output dan integritas file sebelum menyebarkan gambar ke tahap produksi."
    },
    "changes": "Ketentuan ini dapat berubah sewaktu-waktu secara berkala. Ketentuan layanan terbaru dan yang mengatur akan selalu dapat diakses di halaman ini. Penggunaan berkelanjutan Anda atas Alatify setelah perubahan diterapkan merupakan bentuk penerimaan terhadap ketentuan yang diperbarui tersebut.",
    "contact": {
      "start": "Punya pertanyaan tentang ketentuan layanan kami? Hubungi kami di",
      "end": ""
    }
  },
  "shared": {
    "privacyNotice": {
      "body": "Alatify memproses file grafis Anda sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser Anda. Kami tidak pernah mengunggah file atau koordinat privat Anda ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau retensi data di sisi server."
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
      "intro": "Kurangi ukuran file gambar hingga 90% sekaligus menjaganya tetap tajam — sepenuhnya di browser Anda. Pilih kompresi lossy untuk ukuran terkecil atau lossless untuk mempertahankan setiap piksel, dan proses seluruh kumpulan sekaligus. Tanpa unggah, tanpa pendaftaran — gambar Anda tidak pernah meninggalkan perangkat Anda.",
      "howItWorks": {
        "step1": "Tambahkan satu atau banyak gambar.",
        "step2": "Pilih lossy atau lossless, dan atur target kualitas Anda.",
        "step3": "Perkecil gambar secara instan, di perangkat Anda.",
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
        "a2": "Tidak. Kompresi berjalan sepenuhnya di browser Anda; file Anda tidak pernah meninggalkan perangkat Anda.",
        "q3": "Apa perbedaan antara lossy dan lossless?",
        "a3": "Lossy memberikan ukuran terkecil dengan membuang beberapa detail yang tidak terlihat; lossless mempertahankan setiap piksel dan tetap mengurangi ukuran. Anda yang memilih.",
        "q4": "Dapatkah saya mengompres banyak gambar sekaligus?",
        "a4": "Ya — kompres sekaligus dalam jumlah banyak dan unduh semuanya sebagai ZIP.",
        "q5": "Format apa saja yang didukung?",
        "a5": "JPG, PNG, dan WebP."
      },
      "privacyNotice": "Alatify memproses file grafis Anda sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser Anda. Kami tidak pernah mengunggah file atau koordinat privat Anda ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Kompres gambar JPG, PNG, dan WebP secara instan dan privat di perangkat Anda sendiri."
    },
    "bg-remover": {
      "sizes": {
        "isnet_quint8": "~45 MB",
        "isnet_fp16": "~85 MB",
        "isnet": "~170 MB"
      },
      "intro": "Sebagian besar penghapus latar belakang gratis mengunggah gambar Anda ke server mereka — dan banyak yang diam-diam menggunakannya untuk melatih AI mereka atau membatasi unduhan gratis pada resolusi rendah. Alatify berjalan sepenuhnya di browser Anda menggunakan AI di perangkat yang diakselerasi GPU. Foto Anda tidak pernah meninggalkan perangkat Anda. Tanpa pendaftaran, tanpa watermark, tanpa batas resolusi, dan tanpa batasan jumlah yang Anda proses — kualitas penuh, sepenuhnya privat, tanpa batas.",
      "howItWorks": {
        "step1": "Letakkan gambar Anda. Gambar tetap berada di perangkat Anda.",
        "step2": "AI di perangkat mendeteksi subjek dan menghapus latar belakang, diakselerasi GPU, dalam hitungan detik.",
        "step3": "Dapatkan potongan bersih dengan latar belakang transparan, pada resolusi penuh.",
        "step4": "Simpan PNG transparan Anda. Tanpa watermark, tanpa batasan."
      },
      "useCases": {
        "case1": "Foto produk dengan latar belakang transparan atau putih yang bersih untuk daftar Amazon, Etsy, Shopify, dan eBay.",
        "case2": "Isolasi diri Anda untuk foto profesional atau LinkedIn yang bersih.",
        "case3": "Potong logo, objek, atau orang untuk dimasukkan ke dalam desain, slide, dan thumbnail.",
        "case4": "Tempatkan subjek Anda di latar belakang apa pun untuk postingan, cerita, dan grafis."
      },
      "faq": {
        "q1": "Apakah ini benar-benar gratis dan tanpa batas?",
        "a1": "Ya — tanpa pendaftaran, tanpa watermark, tanpa batas harian, dan tanpa batasan resolusi. Alat ini berjalan di perangkat Anda sendiri, jadi tidak ada yang perlu kami batasi.",
        "q2": "Apakah alat ini mengunggah gambar saya ke server?",
        "a2": "Tidak. Berbeda dengan sebagian besar penghapus gratis yang memproses di sisi server — dan beberapa yang menggunakan unggahan Anda untuk melatih AI mereka — Alatify menjalankan AI sepenuhnya di browser Anda. Gambar Anda tidak pernah meninggalkan perangkat Anda.",
        "q3": "Apakah saya mendapatkan resolusi penuh?",
        "a3": "Ya. Banyak alat gratis membatasi unduhan pada resolusi rendah dan mengenakan biaya untuk HD. Alatify memberi Anda potongan resolusi penuh secara gratis.",
        "q4": "Bagaimana cara kerjanya tanpa mengunggah?",
        "a4": "Alat ini menggunakan AI di perangkat (via WebGPU/WebAssembly) yang berjalan secara lokal di browser Anda — perangkat Anda sendiri yang melakukan pemrosesan.",
        "q5": "Untuk apa saya bisa menggunakan hasilnya?",
        "a5": "Foto produk, PNG transparan untuk desain, foto profil, postingan sosial, dan daftar pasar — di mana saja Anda membutuhkan potongan yang bersih."
      },
      "privacyNotice": "Alatify menghapus latar belakang gambar seluruhnya di dalam tab browser Anda menggunakan AI di perangkat yang diakselerasi GPU. Foto Anda tidak pernah diunggah ke server, tidak pernah digunakan untuk melatih model, dan tidak pernah dicatat — membuat alat ini 100% kebal terhadap kebocoran atau retensi data di sisi server. Dapatkan PNG transparan resolusi penuh yang bebas watermark tanpa batas, diproses secara privat di perangkat Anda sendiri.",
      "onnxNotice": "",
      "modelNotice": "",
      "runtimeNotice": "Penggunaan pertama juga akan mengunduh runtime AI (~33 MB) sekali. Setelah itu semuanya disimpan di cache offline — penggunaan berikutnya akan dimuat secara instan."
    },
    "blur": {
      "intro": "Kaburkan wajah, pelat nomor, dan kredensial sensitif secara aman di browser web Anda. Seret kotak persegi panjang atau gambar sapuan kuas bebas untuk menghancurkan data piksel sensitif secara offline sepenuhnya.",
      "howItWorks": {
        "step1": "Unggah gambar Anda melalui seret-lepas, dialog file, atau unduh dari URL yang aman.",
        "step2": "Pilih mode Box untuk pelat/teks, atau mode Brush untuk target organik seperti wajah.",
        "step3": "Gambar persegi panjang atau lukis jalur. Sesuaikan ukuran dan intensitas keburaman secara dinamis.",
        "step4": "Klik Unduh. Alatify menghancurkan data piksel yang mendasarinya dan menghapus metadata EXIF."
      },
      "faq": {
        "q1": "Bagaimana cara mengaburkan pelat nomor sebelum menjual mobil secara online?",
        "a1": "Unggah foto, beralih ke Box Mode atau Brush Mode, tutupi area pelat nomor, dan terapkan efek pikselasi atau buram. Ini mencegah pengeruk otomatis dan agregator data menautkan kendaraan Anda ke registrasi lisensi pribadi Anda.",
        "q2": "Dapatkah saya menyunting kata sandi atau kredensial sensitif dari tangkapan layar?",
        "a2": "Ya. Untuk kata sandi, angka keuangan, atau kunci yang sangat sensitif, kami sangat menyarankan penggunaan efek Solid Fill. Berbeda dengan keburaman atau pikselasi yang mungkin dapat dipulihkan sebagian oleh AI, Solid Fill menggantikan area target dengan piksel hitam sepenuhnya.",
        "q3": "Apakah aman mengaburkan anak-anak atau wajah sebelum mempostingnya secara online?",
        "a3": "Tentu saja. Pilih Brush Mode untuk melukis di atas wajah dengan ukuran kuas yang dapat disesuaikan. Karena semuanya berjalan secara lokal di dalam browser web Anda yang di-sandbox, foto asli yang belum disunting tidak pernah dikirimkan melalui internet.",
        "q4": "Apakah halaman ini mengunggah gambar saya ke server?",
        "a4": "Tidak. Semua utilitas Alatify beroperasi pada model privasi yang ketat. Rendering gambar, penyusunan kotak, rendering piksel, dan kompilasi file dieksekusi sepenuhnya di sisi klien. File asli tidak pernah meninggalkan mesin Anda."
      },
      "privacyNotice": "Alatify memproses file grafis Anda sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser Anda. Kami tidak pernah mengunggah file atau koordinat privat Anda ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Kaburkan wajah, pelat nomor, dan kredensial sensitif secara aman dan privat di perangkat Anda sendiri.",
      "autoDetectHelp": ""
    },
    "converter": {
      "intro": "Konversi gambar di antara sembilan format — termasuk favorit web seperti WebP, format desain seperti SVG dan TIFF, serta format khusus seperti ICO (favicon) dan PDF — sepenuhnya di browser Anda. Seret beberapa file sekaligus, pilih format output, dan konversi dalam satu klik. Tanpa unggah, tanpa pendaftaran, tanpa watermark — file Anda tidak pernah meninggalkan perangkat Anda.",
      "howItWorks": {
        "step1": "Tambahkan satu atau banyak gambar (seret-lepas atau pemilih file).",
        "step2": "Pilih output Anda: JPG, PNG, WebP, PDF, ICO, SVG, TIFF, BMP, atau GIF.",
        "step3": "Proses semuanya sekaligus, secara instan, di perangkat Anda.",
        "step4": "Simpan satu per satu, atau ambil semuanya sebagai ZIP."
      },
      "useCases": {
        "case1": "Perkecil gambar untuk situs web yang memuat lebih cepat tanpa kehilangan kualitas.",
        "case2": "Buat favicon untuk situs web Anda dalam format yang benar.",
        "case3": "Gabungkan beberapa gambar menjadi satu PDF multi-halaman.",
        "case4": "Lacak gambar raster menjadi grafik vektor yang dapat diskalakan.",
        "case5": "Konversi foto iPhone menjadi JPG yang kompatibel secara universal."
      },
      "faq": {
        "q1": "Format apa saja yang bisa saya konversi?",
        "a1": "JPG, PNG, WebP, PDF, ICO, SVG, TIFF, BMP, dan GIF — ditambah input HEIC dari iPhone.",
        "q2": "Apakah alat ini mengunggah file saya ke server?",
        "a2": "Tidak. Konversi berjalan sepenuhnya di browser Anda; file Anda tidak pernah meninggalkan perangkat Anda.",
        "q3": "Dapatkah saya mengonversi banyak gambar sekaligus?",
        "a3": "Ya — seret beberapa file, konversi semuanya dalam satu klik, dan unduh sebagai ZIP.",
        "q4": "Bagaimana cara mengonversi PNG ke favicon ICO?",
        "a4": "Unggah PNG, pilih ICO sebagai format output, dan unduh — siap digunakan sebagai favicon situs.",
        "q5": "Dapatkah saya mengonversi foto HEIC dari iPhone saya?",
        "a5": "Ya. Tambahkan file HEIC Anda dan konversi ke JPG atau PNG secara instan."
      },
      "privacyNotice": "Alatify memproses file grafis Anda sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser Anda. Kami tidak pernah mengunggah file atau koordinat privat Anda ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Konversi gambar antara format JPG, PNG, WebP, PDF, ICO, SVG, TIFF, BMP, dan GIF secara instan dan privat di perangkat Anda sendiri.",
      "svgTooLarge": "",
      "alphaBackdropHelp": ""
    },
    "cropper": {
      "intro": "Potong ke rasio tetap atau secara bebas dengan pegangan yang dapat diseret, lalu luruskan dengan rotasi presisi — semuanya dengan pratinjau real-time di browser Anda. Tanpa unggah, tanpa pendaftaran — foto Anda tidak pernah meninggalkan perangkat Anda.",
      "howItWorks": {
        "step1": "Letakkan gambar Anda. Gambar tetap berada di perangkat Anda.",
        "step2": "Seret pegangan untuk pemotongan bebas, atau pilih rasio tetap seperti 1:1 atau 16:9.",
        "step3": "Putar untuk meratakan foto yang miring atau menyelaraskan subjek Anda.",
        "step4": "Simpan gambar hasil potongan Anda."
      },
      "useCases": {
        "case1": "Potong ke rasio tepat yang digunakan platform — kotak 1:1, spanduk 16:9, ukuran cerita.",
        "case2": "Bingkai foto wajah Anda dengan sempurna untuk profil atau avatar apa pun.",
        "case3": "Potong thumbnail yang ketat dan menarik perhatian untuk video dan artikel.",
        "case4": "Pangkas tepi yang mengganggu atau luruskan cakrawala yang miring."
      },
      "faq": {
        "q1": "Dapatkah saya memotong ke rasio tertentu?",
        "a1": "Ya — pilih rasio umum seperti 1:1, 4:3, atau 16:9, atau seret pegangan untuk pemotongan yang sepenuhnya bebas.",
        "q2": "Apakah alat ini mengunggah foto saya ke server?",
        "a2": "Tidak. Pemotongan berjalan sepenuhnya di browser Anda; foto Anda tidak pernah meninggalkan perangkat Anda.",
        "q3": "Dapatkah saya meluruskan foto yang miring?",
        "a3": "Ya — gunakan rotasi untuk meratakan cakrawala yang miring atau menyelaraskan subjek sebelum memotong.",
        "q4": "Apakah pemotongan akan menurunkan kualitas gambar saya?",
        "a4": "Tidak — pemotongan mempertahankan piksel asli di dalam area yang dipilih pada kualitas penuh.",
        "q5": "Dapatkah saya melakukan pemotongan bentuk bebas alih-alih rasio tetap?",
        "a5": "Ya — seret pegangan ke ukuran dan posisi apa pun yang Anda suka."
      },
      "privacyNotice": "Alatify memproses file grafis Anda sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser Anda. Kami tidak pernah mengunggah file atau koordinat privat Anda ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Potong dan putar gambar secara instan dan privat di perangkat Anda sendiri."
    },
    "exif-cleaner": {
      "intro": "Setiap foto yang diambil ponsel Anda membawa metadata EXIF tersembunyi — koordinat GPS, model kamera, tanggal, dan detail perangkat — yang ikut berpindah bersama file saat Anda membagikannya. Alatify menunjukkan kepada Anda apa yang tersembunyi di dalam secara tepat, lalu membersihkannya hingga bersih. Semuanya berjalan di browser Anda: foto Anda tidak pernah diunggah, dan pembersihan sepenuhnya lossless, sehingga hanya metadata yang dihapus — kualitas gambar Anda tetap tidak tersentuh.",
      "howItWorks": {
        "step1": "Seret dan letakkan foto Anda, atau pilih file. File tetap berada di perangkat Anda.",
        "step2": "Lihat semua metadata yang terdeteksi, dengan peringatan menonjol jika lokasi GPS ada.",
        "step3": "Hapus metadata secara lossless. Tanpa kompresi ulang, tanpa kehilangan kualitas.",
        "step4": "Simpan salinan bersih dengan nol metadata, siap dibagikan dengan aman."
      },
      "useCases": {
        "case1": "Foto yang diambil di rumah menyematkan lokasi GPS Anda. Hapus sebelum memposting ke Facebook Marketplace, eBay, atau Craigslist sehingga daftar tidak dapat mengungkapkan alamat Anda.",
        "case2": "Foto liburan dapat menyiarkan bahwa Anda sedang jauh dari rumah. Hapus lokasi dan stempel waktu sebelum memposting.",
        "case3": "Koordinat GPS yang tepat dapat mengarahkan orang asing ke pintu Anda. Bersihkan foto Anda sebelum membagikannya secara publik.",
        "case4": "Hapus data lokasi sebelum mengirimkan ke klien atau menerbitkannya secara online."
      },
      "faq": {
        "q1": "Bukankah Instagram atau Facebook sudah menghapus data EXIF?",
        "a1": "Postingan publik di sebagian besar platform menghapus EXIF — tetapi mereka menyimpan yang asli secara internal, dan banyak metode berbagi (mengirim file secara langsung, penyimpanan cloud, beberapa platform) menjaga metadata tetap utuh. Membersihkannya sendiri terlebih dahulu adalah satu-satunya cara untuk memastikannya.",
        "q2": "Bagaimana cara menghapus lokasi GPS sebelum menjual sesuatu secara online?",
        "a2": "Unggah foto, periksa peringatan GPS, hapus metadata, dan unduh salinan bersih untuk diposting — tidak ada data lokasi yang terlampir.",
        "q3": "Apakah menghapus metadata akan mengurangi kualitas foto saya?",
        "a3": "Tidak. Alatify menghapus metadata secara lossless dengan mengedit struktur biner file secara langsung — piksel Anda tidak pernah dikompresi ulang, jadi kualitasnya identik.",
        "q4": "Dapatkah saya melihat metadata apa yang terkandung dalam foto saya terlebih dahulu?",
        "a4": "Ya. Sebelum membersihkan, Alatify menampilkan semua metadata yang terdeteksi — koordinat GPS, model kamera, tanggal, dan info perangkat — jadi Anda tahu persis apa yang Anda hapus.",
        "q5": "Apakah foto saya diunggah ke server?",
        "a5": "Tidak. Deteksi dan pembersihan berjalan sepenuhnya di browser Anda. Foto Anda tidak pernah meninggalkan perangkat Anda."
      },
      "privacyNotice": "Alatify memproses file grafis Anda sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser Anda. Kami tidak pernah mengunggah file atau koordinat privat Anda ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Hapus riwayat lokasi (GPS Latitude/Longitude), penanda perangkat (produsen/model), log riwayat perangkat lunak, dan stempel waktu pengambilan secara instan dan aman sebelum didistribusikan.",
      "alreadyCleanNotice": "",
      "coordinatesNotice": ""
    },
    "id-protector": {
      "intro": "Setiap hari, jutaan foto ID mentah (KTP, SIM, paspor) dibagikan secara online, mengekspos mereka terhadap pencurian identitas dan penipuan. ID Privacy Shield memungkinkan Anda menyensor detail sensitif dengan blok padat yang tidak dapat dibalik dan menerapkan watermark ubin untuk menegakkan konteks penggunaan tertentu. Semuanya berjalan 100% secara lokal di browser Anda: dokumen Anda tidak pernah menyentuh server, dan file yang diunduh secara otomatis menghapus semua metadata tersembunyi.",
      "howItWorks": {
        "step1": "Pilih KTP, SIM, paspor, atau foto ID Anda. Dokumen Anda tidak pernah meninggalkan browser Anda.",
        "step2": "Gambar kotak sensor SOLID di atas bidang sensitif seperti nomor NIK/ID, tanda tangan, dan alamat.",
        "step3": "Tambahkan watermark ubin diagonal yang menyatakan tujuan dan tanggal untuk mencegah penggunaan kembali tanpa izin.",
        "step4": "Simpan PNG yang dilindungi secara langsung. Sensor ditanamkan langsung ke dalam piksel dan metadata dihapus."
      },
      "useCases": {
        "case1": "Amankan salinan KTP, SIM, atau paspor Anda sebelum mengirimkannya ke penyedia rental. Tambahkan watermark yang berisi nama agensi rental dan tanggal untuk menghindari penggunaan kembali.",
        "case2": "Sensor nomor non-esensial dan blok tanda tangan sebelum mengirimkan ID Anda ke platform gig atau portal verifikasi pasar freelance.",
        "case3": "Hindari mengirim foto ID mentah yang tidak dilindungi melalui WhatsApp atau email untuk reservasi hotel, kontrak freelance, atau pendaftaran layanan."
      },
      "faq": {
        "q1": "Apakah file ID saya diunggah ke server?",
        "a1": "Tidak. ID Privacy Shield berjalan sepenuhnya di browser web Anda. Semua pemrosesan, penyensoran, dan pelapisan watermark dilakukan secara lokal melalui sandbox canvas APIs. Dokumen pribadi Anda tidak pernah menyentuh server kami.",
        "q2": "Apakah kotak sensor padat dapat dibalikkan?",
        "a2": "Tidak. Saat Anda menggunakan sensor Solid, piksel ditanamkan langsung ke dalam PNG output, secara permanen menimpa piksel asli. Perlu dicatat bahwa Blur secara teoritis dapat dibalikkan, jadi kami sangat menyarankan blok Solid untuk data yang sangat sensitif.",
        "q3": "Apakah watermark mencegah pemotongan?",
        "a3": "Ya. Dengan memilih opsi Tiled Pattern, watermark akan di-render berulang kali di seluruh kanvas dokumen. Ini membuatnya tidak mungkin untuk memotong watermark keluar tanpa memotong konten ID itu sendiri.",
        "q4": "Apakah alat ini berfungsi di perangkat seluler?",
        "a4": "Ya. ID Privacy Shield responsif dan mendukung penuh kontrol sentuh, memungkinkan Anda menggambar kotak sensor dan mengunduh dokumen di smartphone dan tablet.",
        "q5": "Apakah metadata dan data EXIF dihapus?",
        "a5": "Ya. Mengodekan ulang gambar yang diubah ke PNG secara otomatis menghapus semua metadata EXIF, koordinat GPS, tag perangkat, dan parameter riwayat untuk privasi maksimal."
      },
      "privacyNotice": "Alatify memproses file ID Anda sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser Anda. Kami tidak pernah mengunggah dokumen atau koordinat privat Anda ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Sensor nomor identitas sensitif, lapisi watermark ubin diagonal, dan hapus metadata EXIF GPS/kamera secara instan dan aman di perangkat Anda sendiri sebelum didistribusikan.",
      "uploadInstructions": ""
    },
    "qr-toolkit": {
      "intro": "Buat QR codes statis sepenuhnya offline yang menjadi milik Anda selamanya tanpa jebakan kedaluwarsa dinamis. Pindai QR codes yang tidak dikenal dan audit titik akhirnya secara aman di dalam tab browser Anda: hapus parameter pelacakan dan analisis URL sebelum membukanya.",
      "howItWorks": {
        "step1": "Pilih mode URL, Teks, atau Wi-Fi. Ketik detailnya. QR di-render segera secara offline.",
        "step2": "Sesuaikan ukuran, margin, warna kustom, dan koreksi kesalahan sebelum mengunduh PNG/SVG.",
        "step3": "Arahkan kamera Anda atau letakkan gambar. Dekode dieksekusi secara lokal di dalam browser Anda.",
        "step4": "Verifikasi domain target, bersihkan parameter pelacakan, dan tinjau peringatan pada jalur yang dipersingkat."
      },
      "faq": {
        "q1": "Apa yang dimaksud dengan QR code bebas pelacak?",
        "a1": "Banyak layanan generator QR memaksa Anda menggunakan tautan dinamis yang mengarah ke proksi pengalihan. Ini melacak lokasi, perangkat, dan frekuensi Anda. Alatify menghasilkan QR codes statis yang mengodekan teks mentah secara langsung: nol pelacakan, nol kedaluwarsa, sepenuhnya milik Anda.",
        "q2": "Mengapa Safe Scanner menghapus parameter pelacakan URL?",
        "a2": "QR codes semakin banyak digunakan untuk pelacakan pemasaran atau phishing (quishing). Saat Anda memindai URL, kami mendeteksi parameter seperti UTM dan ID klien, menghapusnya, dan mengungkapkan domain langsung sehingga Anda tahu persis di mana Anda mendarat.",
        "q3": "Dapatkah pemindai mengikuti tautan pemendek untuk memeriksa tujuan?",
        "a3": "Tidak. Menyelesaikan pengalihan dari pemendek seperti bit.ly atau tinyurl memerlukan pengiriman permintaan ke server eksternal, yang membocorkan IP dan metadata Anda. Agar tetap 100% privat, kami menandai URL yang dipersingkat dengan pemberitahuan keamanan sehingga Anda dapat melanjutkan dengan hati-hati.",
        "q4": "Apakah umpan kamera yang dipindai atau gambar yang diunggah dikirim ke server mana pun?",
        "a4": "Tidak pernah. Semua dekoder dan generator beroperasi secara lokal di mesin klien Anda menggunakan sandbox eksekusi JS. Tidak ada titik akhir API, pelacak analitik, atau pengambilan jaringan yang digunakan selama operasi."
      },
      "privacyNotice": "Alatify memproses QR codes Anda sepenuhnya secara lokal menggunakan sandboxed client APIs di dalam tab browser Anda. Kami tidak pernah mengunggah URL, konten teks biasa, umpan kamera, atau file grafis yang diunggah. Alat ini 100% offline dan bebas telemetri, menjaga semua tujuan yang dipindai dan payload yang dihasilkan sepenuhnya privat di perangkat Anda."
    },
    "resizer": {
      "intro": "Ubah ukuran gambar berdasarkan piksel yang tepat, berdasarkan persentase, atau dengan rasio aspek terkunci — semuanya di browser Anda. Pencuplikan ulang berkualitas tinggi menjaga tepi tetap tajam, dan Anda dapat mengubah ukuran seluruh kumpulan sekaligus. Tanpa unggah, tanpa pendaftaran — gambar Anda tidak pernah meninggalkan perangkat Anda.",
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
        "a2": "Tidak. Pengubahan ukuran berjalan sepenuhnya di browser Anda; file Anda tidak pernah meninggalkan perangkat Anda.",
        "q3": "Apakah pengubahan ukuran akan meregangkan atau mendistorsi gambar saya?",
        "a3": "Tidak jika Anda mengunci rasio aspeknya — ini akan menskalakan secara proporsional. Anda juga dapat membukanya untuk pengubahan ukuran bebas.",
        "q4": "Dapatkah saya mengubah ukuran banyak gambar sekaligus?",
        "a4": "Ya — ubah ukuran kumpulan semuanya ke dimensi yang sama dan unduh sebagai ZIP.",
        "q5": "Apakah pengubahan ukuran akan menurunkan kualitas?",
        "a5": "Alatify menggunakan pencuplikan ulang berkualitas tinggi untuk menjaga hasil tetap setajam mungkin saat melakukan penskalaan."
      },
      "privacyNotice": "Alatify memproses file grafis Anda sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser Anda. Kami tidak pernah mengunggah file atau koordinat privat Anda ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Ubah ukuran gambar berdasarkan piksel, persentase, atau rasio aspek secara instan dan privat di perangkat Anda sendiri.",
      "cropBehaviorHelp": "",
      "fitBehaviorHelp": ""
    },
    "steganography": {
      "intro": "Lindungi komunikasi Anda secara offline. Tanamkan teks privat ke dalam gambar melalui steganografi Least Significant Bit (LSB), dengan enkripsi kata sandi AES-GCM opsional. File tetap terlihat identik di mata telanjang. Semuanya berjalan sepenuhnya di dalam sandbox browser Anda: tanpa server, tanpa kebocoran.",
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
        "a3": "Anda dapat menanamkan teks biasa, catatan markdown, kunci lisensi, atau string konfigurasi apa pun. Kami memberlakukan pemeriksaan batas kapasitas yang jelas untuk mencegah pemotongan, berdasarkan dimensi alami dari gambar pembawa yang diunggah.",
        "q4": "Apakah gambar atau data kata sandi saya dikirim ke server mana pun?",
        "a4": "Tidak pernah. Semua enkripsi (menggunakan Web Crypto API) dan penyesuaian LSB tingkat piksel terjadi di sisi klien di dalam browser. File asli dan kata sandi Anda tidak pernah meninggalkan perangkat Anda."
      },
      "privacyNotice": "Alatify memproses file grafis Anda sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser Anda. Kami tidak pernah mengunggah file, pesan rahasia, atau kata sandi Anda ke cloud eksternal. Penanaman LSB, derivasi kunci PBKDF2, dan enkripsi AES-GCM berjalan sepenuhnya offline, melindungi data Anda dari kebocoran di sisi server.",
      "passwordHelp": ""
    },
    "upscaler": {
      "intro": "Pertajam dan perbesar foto Anda dengan jaringan saraf Real-ESRGAN yang berjalan sepenuhnya di browser Anda. Berjalan 100% di browser Anda — gambar Anda tidak pernah meninggalkan perangkat Anda.",
      "howItWorks": {
        "step1": "Letakkan gambar Anda. Gambar tetap berada di perangkat Anda.",
        "step2": "Pilih 2x untuk kecepatan atau 4x untuk detail maksimum.",
        "step3": "AI di perangkat menyempurnakan gambar ubin demi ubin, diakselerasi GPU jika didukung.",
        "step4": "Simpan PNG Anda yang lebih tajam dan beresolusi lebih tinggi."
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
        "a1": "Tidak. Semua pemrosesan terjadi secara lokal di browser Anda — gambar Anda tidak pernah meninggalkan perangkat Anda.",
        "q2": "Bagaimana cara kerja AI upscaler?",
        "a2": "Alat ini menggunakan jaringan saraf Real-ESRGAN yang merekonstruksi detail dan mempertajam tepi, berjalan pada GPU perangkat Anda melalui WebGPU (dengan fallback CPU).",
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
        "a8": "Ya — setelah model disimpan di cache, browser Anda dapat meningkatkan ukuran tanpa koneksi internet."
      },
      "privacyNotice": "Alatify meningkatkan ukuran gambar seluruhnya di dalam tab browser Anda menggunakan AI di perangkat yang diakselerasi GPU. Foto Anda tidak pernah diunggah ke server, tidak pernah digunakan untuk melatih model, dan tidak pernah dicatat — membuat alat ini 100% kebal terhadap kebocoran atau retensi data di sisi server. Dapatkan gambar upscaled resolusi tinggi bebas watermark tanpa batas, diproses secara privat di perangkat Anda sendiri.",
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
        "step3": "Jepret ke sudut, ubin di seluruh gambar, atau seret ke mana pun Anda suka.",
        "step4": "Simpan gambar ber-watermark Anda secara individual atau sebagai ZIP."
      },
      "useCases": {
        "case1": "Cegah pencurian gambar dan penggunaan kembali tanpa izin dengan watermark yang terlihat.",
        "case2": "Tambahkan logo atau handle Anda ke foto sebelum memposting atau membagikannya.",
        "case3": "Terapkan watermark yang sama ke seluruh kumpulan sekaligus dalam satu langkah.",
        "case4": "Ulangi watermark secara diagonal sehingga tidak dapat dipotong begitu saja."
      },
      "faq": {
        "q1": "Apakah alat ini mengunggah gambar atau logo saya?",
        "a1": "Tidak. Semuanya berjalan di browser Anda; gambar dan logo Anda tidak pernah meninggalkan perangkat Anda.",
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
      "privacyNotice": "Alatify memproses file grafis Anda sepenuhnya secara lokal menggunakan sandbox APIs di dalam tab browser Anda. Kami tidak pernah mengunggah file atau koordinat watermark privat Anda ke cloud eksternal, membuat alat ini 100% kebal terhadap kebocoran atau pencatatan di sisi server. Amankan merek dan lindungi gambar Anda secara langsung di perangkat Anda sendiri.",
      "previewResolutionNotice": ""
    },
    "stock-finder": {
      "intro": "Cari di Unsplash, Pexels, dan Pixabay sekaligus — dan tidak seperti kebanyakan pencari stok yang hanya menampilkan foto, Alatify juga menampilkan ilustrasi dan vektor. Temukan gambar yang pas, lalu langsung buka di alat edit Alatify untuk menghapus latarnya, mengompresnya, atau mengonversinya — semuanya gratis, tanpa daftar akun.",
      "howItWorks": {
        "step1": "Ketik kata kunci untuk mencari stok gratis di Unsplash, Pexels, dan Pixabay sekaligus.",
        "step2": "Persempit berdasarkan jenis konten (foto, ilustrasi, atau vektor), sumber, dan orientasi.",
        "step3": "Pilih gambar yang Anda inginkan.",
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
        "a2": "Ya. Kebanyakan pencari stok hanya menampilkan foto — Alatify juga menampilkan ilustrasi dan vektor, jadi Anda bisa mencari berdasarkan jenis konten.",
        "q3": "Apakah saya bisa langsung mengedit gambar setelah menemukannya?",
        "a3": "Ya — buka hasil mana pun dengan satu klik di alat berbasis browser Alatify untuk menghapus latarnya, mengompresnya, mengonversinya, dan lainnya.",
        "q4": "Apakah saya perlu mendaftar?",
        "a4": "Tidak. Cari dan edit dengan bebas, tanpa perlu akun.",
        "q5": "Dari mana gambar-gambar ini berasal?",
        "a5": "Tiga pustaka stok gratis terbesar: Unsplash, Pexels, dan Pixabay."
      }
    }
  }
};
