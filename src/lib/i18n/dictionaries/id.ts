export const id = {
  home: {
    hero: {
      badge: "{count} tools · open source",
      title: "Matikan WiFi kamu. Tool-nya tetap jalan.",
      tagline:
        "Filemu tidak pernah diunggah, karena memang tidak ada tempat untuk mengunggahnya. Semua tool jalan di dalam tab browser kamu sendiri.",
      ctaPrimary: "Coba tool",
      ctaSecondary: "Cara kerjanya",
      proof: {
        tabNetwork: "Network",
        tabConsole: "Console",
        throttle: "Offline",
        empty: "No requests",
        requests: "0 requests",
        transferred: "0 kB transferred",
        file: "photo.jpg · 1.9 MB → 163 kB",
      },
    },
    features: {
      card1: {
        title: "Tanpa Upload",
        text: "Semua algoritma berjalan lokal di dalam tab browser kamu yang terisolasi. Tidak ada server yang menyimpan filemu.",
      },
      card2: {
        title: "Nyaris Seketika",
        text: "Sama sekali tidak perlu menunggu unggahan selesai. Proses gambar resolusi tinggi langsung di perangkatmu.",
      },
    },
  },
  about: {
    intro: "Alat edit gambar harusnya menghargai privasi kamu.",
    why: {
      p1: "Kebanyakan alat gambar online mengharuskan kamu mengunggah file ke server mereka. Itu artinya gambarmu, yang mungkin berisi momen pribadi, aset bisnis, atau konten sensitif, harus lewat infrastruktur orang lain.",
      p2: "Alatify beda. Setiap alat berjalan sepenuhnya di browser kamu, pakai sumber daya perangkatmu sendiri. Filemu tidak pernah keluar dari perangkat. Kami percaya bahwa alat yang cepat, bertenaga, dan benar-benar privat adalah cara terbaik untuk menghargai kebebasan pengguna.",
    },
    offer: {
      li1: "Alat browser lengkap, mulai dari Background Remover, Image Compressor, Format Converter, Resizer, Cropper, EXIF Cleaner, Watermark, QR Toolkit, dan lainnya, semuanya jalan langsung di browser kamu.",
      li2: "Tanpa perlu daftar akun, tanpa unggah ke server, dan bebas dari cookie analitik.",
      li3: "Proses file ukuran berapa saja tanpa pendaftaran, kartu kredit, atau batasan tersembunyi.",
      li4: "Kode yang transparan dan bisa dipakai offline, pakai teknologi web standar.",
    },
    who: {
      p1: "Alatify dirancang dan dibuat oleh developer independen dari Indonesia. Didorong oleh kecintaan pada teknologi yang mengutamakan privasi dan desain yang bersih, platform ini dibuat untuk membuktikan bahwa aplikasi di browser juga bisa sekuat aplikasi profesional tanpa harus mengorbankan privasi kamu.",
      p2: "Stack teknologi kami memakai Next.js, WebAssembly, dan Tailwind CSS, dengan Vercel sebagai penyedia server dan pengiriman aset statis. Kalau kamu merasa Alatify membantu, bagikan juga ke orang lain yang peduli dengan privasi, ya!",
    },
    road: {
      p1: "Alatify dibuat untuk terus tumbuh. Saat ini kami sudah menyediakan fitur background removal, kompresi, konversi format, pengubahan ukuran, pemotongan, pembersihan EXIF, watermark, dan AI upscaling. Semuanya jalan secara lokal di browser kamu, dan kami akan terus menambah alat baru yang mengutamakan privasi seiring waktu.",
      p2_start:
        "Saran dan masukan dari kamu sangat berharga. Kalau ada saran, request fitur, atau bug yang ingin dilaporkan, silakan hubungi kami di",
      p2_end: ".",
    },
  },
  privacy: {
    short:
      "Alatify tidak mengumpulkan, menyimpan, atau mengirimkan gambar maupun data pribadimu. Semua proses terjadi sepenuhnya di browser kamu. Tanpa daftar akun, tanpa pelacakan pengguna, dan bebas dari analitik pihak ketiga.",
    collect: {
      p1: "Karena Alatify dirancang untuk berjalan 100% lokal di komputermu, kami tidak mengakses atau mengumpulkan hal-hal ini:",
      li1: "Filemu tidak pernah diunggah ke server mana pun. Semuanya diurai dan diubah secara lokal di dalam sandbox browser kamu.",
      li2: "Kami tidak mencatat detail koneksi kamu.",
      li3: "Kami tidak memantau seberapa sering kamu memakai alat kami atau pengaturan apa yang kamu pilih.",
      li4: "Kami tidak memakai kode pelacakan, cookie pihak ketiga, atau browser fingerprinting.",
      li5: "Tidak butuh nama, alamat email, data pembayaran, atau akun apa pun.",
    },
    do: {
      p1: "Biar bisa menyediakan alat pemrosesan gambar tanpa beban server, Alatify bekerja dengan prinsip berikut:",
      li1: "Kami membuat alat ini memakai WebAssembly dan JavaScript sisi klien. Semua komputasi dijalankan di dalam tab browser kamu menggunakan sumber daya hardware lokalmu.",
      li2: "Model AI (seperti data mesin Background Remover) diunduh ke cache browser kamu sekali saja. Model ini disimpan lokal di perangkatmu untuk dipakai berulang kali dan tidak pernah dikirim ke luar.",
      li3: "Aset web kami (HTML, CSS, JS) dikirim sebagai file statis lewat Content Delivery Networks (CDN) global biar selalu siap diakses.",
    },
    thirdParty: {
      p1: "Kami meminimalkan koneksi ke pihak ketiga. Satu-satunya layanan luar yang terlibat hanyalah penyedia hosting web standar untuk menampilkan halaman ini:",
      li1: "Platform kami di-host di Vercel. Vercel otomatis memproses log server web standar (berisi data header anonim) untuk mengirim aset statis dan melindungi dari serangan DDoS.",
      li2: "Model AI yang dipakai di Background Remover diunduh langsung ke browser kamu dari server imgly CDN. Setelah diunduh, model ini langsung berjalan lokal.",
      li3: "Kami sengaja tidak memakai Google Analytics, Facebook Pixel, Mixpanel, Hotjar, atau alat pelacak lainnya.",
    },
    rights: {
      p1: "Sesuai GDPR, CCPA, dan standar privasi global, hak-hakmu otomatis terlindungi:",
      li1: "Kamu tidak perlu meminta penghapusan data karena kami memang tidak pernah mengumpulkannya.",
      li2: "Kamu bisa menghapus seluruh data model AI yang tersimpan di cache cukup dengan membersihkan cache browser kamu.",
      li3: "Karena sama sekali tidak ada pelacakan atau pengumpulan data, kamu tidak akan menemui spanduk persetujuan cookie, formulir opt-out, atau pengaturan privasi yang ribet.",
    },
    contact: {
      start:
        "Punya pertanyaan tentang arsitektur lokal-first kami? Hubungi kami di",
      end: "",
    },
  },
  terms: {
    short:
      "Silakan pakai Alatify dengan bebas untuk keperluan pribadi maupun komersial. Kami menyediakan alat berbasis browser ini apa adanya tanpa jaminan. Kamu bertanggung jawab penuh atas gambar yang kamu proses, dan tidak boleh memakai Alatify untuk memproses konten ilegal.",
    license: {
      p1: "Kami memberikan lisensi bebas royalti untuk memakai Alatify dengan ketentuan berikut:",
      li1: "Kamu bebas mengedit dan mengekspor gambar untuk produk komersial, desain pribadi, branding media sosial, atau kebutuhan cetak.",
      li2: "Kamu tidak wajib mencantumkan kredit ke Alatify atau menautkan ke situs kami di karya akhirmu.",
      li3: "Tidak ada batasan kecepatan proses, batas maksimal unggahan, atau batasan akun karena semua pemrosesan ditenagai oleh perangkat lokalmu sendiri.",
    },
    user: {
      p1: "Karena Alatify berjalan lokal, kami tidak memantau atau membatasi gambar apa yang kamu masukkan. Namun, dengan memakai layanan ini, kamu menyetujui tanggung jawab berikut:",
      li1: "Kamu menjamin bahwa kamu adalah pemilik sah atau punya hak lisensi resmi atas gambar yang kamu masukkan dan edit.",
      li2: "Kamu dilarang keras memakai Alatify untuk memproses materi ilegal, melecehkan, atau berbahaya, termasuk aset berhak cipta tanpa izin.",
      li3: "Kamu bertanggung jawab memastikan perangkatmu punya sumber daya CPU dan RAM yang cukup agar komputasi WebAssembly yang berat bisa berjalan dengan aman.",
    },
    disclaimer: {
      p1: "Silakan baca batasan tanggung jawab standar yang mengatur layanan berbasis browser kami:",
      li1: "Alatify disediakan tanpa jaminan apa pun, baik tersurat maupun tersirat. Kami tidak menjamin ketersediaan terus-menerus, kecocokan format file, atau rendering yang bebas kesalahan.",
      li2: "Karena gambarmu diproses langsung dan tidak pernah disimpan di server, kami tidak bisa memulihkan editan atau pengaturan yang hilang. Kami tidak bertanggung jawab atas kehilangan datamu.",
      li3: "Hasil keluaran (kompresi, ukuran, format) bersifat perkiraan. Cek kembali seluruh hasil akhir dan keutuhan file sebelum kamu memakainya untuk kebutuhan produksi.",
    },
    changes:
      "Ketentuan ini bisa berubah sewaktu-waktu. Ketentuan terbaru yang berlaku akan selalu ditampilkan di halaman ini. Dengan terus memakai Alatify setelah ketentuan diperbarui, artinya kamu menyetujui ketentuan baru tersebut.",
    contact: {
      start: "Punya pertanyaan tentang ketentuan layanan kami? Hubungi kami di",
      end: "",
    },
  },
  shared: {
    privacyNotice: {
      title: "Privat Secara Native & Aman Client-Side",
      body: "Alatify memproses file gambarmu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat pribadimu ke server cloud luar, sehingga 100% aman dari kebocoran data.",
    },
    related: {
      blur: "Sensor wajah, pelat nomor, dan info sensitif secara lokal.",
      "exif-cleaner-metadata": "Hapus lokasi GPS dan metadata kamera.",
      "exif-cleaner-gps": "Hapus GPS dan metadata sebelum kamu membagikannya.",
      "exif-cleaner-tags": "Hapus metadata dan tag GPS.",
      "exif-cleaner-info":
        "Hapus info lokasi dan kamera dari fotomu secara lokal.",
      "bg-remover": "Potong objek secara lokal langsung di browser kamu.",
      "bg-remover-backdrops":
        "Ekstrak subjek dan hapus background secara lokal.",
      upscaler: "Perbesar foto 2x dan 4x langsung di perangkatmu.",
      "compressor-savings":
        "Kecilkan ukuran file sampai 90% tanpa merusak kualitas.",
      "compressor-offline":
        "Kecilkan ukuran file gambar sampai 90% secara offline.",
      "resizer-dimensions": "Ubah dimensi gambar pakai persentase atau piksel.",
      "resizer-pixels":
        "Ubah ukuran gambar berdasarkan piksel, rasio, atau persen.",
      "converter-formats":
        "Konversi file antara JPG, PNG, WebP, PDF, dan vektor.",
      "converter-instantly": "Konversi antara PNG, JPEG, dan WebP seketika.",
      watermark: "Tambahkan watermark teks atau gambar kustom.",
    },
  },
  tools: {
    compressor: {
      intro:
        "Kecilkan ukuran file gambar dengan kontrol penuh. Pilih lossy untuk ukuran paling kecil, atau lossless kalau kamu mau mempertahankan tiap piksel. Semuanya jalan di browser kamu, tanpa perlu unggah.",
      hintBubble:
        "Tips: Biar file-nya paling kecil, ekspor fotomu ke JPEG. Pilih PNG kalau kamu butuh latar belakang transparan.",
      alreadyOptimised: "Sudah optimal. File ini tidak bisa dikecilkan lagi.",
      losslessConvertDisabled:
        "Pilihan lossless hanya bisa dipakai saat kamu mengompres ulang file PNG asli.",
      pngLargerNudge:
        "Mengubah format ke PNG malah membuat file-nya jadi lebih besar. Biar lebih kecil, coba pakai WebP atau JPEG saja.",
      howItWorks: {
        step1: "Masukkan satu atau beberapa gambar sekaligus.",
        step2:
          "Pilih antara lossy atau lossless, lalu atur kualitas yang kamu mau.",
        step3: "Kecilkan gambarmu seketika, langsung di perangkatmu.",
        step4:
          "Simpan hasilnya satu per satu atau unduh semua sekaligus dalam format ZIP.",
      },
      useCases: {
        case1:
          "Gambar yang lebih kecil bakal dimuat lebih cepat, membantu menaikkan kecepatan website dan SEO.",
        case2:
          "Penuhi batas maksimal lampiran email atau unggahan web tanpa merusak kualitas gambar.",
        case3:
          "Kosongkan ruang penyimpanan perangkat dengan mengecilkan koleksi fotomu yang besar.",
        case4:
          "Penuhi batasan ukuran file di berbagai platform sambil menjaga gambar tetap tajam.",
      },
      faq: {
        q1: "Seberapa jauh ukuran gambarku bisa berkurang?",
        a1: "Sering kali bisa sampai 90% lebih kecil, tergantung dari gambar dan pengaturan kualitasnya, tapi tampilannya bakal tetap tajam.",
        q2: "Apakah alat ini mengunggah gambarku?",
        a2: "Tidak. Kompresi berjalan sepenuhnya di browser kamu. Filemu tidak pernah keluar dari perangkat.",
        q3: "Apa bedanya lossy dan lossless?",
        a3: "Lossy menghasilkan ukuran paling kecil dengan membuang detail yang tidak kasatmata. Lossless mempertahankan tiap piksel sambil tetap memperkecil file. Kamu tinggal pilih mana yang paling pas.",
        q4: "Bisa kompres banyak gambar sekaligus?",
        a4: "Bisa. Kompres banyak sekaligus lalu unduh semuanya dalam format ZIP.",
        q5: "Format apa saja yang didukung?",
        a5: "JPG, PNG, dan WebP.",
      },
      privacyNotice:
        "Alatify memproses file gambarmu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau data pribadimu ke server mana pun, sehingga 100% aman dari kebocoran data. Kompres JPG, PNG, dan WebP secara instan dan aman di perangkatmu sendiri.",
    },
    "bg-remover": {
      sizes: {
        isnet_quint8: "~45 MB",
        isnet_fp16: "~85 MB",
        isnet: "~170 MB",
      },
      intro:
        "Kebanyakan penghapus background gratis mengunggah gambarmu ke server mereka. Parahnya, banyak yang diam-diam memakai gambarmu untuk melatih AI mereka atau membatasi unduhan gratis di resolusi rendah. Alatify berjalan sepenuhnya di browser kamu memakai AI lokal yang diakselerasi GPU. Fotomu tidak pernah keluar dari perangkat. Tanpa daftar akun, tanpa watermark, tanpa batas resolusi, dan tanpa batasan jumlah foto yang kamu proses. Kualitas penuh, sepenuhnya privat, tanpa batas.",
      howItWorks: {
        step1:
          "Letakkan gambarmu di sini. File tetap tersimpan aman di perangkatmu.",
        step2:
          "AI lokal mendeteksi objek utama dan menghapus background secara instan dalam hitungan detik, dengan akselerasi GPU.",
        step3:
          "Dapatkan potongan gambar yang rapi dengan background transparan, langsung di resolusi penuh.",
        step4:
          "Simpan hasilnya dalam format PNG transparan. Tanpa watermark, tanpa batasan.",
      },
      useCases: {
        case1:
          "Foto produk dengan background transparan atau putih bersih untuk daftar Amazon, Etsy, Shopify, dan eBay.",
        case2:
          "Isolasi diri kamu untuk foto profesional atau LinkedIn yang bersih.",
        case3:
          "Potong logo, objek, atau orang untuk dimasukkan ke dalam desain, slide, dan thumbnail.",
        case4:
          "Tempatkan subjek fotomu di background apa pun untuk postingan, cerita, dan grafis.",
      },
      faq: {
        q1: "Apakah ini benar-benar gratis dan tanpa batasan?",
        a1: "Iya, tanpa pendaftaran, tanpa watermark, tanpa batas harian, dan tanpa batasan resolusi. Alat ini berjalan langsung di perangkatmu sendiri, jadi tidak ada batasan yang kami terapkan.",
        q2: "Apakah alat ini mengunggah gambarku ke server?",
        a2: "Tidak. Beda dengan alat penghapus background gratis lain yang memprosesnya di server, dan ada yang memakai fotomu untuk melatih AI mereka, Alatify menjalankan AI sepenuhnya di browser kamu. Gambarmu tidak pernah meninggalkan perangkat.",
        q3: "Apakah aku bakal mendapat resolusi penuh?",
        a3: "Tentu saja. Banyak alat gratis memotong resolusi unduhan dan meminta bayaran untuk kualitas HD. Alatify memberi kamu hasil potongan resolusi penuh secara gratis.",
        q4: "Bagaimana cara kerjanya tanpa unggah file?",
        a4: "Alat ini memakai AI di perangkat (lewat WebGPU/WebAssembly) yang berjalan langsung di browser kamu. Jadi, perangkatmu sendirilah yang melakukan semua pemrosesan.",
        q5: "Hasil gambarnya bisa dipakai untuk apa saja?",
        a5: "Foto produk, PNG transparan untuk bahan desain, foto profil, postingan sosial, atau e-commerce, apa saja yang butuh potongan rapi.",
      },
      privacyNotice:
        "Alatify menghapus background gambar sepenuhnya di dalam tab browser kamu menggunakan AI lokal dengan akselerasi GPU. Fotomu tidak pernah diunggah ke server, tidak pernah dipakai melatih model, dan tidak pernah dicatat, sehingga 100% aman dari kebocoran atau penyimpanan data di server. Dapatkan file PNG transparan resolusi penuh bebas watermark sepuasnya, diproses aman di perangkatmu sendiri.",
      onnxNotice:
        "Fitur potong gambar AI di Alatify menjalankan jaringan saraf yang sangat dioptimalkan langsung di browser kamu menggunakan ONNX runtime WebAssembly.",
      modelNotice:
        "Model GPU bakal lebih cepat di perangkat yang mendukung. Model Lite (CPU) paling pas buat perangkat tanpa akselerasi GPU.",
      runtimeNotice:
        "Saat pertama kali dipakai, browser akan mengunduh runtime AI (~33 MB) sekali saja. Setelah itu, semuanya disimpan di cache offline agar bisa langsung dimuat secara instan di pemakaian berikutnya.",
    },
    blur: {
      intro:
        "Sensor wajah, pelat nomor, dan info sensitif dengan aman langsung di browser kamu. Seret kotak merah atau usap kuas untuk menghapus permanen bagian sensitifnya secara offline.",
      howItWorks: {
        step1:
          "Masukkan gambarmu lewat seret-lepas, tombol pemilih file, atau ambil dari URL aman.",
        step2:
          "Pilih mode Box untuk pelat/teks, atau mode Brush untuk target alami seperti wajah.",
        step3:
          "Gambar kotak atau sapukan kuas. Atur ukuran dan tingkat keburaman sesukamu.",
        step4:
          "Klik Unduh. Alatify bakal menghapus permanen piksel asli di area itu dan membuang metadata EXIF.",
      },
      faq: {
        q1: "Bagaimana cara menyensor pelat nomor sebelum menjual mobil secara online?",
        a1: "Unggah fotomu, aktifkan Box Mode atau Brush Mode, tutupi pelat nomor, lalu pakai efek pikselasi atau buram. Ini mencegah sistem pencari otomatis mencatat detail kendaraan yang bisa dihubungkan ke data pribadimu.",
        q2: "Bisa tidak menyensor kata sandi atau info rahasia dari screenshot?",
        a2: "Bisa. Untuk kata sandi, nominal uang, atau kunci rahasia yang sangat sensitif, kami sangat menyarankan efek Solid Fill. Beda dengan efek buram atau pikselasi yang teorinya masih bisa dipulihkan dengan AI, Solid Fill akan mengganti area target dengan warna hitam pekat secara permanen.",
        q3: "Apakah aman menyensor wajah anak atau orang lain sebelum diposting online?",
        a3: "Sangat aman. Pilih Brush Mode untuk mengusap wajah dengan ukuran kuas yang bisa diatur. Karena semua proses berjalan lokal di dalam sandbox browser kamu, foto asli yang belum diedit tidak pernah dikirim ke internet.",
        q4: "Apakah halaman ini mengunggah gambarku ke server?",
        a4: "Tidak. Semua alat Alatify jalan dengan aturan privasi ketat. Proses render gambar, pembuatan kotak sensor, dan ekspor file semuanya dijalankan di browser kamu. File aslimu tidak pernah keluar dari perangkat.",
      },
      privacyNotice:
        "Alatify memproses file gambarmu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau data pribadimu ke server mana pun, sehingga 100% aman dari kebocoran data. Sensor wajah, pelat nomor, dan info sensitif secara aman dan privat di perangkatmu sendiri.",
      autoDetectHelp:
        "⚡ Deteksi wajah lokal. Paling pas untuk wajah yang tegak dan jelas. Kamu masih bisa mengaturnya secara manual.",
    },
    converter: {
      intro:
        "Konversi gambar di antara delapan format, termasuk favorit web seperti WebP, format desain seperti SVG dan TIFF, hingga kebutuhan khusus seperti ICO (favicon), semuanya di browser kamu. Seret banyak file sekaligus, pilih format tujuan, lalu konversi dalam satu klik. Tanpa unggah, tanpa daftar akun, tanpa watermark. Filemu tidak pernah keluar dari perangkat.",
      howItWorks: {
        step1:
          "Masukkan satu atau banyak gambar (lewat seret-lepas atau pemilih file).",
        step2:
          "Pilih format keluaran: JPG, PNG, WebP, ICO, SVG, TIFF, BMP, atau GIF.",
        step3: "Proses semuanya sekaligus secara instan di perangkatmu.",
        step4:
          "Simpan hasilnya satu per satu, atau unduh semua sekaligus sebagai ZIP.",
      },
      useCases: {
        case1:
          "Perkecil gambar biar websitemu dimuat lebih cepat tanpa mengurangi kualitas gambar.",
        case2: "Buat favicon untuk websitemu dengan format yang benar.",
        case4:
          "Ubah gambar biasa menjadi grafis vektor SVG yang skalanya bisa dibesarkan.",
        case5:
          "Ubah foto iPhone (HEIC) menjadi JPG yang kompatibel di semua perangkat.",
      },
      faq: {
        q1: "Format apa saja yang bisa dikonversi?",
        a1: "JPG, PNG, WebP, ICO, SVG, TIFF, BMP, dan GIF, serta input HEIC dari iPhone.",
        q2: "Apakah alat ini mengunggah fileku ke server?",
        a2: "Tidak. Konversi berjalan sepenuhnya di browser kamu. Filemu tidak pernah meninggalkan perangkat.",
        q3: "Bisa konversi banyak gambar sekaligus?",
        a3: "Bisa. Cukup seret beberapa file, konversi dalam sekali klik, lalu unduh semuanya dalam ZIP.",
        q4: "Bagaimana cara mengubah PNG menjadi favicon ICO?",
        a4: "Unggah file PNG kamu, pilih ICO sebagai format tujuan, lalu unduh. Favicon siap dipakai di website!",
        q5: "Bisa konversi foto HEIC dari iPhone?",
        a5: "Bisa. Masukkan file HEIC kamu dan konversi ke JPG atau PNG seketika.",
      },
      privacyNotice:
        "Alatify memproses file gambarmu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat pribadimu ke server luar, sehingga 100% aman dari kebocoran data. Konversi gambar antara format JPG, PNG, WebP, ICO, SVG, TIFF, BMP, dan GIF secara instan and privat di perangkatmu sendiri.",
      svgTooLarge:
        "Gambar terlalu besar untuk diubah ke SVG (maksimal 1000 × 1000). Kecilkan dulu pakai alat Resizer kami, atau pilih format PNG/WebP untuk foto.",
      alphaBackdropHelp:
        "Format tujuan pilihanmu tidak sepenuhnya menjamin transparansi asli. Isi piksel transparan dengan:",
      combinePdfPointer: "Butuh menggabungkan banyak gambar jadi satu PDF?",
      combinePdfPointerLink: "Pakai alat khusus PDF di sini →",
    },
    cropper: {
      intro:
        "Potong gambar ke rasio tetap atau atur bebas pakai pegangan sudut, lalu luruskan kemiringan dengan rotasi presisi. Semuanya terpantau lewat pratinjau real-time di browser kamu. Tanpa unggah, tanpa daftar akun. Fotomu tidak pernah meninggalkan perangkat.",
      howItWorks: {
        step1:
          "Letakkan gambarmu di sini. Gambarmu tetap tersimpan aman di perangkat.",
        step2:
          "Seret sudut-sudutnya untuk memotong bebas, atau pilih rasio tetap seperti 1:1 atau 16:9.",
        step3:
          "Putar gambarnya untuk merapikan sudut miring atau menyelaraskan objek.",
        step4: "Simpan gambar hasil potonganmu.",
      },
      useCases: {
        case1:
          "Potong gambar ke rasio pas yang biasa dipakai media sosial, seperti kotak 1:1, banner 16:9, atau ukuran story.",
        case2:
          "Posisikan foto wajahmu dengan pas untuk foto profil atau avatar.",
        case3:
          "Potong gambar secara fokus untuk thumbnail video atau artikel yang menarik perhatian.",
        case4:
          "Buang bagian pinggir yang mengganggu atau luruskan garis horizon yang miring.",
      },
      faq: {
        q1: "Bisa potong ke rasio tertentu?",
        a1: "Bisa. Pilih rasio populer seperti 1:1, 4:3, atau 16:9, atau seret pegangan sudut untuk memotong bebas sesukamu.",
        q2: "Apakah alat ini mengunggah fotoku ke server?",
        a2: "Tidak. Pemotongan berjalan sepenuhnya di browser kamu. Fotomu tidak pernah keluar dari perangkat.",
        q3: "Bisa meluruskan foto yang miring?",
        a3: "Bisa. Putar gambar untuk meratakan horizon yang miring atau menyelaraskan objek sebelum memotong.",
        q4: "Apakah pemotongan bakal menurunkan kualitas gambar?",
        a4: "Tidak. Proses potong ini tetap menjaga piksel asli di area yang kamu pilih pada kualitas penuh.",
        q5: "Dapatkah saya melakukan pemotongan bentuk bebas alih-alih rasio tetap?",
        a5: "Bisa. Cukup seret sudutnya ke ukuran dan posisi mana saja yang kamu mau.",
      },
      privacyNotice:
        "Alatify memproses file gambarmu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat pribadimu ke server luar, sehingga 100% aman dari kebocoran data. Potong dan putar gambar secara instan dan privat di perangkatmu sendiri.",
    },
    "exif-cleaner": {
      intro:
        "Tiap foto dari HP membawa metadata EXIF tersembunyi, seperti lokasi GPS, model kamera, tanggal, dan detail HP yang ikut terkirim saat kamu berbagi file. Alatify menunjukkan data ini dengan jelas lalu menyapunya hingga bersih langsung di browser kamu. Prosesnya aman tanpa unggah file dan berjalan secara lossless, sehingga cuma metadatanya yang hilang tanpa mengurangi kualitas fotomu.",
      howItWorks: {
        step1:
          "Seret fotomu ke sini atau pilih file. File tetap aman di perangkatmu.",
        step2:
          "Lihat semua metadata yang terbaca, lengkap dengan peringatan merah jika ada lokasi GPS.",
        step3:
          "Bersihkan metadata secara lossless, tanpa kompresi ulang, tanpa merusak kualitas.",
        step4:
          "Simpan hasil fotomu yang sudah bersih dari metadata, siap dibagikan dengan aman.",
      },
      useCases: {
        case1:
          "Foto yang diambil di rumah biasanya menyimpan lokasi GPS. Hapus dulu sebelum kamu posting ke Facebook Marketplace, eBay, atau Tokopedia biar alamat rumahmu tidak tersebar.",
        case2:
          "Foto liburan bisa membocorkan kalau kamu sedang tidak di rumah. Hapus lokasi dan stempel waktu sebelum kamu membagikannya.",
        case3:
          "Lokasi GPS yang detail bisa memandu orang asing langsung ke alamatmu. Bersihkan dulu fotomu sebelum diunggah ke publik.",
        case4:
          "Hapus metadata lokasi sebelum kamu mengirimkan karya ke klien atau memublikasikannya secara online.",
      },
      faq: {
        q1: "Bukankah Instagram atau Facebook sudah menghapus data EXIF?",
        a1: "Postingan publik di sebagian besar platform memang menghapusnya, tapi mereka tetap menyimpan data aslinya di server mereka. Selain itu, pengiriman langsung (lewat chat, email, cloud storage) tetap menyertakan metadatanya. Membersihkannya sendiri adalah satu-satunya cara paling aman.",
        q2: "Bagaimana cara menghapus lokasi GPS sebelum jualan online?",
        a2: "Unggah fotomu, cek peringatan GPS, bersihkan metadata, lalu unduh salinan bersihnya untuk diposting, bebas dari data lokasi.",
        q3: "Apakah menghapus metadata akan mengurangi kualitas foto saya?",
        a3: "Tidak. Alatify membersihkan metadata secara lossless dengan mengedit struktur biner file secara langsung. Piksel fotomu tidak dikompresi ulang, jadi kualitasnya tetap sama.",
        q4: "Bisa melihat data apa saja yang ada di fotoku sebelum dibersihkan?",
        a4: "Bisa. Sebelum mulai membersihkan, Alatify akan menampilkan semua metadata yang terbaca, seperti koordinat GPS, jenis kamera, tanggal, dan detail HP.",
        q5: "Apakah foto saya diunggah ke server?",
        a5: "Tidak. Proses deteksi dan pembersihan berjalan sepenuhnya di browser kamu. Fotomu tidak pernah meninggalkan perangkat.",
      },
      privacyNotice:
        "Alatify memproses file gambarmu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat pribadimu ke server luar, sehingga 100% aman dari kebocoran data. Hapus riwayat lokasi (GPS), penanda perangkat, riwayat software, dan waktu pengambilan gambar secara instan dan aman sebelum didistribusikan.",
      alreadyCleanNotice:
        "Gambar ini sudah bersih. Tidak ada tag EXIF, GPS, kamera, atau software yang terdeteksi.",
      coordinatesNotice: "Gambar ini mengungkap persis di mana foto diambil:",
    },
    "id-protector": {
      intro:
        "Setiap hari, jutaan foto kartu identitas (KTP, SIM, paspor) dibagikan online secara bebas, yang rawan disalahgunakan untuk penipuan atau pinjol. ID Privacy Shield membantu kamu menyensor detail sensitif memakai kotak hitam permanen dan memasang watermark ubin agar identitasmu tidak bisa disalahgunakan. Semuanya berjalan 100% lokal di browser kamu. Dokumenmu tidak pernah dikirim ke server, dan file hasil unduhan otomatis bersih dari metadata tersembunyi.",
      howItWorks: {
        step1:
          "Masukkan KTP, SIM, paspor, atau foto identitasmu. File ini tidak pernah meninggalkan browser kamu.",
        step2:
          "Gambar kotak sensor SOLID di atas info penting seperti nomor NIK/ID, tanda tangan, dan alamat.",
        step3:
          "Tambahkan watermark ubin diagonal yang bertuliskan tujuan dan tanggal biar tidak disalahgunakan pihak lain.",
        step4:
          "Unduh hasil PNG yang aman. Sensor menyatu dengan piksel gambar dan metadatanya dibuang bersih.",
      },
      useCases: {
        case1:
          "Amankan foto KTP, SIM, atau paspor sebelum dikirim untuk syarat rental. Tambahkan watermark nama agen rental dan tanggalnya biar tidak bisa dipakai ulang.",
        case2:
          "Sensor nomor penting dan tanda tangan sebelum mengirimkan kartu identitas ke platform kerja freelance atau portal verifikasi mitra.",
        case3:
          "Hindari mengirim foto kartu identitas mentah tanpa pelindung lewat WhatsApp atau email untuk booking hotel atau kontrak kerja.",
      },
      faq: {
        q1: "Apakah file ID saya diunggah ke server?",
        a1: "Tidak. ID Privacy Shield berjalan sepenuhnya di browser kamu. Semua pemrosesan, penyensoran, dan watermark diproses lokal lewat sandbox canvas API. Dokumen rahasiamu tidak pernah menyentuh server kami.",
        q2: "Apakah kotak sensor padat (solid) bisa dihapus kembali?",
        a2: "Tidak bisa. Saat kamu memakai sensor Solid, warnanya langsung menimpa piksel asli dan menyatu di file PNG hasil akhir. Sebagai catatan, efek Blur masih punya risiko dipulihkan dengan AI, jadi kami sangat menyarankan memakai kotak Solid untuk data yang sangat sensitif.",
        q3: "Apakah watermark ubin bisa dicrop?",
        a3: "Tidak bisa. Kalau kamu memilih opsi Tiled Pattern, watermark akan digambar berulang kali memenuhi seluruh halaman dokumen. Ini membuatnya mustahil dipotong tanpa merusak isi kartu identitas itu sendiri.",
        q4: "Bisa dipakai di HP?",
        a4: "Bisa. ID Privacy Shield sudah responsif dan mendukung kontrol sentuh di layar HP maupun tablet.",
        q5: "Apakah metadata dan data EXIF ikut dihapus?",
        a5: "Iya. Proses ekspor ulang ke PNG otomatis membuang semua metadata EXIF, koordinat GPS, jenis perangkat, dan riwayat file untuk menjaga privasi kamu secara maksimal.",
      },
      privacyNotice:
        "Alatify memproses file identitasmu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah dokumen atau koordinat pribadimu ke server luar, sehingga 100% aman dari kebocoran data. Sensor nomor identitas sensitif, pasang watermark ubin diagonal, dan bersihkan metadata EXIF GPS secara instan dan aman di perangkatmu sendiri sebelum dikirim.",
      uploadInstructions:
        "Seret & taruh KTP, SIM, paspor, atau foto identitasmu di sini, atau klik untuk memilih file.",
    },
    "qr-toolkit": {
      intro:
        "Buat QR code statis secara offline yang aktif selamanya tanpa jebakan batas waktu dari pihak ketiga. Kamu juga bisa memindai QR code misterius dengan aman langsung di browser kamu untuk memeriksa tujuan aslinya, membuang link pelacak, dan melihat URL sebelum membukanya.",
      howItWorks: {
        step1:
          "Pilih mode URL, Teks, atau Wi-Fi, lalu isi detailnya. QR code langsung jadi secara offline.",
        step2:
          "Atur ukuran, margin, warna kustom, dan tingkat koreksi sebelum mengunduh file PNG/SVG.",
        step3:
          "Arahkan kamera atau masukkan gambar QR code. Proses dekode dijalankan lokal di browser kamu.",
        step4:
          "Periksa domain tujuan, bersihkan parameter pelacak, dan lihat peringatan link pendek.",
      },
      faq: {
        q1: "Apa bedanya QR code bebas pelacak dengan QR code biasa?",
        a1: "Banyak pembuat QR code gratis memaksa kamu memakai link dinamis yang lewat server mereka dulu untuk melacak lokasi, perangkat, dan seberapa sering QR code dipindai. Alatify membuat QR code statis yang berisi teks asli secara langsung. Bebas pelacakan, tidak ada batas kedaluwarsa, sepenuhnya milik kamu.",
        q2: "Kenapa Safe Scanner membuang parameter pelacak di URL?",
        a2: "QR code sering disalahgunakan untuk pelacakan marketing atau penipuan (quishing). Saat memindai URL, kami akan mendeteksi parameter pelacak (seperti UTM dan client ID), membuangnya, dan memperlihatkan domain aslinya biar kamu tahu persis ke mana kamu akan diarahkan.",
        q3: "Apakah pemindai bisa otomatis membuka link pendek?",
        a3: "Tidak. Membuka redirect dari link pendek seperti bit.ly atau tinyurl mengharuskan browser mengirim request ke server mereka, yang otomatis membocorkan IP dan info perangkatmu. Biar tetap 100% privat, kami akan memberi peringatan di link pendek tersebut biar kamu bisa waspada.",
        q4: "Apakah rekaman kamera atau gambar QR code yang kuunggah dikirim ke server?",
        a4: "Sama sekali tidak. Semua proses pemindaian dan pembuatan berjalan lokal di perangkatmu memakai sandbox JS browser. Tidak ada pengiriman data ke server luar maupun analitik yang berjalan.",
      },
      privacyNotice:
        "Alatify memproses QR code kamu sepenuhnya secara lokal menggunakan API client sandbox di dalam tab browser kamu. Kami tidak pernah mengunggah URL, teks, rekaman kamera, atau gambar yang kamu masukkan. Alat ini 100% offline dan bebas pelacakan, menjaga data pemindaian dan hasil QR code tetap aman di perangkatmu.",
    },
    resizer: {
      intro:
        "Ubah ukuran gambar berdasarkan piksel, persentase, atau rasio aspek yang terkunci, semuanya langsung di browser kamu. Pencuplikan ulang berkualitas tinggi menjaga tepi gambar tetap tajam, dan kamu bisa memproses banyak gambar sekaligus. Tanpa unggah, tanpa daftar akun. Gambarmu tidak pernah keluar dari perangkat.",
      howItWorks: {
        step1: "Masukkan satu atau banyak gambar sekaligus.",
        step2:
          "Isi piksel lebar/tinggi, atur persentase skala, atau kunci rasio aspek gambar.",
        step3:
          "Ubah semua ukuran gambar sekaligus dengan teknologi resampling berkualitas tinggi.",
        step4:
          "Simpan hasilnya satu per satu atau unduh semua dalam format ZIP.",
      },
      useCases: {
        case1:
          "Mengubah ukuran gambar ke dimensi pas yang dibutuhkan platform media sosial, seperti postingan kotak, banner, story, atau foto profil.",
        case2:
          "Mengecilkan resolusi foto yang terlalu besar biar lebih cepat dimuat di website dan lolos batas unggahan.",
        case3:
          "Mengubah ukuran satu folder gambar ke dimensi yang sama sekaligus dalam sekali jalan.",
        case4:
          "Mendapatkan ukuran piksel yang pas dan presisi untuk kebutuhan tata letak web atau desain.",
      },
      faq: {
        q1: "Bisa mengubah ukuran ke dimensi piksel yang spesifik?",
        a1: "Bisa. Cukup masukkan lebar dan tinggi dalam piksel, atur persentase skala, atau kunci rasio aspek biar gambarnya tidak peyang.",
        q2: "Apakah alat ini mengunggah gambarku ke server?",
        a2: "Tidak. Proses resize berjalan sepenuhnya di browser kamu. Filemu tidak pernah meninggalkan perangkat.",
        q3: "Apakah gambarnya bakal penyok atau melar setelah diubah ukurannya?",
        a3: "Tidak akan, asalkan kamu tetap mengunci rasio aspeknya biar skalanya proporsional. Kamu juga bisa membukanya kalau mau bebas mengubah lebar dan tinggi secara terpisah.",
        q4: "Bisa mengubah banyak ukuran gambar sekaligus?",
        a4: "Bisa. Ubah ukuran semuanya sekaligus lalu unduh hasilnya sebagai ZIP.",
        q5: "Apakah proses resize ini bakal menurunkan kualitas gambar?",
        a5: "Alatify memakai metode resampling berkualitas tinggi untuk menjaga tepian gambar tetap tajam saat ukurannya diubah.",
      },
      privacyNotice:
        "Alatify memproses file gambarmu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat pribadimu ke server luar, sehingga 100% aman dari kebocoran data. Ubah ukuran gambar berdasarkan piksel, persentase, atau rasio aspek secara instan dan privat di perangkatmu sendiri.",
      cropBehaviorHelp:
        "Mengisi area ukuran baru sepenuhnya, memotong bagian tepi yang berlebih mulai dari tengah.",
      fitBehaviorHelp:
        "Memuat seluruh gambar di dalam batas ukuran baru, menyisakan area kosong di samping atau atas dengan warna solid atau transparan.",
    },
    steganography: {
      intro:
        "Amankan pesan rahasia kamu secara offline. Tanamkan pesan teks ke dalam gambar memakai metode Least Significant Bit (LSB), lengkap dengan opsi enkripsi AES-GCM menggunakan password. Hasil gambar akan terlihat sama persis tanpa ada perbedaan kasatmata. Semuanya berjalan langsung di sandbox browser kamu: bebas server, bebas bocor.",
      howItWorks: {
        step1:
          "Pilih gambar pembawa (carrier). Bagian transparan otomatis diratakan menjadi warna putih di memori.",
        step2:
          "Ketik pesan rahasiamu. Memasukkan password otomatis memicu enkripsi AES-GCM 256-bit sebelum pesan ditanamkan.",
        step3:
          "Bit biner dari data pesan akan menggantikan Least Significant Bits dari warna gambar RGB.",
        step4:
          "Ekspor hasilnya wajib dalam format PNG. Ini biar piksel pesan di dalamnya tidak rusak oleh kompresi.",
      },
      faq: {
        q1: "Apakah pesan rahasia di fotoku bakal tetap aman kalau dikirim lewat WhatsApp atau Instagram?",
        a1: "Tidak. Aplikasi chat dan media sosial otomatis mengonversi gambar menjadi JPEG/WebP yang lossy biar hemat kuota. Proses kompresi ini merusak susunan piksel LSB tempat pesan rahasia disimpan. Biar pesannya aman, bagikan file PNG tersebut sebagai Dokumen tanpa kompresi atau kirim lewat link unduh langsung.",
        q2: "Apakah steganografi LSB tidak bisa dideteksi oleh sistem komputer?",
        a2: "Tentu bisa. Steganografi LSB cuma membuat pesan tersembunyi tidak terlihat oleh mata manusia biasa. Namun, software pemindai stego (steganalisis) bisa mendeteksi perubahan statistik piksel gambar. Biar benar-benar aman, wajib gunakan password yang kuat.",
        q3: "Format pesan apa saja yang bisa ditanamkan?",
        a3: "Kamu bisa menanamkan teks biasa, catatan markdown, serial key, atau konfigurasi teks apa saja. Kami akan membatasi panjang pesan secara otomatis menyesuaikan kapasitas gambar pembawa yang kamu unggah.",
        q4: "Apakah gambar atau passwordku dikirim ke server?",
        a4: "Sama sekali tidak. Semua enkripsi (memakai Web Crypto API) dan pengeditan piksel LSB terjadi secara lokal di browser kamu. File dan passwordmu tidak pernah meninggalkan perangkat.",
      },
      privacyNotice:
        "Alatify memproses file gambarmu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file, pesan rahasia, atau passwordmu ke server luar. Proses penanaman LSB, pembuatan kunci PBKDF2, dan enkripsi AES-GCM berjalan sepenuhnya offline untuk mencegah kebocoran data.",
      passwordHelp:
        "Mengunci dengan password akan membuat kunci enkripsi 256-bit untuk melindungi pesanmu. Tanpa password yang benar, pesan yang diekstrak cuma berupa kode acak yang tidak bisa dibaca.",
    },
    upscaler: {
      intro:
        "Pertajam dan perbesar fotomu menggunakan kecerdasan buatan Real-ESRGAN yang berjalan langsung di browser kamu. Berjalan 100% di browser kamu, sehingga fotomu tidak pernah meninggalkan perangkat.",
      howItWorks: {
        step1:
          "Letakkan gambarmu di sini. Gambarmu tetap tersimpan aman di perangkat.",
        step2:
          "Pilih 2x untuk proses cepat, atau 4x untuk detail yang paling tajam.",
        step3:
          "AI lokal akan memproses gambar bagian demi bagian, didukung akselerasi GPU jika tersedia.",
        step4:
          "Simpan hasil foto PNG kamu yang sudah lebih tajam dan beresolusi tinggi.",
      },
      useCases: {
        case1:
          "Memperbesar foto lama atau buram tanpa merusak ketajaman atau detail aslinya.",
        case2:
          "Mempertajam dan menaikkan resolusi foto produk agar terlihat bersih untuk dipasang di e-commerce.",
        case3:
          "Menyiapkan gambar resolusi tinggi untuk kebutuhan cetak ukuran besar atau layar resolusi tinggi.",
        case4:
          "Memperbaiki detail yang pecah pada gambar yang terkompresi berat atau ukurannya terlalu kecil.",
        case5:
          "Meningkatkan resolusi hasil AI seperti Midjourney, DALL-E, atau Stable Diffusion untuk unduhan HD.",
        case6:
          "Memperjelas hasil screenshot atau grafis untuk slide presentasi agar teksnya terbaca tajam.",
      },
      faq: {
        q1: "Apakah gambarku diunggah ke server?",
        a1: "Tidak. Semua pemrosesan berjalan lokal di browser kamu. Gambarmu tidak pernah keluar dari perangkat.",
        q2: "Bagaimana cara kerja AI upscaler ini?",
        a2: "Alat ini memakai jaringan saraf Real-ESRGAN untuk merekonstruksi detail dan mempertajam tepi gambar, berjalan di GPU perangkatmu lewat WebGPU (atau CPU jika GPU tidak didukung).",
        q3: "Apa bedanya pilihan 2x dan 4x?",
        a3: "Pilihan 2x lebih cepat dan pas untuk pembesaran sedang. Pilihan 4x menghasilkan gambar yang jauh lebih besar dan tajam, tapi prosesnya memakan waktu lebih lama.",
        q4: "Apakah ini gratis?",
        a4: "Iya, sepenuhnya gratis, tanpa perlu daftar akun atau pendaftaran apa pun.",
        q5: "Format apa saja yang didukung?",
        a5: "JPG, PNG, dan WebP. Hasil unduhan akhir berupa file PNG berkualitas tinggi (lossless).",
        q6: "Kenapa pemakaian pertama agak lama?",
        a6: "Di awal pemakaian, browser perlu mengunduh file model AI (~33MB) sekali saja. Model ini otomatis disimpan di perangkatmu, jadi proses berikutnya bakal instan dan bahkan bisa dipakai offline.",
        q7: "Apakah ada batasan ukuran gambar?",
        a7: "Gambar yang sangat besar akan dikecilkan sedikit sebelum diproses biar prosesnya lancar dan stabil di HP atau perangkat spesifikasi menengah.",
        q8: "Bisa dipakai offline?",
        a8: "Bisa. Begitu model AI sudah tersimpan, browser kamu bisa menaikkan resolusi tanpa koneksi internet.",
      },
      privacyNotice:
        "Alatify menaikkan ukuran gambar sepenuhnya di dalam tab browser kamu menggunakan AI di perangkat dengan akselerasi GPU. Fotomu tidak pernah diunggah ke server, tidak pernah dipakai melatih model, dan tidak pernah dicatat, sehingga 100% aman dari kebocoran data. Dapatkan foto upscaled resolusi tinggi bebas watermark sepuasnya secara privat.",
      fasterOptionDesc: "Gandakan resolusi · lebih cepat",
      sharperOptionDesc: "Empat kali lipat resolusi · lebih lambat",
      gpuWarning:
        "Berjalan 100% di browser kamu. Fotomu tidak pernah keluar dari perangkat.",
      localWarning:
        "Pemrosesan berjalan lokal dan bisa memakan waktu untuk gambar besar atau perangkat spesifikasi rendah. Tetap buka tab ini, ya.",
    },
    watermark: {
      intro:
        "Lindungi dan beri identitas pada gambarmu memakai watermark teks atau logo, semuanya langsung di browser kamu. Seret watermark ke posisi mana saja, buat menyebar diagonal memenuhi gambar, putar, dan atur tingkat transparansinya sesukamu. Bisa proses satu foto atau banyak sekaligus. Tanpa unggah, tanpa daftar akun. Gambar dan logomu tidak pernah keluar dari perangkat.",
      howItWorks: {
        step1: "Masukkan satu atau banyak gambar sekaligus (maksimal 30 file).",
        step2:
          "Pilih watermark teks atau logo, lalu atur gayanya: ukuran, transparansi, warna, dan rotasi.",
        step3:
          "Pasang di pojok, ubin menyebar, atau seret bebas ke bagian mana saja yang kamu mau.",
        step4:
          "Simpan hasil gambarmu satu per satu atau unduh semua sekaligus sebagai ZIP.",
      },
      useCases: {
        case1:
          "Mencegah pencurian gambar dan pemakaian tanpa izin dengan watermark yang terlihat jelas.",
        case2:
          "Menempelkan logo atau username milikmu ke foto sebelum diposting atau dibagikan.",
        case3:
          "Memasang watermark yang sama ke banyak foto sekaligus dalam satu proses cepat.",
        case4:
          "Memasang watermark ubin diagonal biar gambarnya tidak bisa dicrop atau dipotong pihak lain.",
      },
      faq: {
        q1: "Apakah alat ini mengunggah gambarku atau logoku?",
        a1: "Tidak. Semua proses berjalan langsung di browser kamu. Gambar dan logomu tidak pernah meninggalkan perangkat.",
        q2: "Bisa memasang watermark ke banyak foto sekaligus?",
        a2: "Bisa. Masukkan sampai 30 gambar and unduh semuanya sebagai ZIP dengan watermark yang sama.",
        q3: "Bisa pakai logo sendiri?",
        a3: "Bisa. Unggah file logo PNG kamu (disarankan yang transparan), lalu atur ukuran dan tingkat transparansinya.",
        q4: "Apakah ukuran watermark bakal sama di foto yang ukurannya beda-beda?",
        a4: "Iya. Ukuran watermark dihitung proporsional mengikuti lebar masing-masing gambar, jadi ukurannya tetap pas baik di foto besar maupun kecil.",
        q5: "Bagaimana biar orang tidak bisa memotong watermark-nya?",
        a5: "Pakai mode ubin (tiled) biar watermark tergambar berulang secara diagonal memenuhi foto, sehingga sulit dihilangkan dengan cara dicrop.",
        q6: "Format hasil akhir apa saja yang didukung?",
        a6: "Kamu bisa mempertahankan format asli gambarmu, atau mengekspornya ke JPG, PNG, atau WebP.",
      },
      privacyNotice:
        "Alatify memproses file gambarmu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat pribadimu ke server luar, sehingga 100% aman dari kebocoran data. Pasang watermark dan amankan karyamu langsung di perangkatmu sendiri.",
      previewResolutionNotice:
        "Resolusi pratinjau dibatasi hingga 1200px. Watermark asli akan diterapkan pada resolusi penuh saat diekspor.",
    },
    "stock-finder": {
      intro:
        "Cari foto di Unsplash, Pexels, dan Pixabay sekaligus. Menariknya, Alatify juga bisa mencari ilustrasi dan vektor, beda dari pencari stok biasa yang cuma menampilkan foto. Temukan gambar yang pas, lalu langsung buka di alat Alatify untuk hapus background, kompres, atau konversi. Semuanya gratis, tanpa daftar akun.",
      howItWorks: {
        step1:
          "Ketik kata kunci untuk mencari gambar gratis di Unsplash, Pexels, dan Pixabay sekaligus.",
        step2:
          "Filter hasil pencarian berdasarkan tipe konten (foto, ilustrasi, atau vektor), sumber, dan orientasi.",
        step3: "Pilih gambar yang kamu butuhkan.",
        step4:
          "Buka gambar sekali klik di alat edit Alatify, atau unduh langsung ke perangkatmu.",
      },
      useCases: {
        case1:
          "Mencari foto berkualitas tinggi dan bebas royalti untuk kebutuhan blog, artikel, atau postingan media sosial.",
        case2:
          "Mendapatkan gambar ilustrasi atau vektor untuk bahan presentasi, desain, atau thumbnail, bukan sekadar foto biasa.",
        case3:
          "Mencari gambar ukuran lebar beresolusi tinggi untuk background website atau header.",
        case4:
          "Mengirim hasil pencarian langsung ke alat Alatify untuk dihapus background-nya, dikompres, atau dikonversi.",
      },
      faq: {
        q1: "Apakah gambarnya gratis untuk digunakan?",
        a1: "Iya, hasilnya diambil dari Unsplash, Pexels, dan Pixabay yang menyediakan gambar gratis. Beberapa gambar meminta atribusi ke fotografernya, yang kami tampilkan di samping gambar.",
        q2: "Bisa mencari ilustrasi dan vektor juga, bukan cuma foto?",
        a2: "Bisa. Kebanyakan pencari stok cuma menampilkan foto, tapi Alatify juga memunculkan ilustrasi dan vektor biar kamu bisa memfilter jenis konten sesukamu.",
        q3: "Bisa langsung mengedit gambar setelah menemukannya?",
        a3: "Tentu saja. Kamu bisa membuka hasil pencarian dengan sekali klik di alat browser Alatify untuk menghapus background-nya, mengompres, konversi format, dan lainnya.",
        q4: "Apakah harus daftar akun?",
        a4: "Tidak perlu. Cari dan edit sepuasnya tanpa perlu mendaftar.",
        q5: "Dari mana gambar-gambar ini diambil?",
        a5: "Dari tiga pustaka stok gratis terbesar di internet: Unsplash, Pexels, dan Pixabay.",
      },
    },
    "html-to-markdown": {
      intro:
        "Ubah kode HTML atau file .html menjadi format Markdown yang bersih dan mudah dibaca langsung di browser kamu. Cukup tempel kodenya atau unggah file, lalu salin atau unduh hasilnya. Bebas server, tanpa akun, dan datamu tidak pernah keluar dari perangkat.",
      howItWorks: {
        step1: "Tempel kode HTML atau unggah file .html dari perangkatmu.",
        step2:
          "Alat ini mengurai kode HTML secara lokal memakai library Turndown di dalam sandbox browser.",
        step3:
          "Format judul, daftar, link, teks tebal/miring, kutipan, dan blok kode otomatis diubah ke Markdown.",
        step4:
          "Salin hasil Markdown ke clipboard atau unduh sebagai file .md secara instan.",
      },
      useCases: {
        subtitle:
          "Mengubah halaman web, hasil ekspor, atau potongan kode HTML menjadi draf Markdown yang siap diedit.",
        case1:
          "Migrasi postingan blog, landing page, atau hasil ekspor CMS menjadi Markdown untuk static site generator.",
        case2:
          "Mengubah halaman wiki internal, dokumentasi produk, atau artikel bantuan berbasis HTML menjadi file .md.",
        case3:
          "Mengarsipkan newsletter atau email HTML secara lokal dan merapikannya menjadi teks Markdown yang bersih.",
        case4:
          "Mengubah file halaman web yang disimpan menjadi catatan Markdown untuk Obsidian, Notion, atau GitHub.",
      },
      faq: {
        q1: "Apakah HTML-ku diunggah ke server?",
        a1: "Tidak. Semua proses penguraian dan konversi berjalan lokal di browser kamu. Kode HTML-mu tidak pernah dikirim ke server luar mana pun.",
        q2: "Elemen HTML apa saja yang didukung?",
        a2: "Elemen standar seperti judul, paragraf, teks tebal/miring, link, daftar, blockquote, garis pembatas, dan blok kode didukung penuh. Desain halaman yang rumit akan disederhanakan menjadi Markdown linear.",
        q3: "Bisa mengunggah file halaman web utuh?",
        a3: "Bisa. Cukup unggah file .html atau .htm milikmu. Alat ini membaca kodenya secara lokal dan langsung mengubahnya menjadi Markdown.",
        q4: "Apakah tabel HTML otomatis diubah ke format tabel Markdown?",
        a4: "Library Turndown standar tidak menyertakan plugin tabel GFM. Tabel HTML memakai setelan bawaan Turndown yang tidak otomatis diubah ke sintaks tabel Markdown. Tabel yang rumit atau bertingkat mungkin diubah menjadi teks biasa. Cek kembali hasilnya kalau struktur tabel penting bagi kamu.",
        q5: "Apakah harus membayar atau daftar akun?",
        a5: "Tidak perlu. Seperti semua alat di Alatify, konverter ini 100% gratis, tanpa batas pemakaian, dan tanpa registrasi.",
      },
      privacyNotice:
        "Alatify memproses file HTML kamu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah kode atau konten pribadimu ke server luar, sehingga 100% aman dari kebocoran data. Konversi HTML ke Markdown secara aman langsung di perangkatmu sendiri.",
      placeholder:
        "Tempel kode HTML atau unggah file .html untuk melihat hasil Markdown di sini.",
      downloadMd: "Unduh .md",
    },
    "code-to-image": {
      intro:
        "Ubah kodenmu menjadi gambar cantik yang siap dibagikan ke Twitter, blog, atau dokumentasi. Lengkap dengan tema developer dan font Geist Mono yang tajam. Atur gaya cuplikan kode, ekspor sebagai PNG/SVG, atau teruskan ke alat edit gambar lainnya.",
      howItWorks: {
        step1:
          "Tempel kode sumber kamu ke editor, atau klik contoh kode yang tersedia untuk mencoba.",
        step2:
          "Shiki menyorot bahasamu secara lokal lewat deteksi otomatis atau pilihan manual dari dropdown.",
        step3:
          "Pilih tema: Geist Monokrom, Dark, atau Light, lalu atur padding dan tampilan frame window.",
        step4:
          "Unduh PNG/SVG, salin gambar ke clipboard, atau kirim ke compressor, resizer, converter, atau watermark.",
      },
      useCases: {
        subtitle:
          "Membuat gambar cuplikan kode yang cantik untuk postingan media sosial, dokumentasi, dan presentasi.",
        case1:
          "Membagikan kode dengan highlight cantik di Twitter developer, Mastodon, atau LinkedIn tanpa screenshot yang buram.",
        case2:
          "Menambahkan blok kode yang rapi ke postingan blog, file README, dan dokumentasi teknis.",
        case3:
          "Membuat visual slide presentasi atau gambar panduan dengan font monospace yang konsisten.",
        case4:
          "Membuat gambar kode lalu mengirimkannya ke compressor atau converter biar file-nya lebih ringan.",
      },
      faq: {
        q1: "Pilihan tema apa saja yang ada?",
        a1: "Ada tiga tema: Geist Monokrom (gaya monokrom khas dengan Geist Mono), Dark (gaya GitHub Dark), dan Light Minimal (GitHub Light). Frame window dengan tombol traffic-light macOS bisa diaktifkan di semua tema.",
        q2: "Bahasa pemrograman apa saja yang didukung?",
        a2: "JavaScript, TypeScript, JSX/TSX, Python, HTML, CSS, JSON, Bash, Go, Rust, SQL, Markdown, dan teks biasa. Deteksi otomatis akan memilih yang paling pas, tapi kamu tetap bisa memilihnya manual dari dropdown.",
        q3: "Format gambar apa saja yang didukung untuk ekspor?",
        a3: "Kamu bisa ekspor ke PNG (utama, bisa di-chain ke alat lain), SVG (vektor), atau salin PNG langsung ke clipboard. Format PNG dipakai kalau kamu mau meneruskan gambar ke alat Alatify lainnya.",
        q4: "Bisa menyalin gambar langsung ke clipboard?",
        a4: "Bisa. Klik Copy Image untuk menempel PNG ke Slack, Discord, atau aplikasi lain. Beberapa browser mungkin memblokir fitur ini, nanti bakal muncul notifikasi toast kalau gagal.",
        q5: "Apakah alat ini gratis?",
        a5: "Iya. Seperti semua alat Alatify, Code to Image gratis sepuasnya tanpa perlu akun, tanpa batasan, dan hasil ekspor bersih tanpa watermark.",
      },
      privacyNotice:
        "Proses highlight dan ekspor gambar berjalan lokal di tab browser kamu memakai Shiki dan library modern-screenshot.",
    },
    "markdown-to-pdf": {
      intro:
        "Konversi file Markdown atau teks biasa menjadi dokumen PDF dengan tata letak rapi, semuanya diproses lokal di perangkatmu. Tanpa unggah server, tanpa konfigurasi ribet, dan tanpa perlu mendaftar. Catatan dan dokumen rahasiamu tidak pernah keluar dari perangkat.",
      howItWorks: {
        step1:
          "Tempel teks Markdown kamu ke editor, atau unggah file .md lokal.",
        step2:
          "Lihat pratinjau hasil render secara langsung di panel samping dengan format otomatis.",
        step3:
          "Buat PDF langsung di browser memakai render vektor biar teksnya tajam dan bisa diseleksi.",
        step4: "Unduh dokumen PDF hasil akhir seketika. Sepenuhnya privat.",
      },
      useCases: {
        case1:
          "Menyimpan panduan proyek, file readme markdown, atau catatan penting menjadi file PDF yang rapi.",
        case2:
          "Membuat handout, ringkasan, atau panduan belajar yang mudah dibaca dari file teks biasa.",
        case3:
          "Mencetak laporan, log kerja, atau catatan harian secara offline tanpa bergantung pada koneksi internet atau server.",
        case4:
          "Menyusun catatan harian pribadi atau panduan tim secara privat tanpa risiko bocor ke internet.",
      },
      faq: {
        q1: "Apakah dokumenku diunggah ke server?",
        a1: "Tidak. Semuanya berjalan lokal di sandbox browser kamu. Markdown diurai dan PDF dibuat memakai JavaScript sisi klien, menjamin keamanan offline 100%.",
        q2: "Apakah teks di dalam PDF hasil akhir bisa diseleksi dan dicopy?",
        a2: "Iya. Beda dengan alat lain yang merender halaman sebagai gambar buram, Alatify menghasilkan PDF vektor asli. Teks di dalamnya tetap tajam, bisa dicopy, dan bisa dicari.",
        q3: "Bisa memasukkan gambar ke dalam dokumen?",
        a3: "Gambar berformat Data URL (base64) yang disematkan dalam markdown didukung penuh. Untuk gambar dari internet, browser akan memuatnya langsung. Kalau gagal karena masalah CORS, PDF akan tetap dibuat dengan melewati gambar tersebut.",
        q4: "Fitur markdown apa saja yang didukung?",
        a4: "Judul, paragraf, teks tebal/miring/coret, daftar bullet/angka/task list, blockquote, tabel, blok kode, dan garis pembatas didukung penuh.",
        q5: "Apakah harus membayar atau daftar akun?",
        a5: "Tidak. Seperti semua alat di Alatify, konverter ini gratis, tanpa batas pemakaian, dan tanpa pendaftaran.",
      },
      privacyNotice:
        "Alatify memproses dokumen kamu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau konten pribadimu ke server luar, sehingga 100% aman dari kebocoran data. Konversi Markdown ke PDF langsung di perangkatmu sendiri.",
      downloadMd: "",
    },
    "pdf-to-markdown": {
      intro:
        "Ekstrak teks dari file PDF dan ubah menjadi format Markdown yang rapi, semuanya berjalan langsung di browser kamu. Filemu tidak pernah meninggalkan perangkat.",
      howItWorks: {
        step1:
          "Pilih atau seret file PDF biasa yang memiliki lapisan teks (bisa diseleksi).",
        step2:
          "Klik Convert to Markdown untuk menganalisis teks, baris, dan tata letak secara offline.",
        step3:
          "Sistem otomatis menghitung ukuran font untuk memetakan level judul (heading) dan daftar.",
        step4:
          "Lihat hasil Markdown, lalu copy kodenya atau unduh sebagai file .md.",
      },
      useCases: {
        subtitle:
          "Mengubah jurnal, dokumen, dan transkrip menjadi format markup yang bersih dan siap diedit.",
        case1:
          "Mengambil teks dari publikasi ilmiah atau jurnal untuk catatan di aplikasi seperti Obsidian.",
        case2:
          "Mengubah panduan teks-tebal, ebook, atau laporan berlisensi terbuka menjadi Markdown untuk diedit kembali.",
        case3:
          "Memproses invoice, kontrak, atau berkas rahasia secara lokal tanpa mengirim teks ke server pihak ketiga.",
        case4:
          "Mengubah panduan belajar atau outline dokumen menjadi format catatan wiki yang rapi.",
      },
      faq: {
        q1: "Apakah dokumenku diunggah ke server?",
        a1: "Tidak. Semua proses pembacaan file, parsing, dan ekstraksi teks berjalan 100% di browser kamu. Tidak ada yang diunggah ke server backend mana pun.",
        q2: "Bisa mengekstrak teks dari PDF hasil scan atau gambar?",
        a2: "Tidak bisa. PDF hasil scan sebenarnya cuma gambar yang dibungkus PDF dan tidak punya data teks asli di dalamnya. Karena Alatify bekerja 100% offline, fitur OCR tidak tersedia. Peringatan akan muncul kalau sistem mendeteksi file hasil scan.",
        q3: "Bagaimana cara sistem mendeteksi judul dan daftar?",
        a3: "Sistem memindai tinggi karakter teks untuk mencari ukuran font utama. Baris yang lebih besar akan dikelompokkan menjadi H1, H2, atau H3. Daftar dideteksi lewat pola penanda seperti nomor atau poin.",
        q4: "Apa saja batasan dari alat ini?",
        a4: "Alat ini cuma mengekstrak teks dan struktur tata letak dasar. PDF tidak punya definisi kolom atau grid asli, jadi tabel akan dibaca sebagai baris mendatar, dan teks di halaman multi-kolom mungkin urutannya agak melompat.",
      },
      privacyNotice:
        "Semua ekstraksi teks PDF dan penyusunan dokumen berjalan lokal di dalam sandbox browser kamu. Filemu tidak pernah dikirim ke server luar atau cloud lain untuk menjaga kerahasiaan penuh.",
      placeholder:
        'Unggah dokumen dan klik "Convert to Markdown" untuk melihat hasilnya di sini.',
      warningScanned:
        "Kami mendeteksi sedikit sekali teks di dokumen ini. Kemungkinan besar ini adalah PDF hasil scan atau gambar tanpa data teks. OCR offline tidak didukung.",
      toastSuccess:
        "PDF berhasil dikonversi ke Markdown!",
      toastPartial:
        "Berhasil dikonversi ke Markdown. {skipped} dari {total} halaman punya sedikit atau tanpa teks untuk diambil (kemungkinan hasil scan, tanpa OCR).",
      toastNoText:
        "Tidak ada teks yang bisa diambil. PDF ini tampaknya hasil scan atau berbasis gambar, sementara tool ini hanya mengekstrak teks (tanpa OCR).",
      toastError:
        "Terjadi masalah saat membaca PDF.",
      scannedTitle:
        "Tidak ada teks yang bisa diambil",
      partialTitle:
        "Sebagian halaman tanpa teks",
      warningPartial:
        "{skipped} dari {total} halaman punya sedikit atau tanpa teks. Halaman itu kemungkinan hasil scan atau berbasis gambar dan tidak menghasilkan output (tanpa OCR offline).",
      limitations: {
        tables:
          "PDF tidak punya struktur tabel asli. Koordinat grid datar dan hasilnya akan berupa baris mendatar biasa.",
        columns:
          "Urutan pembacaan teks berjalan lurus, sehingga teks di kolom ganda mungkin urutannya bertumpuk.",
        scanned:
          "Tidak dilakukan OCR offline. Halaman hasil scan akan memicu banner peringatan.",
      },
    },
    "pdf-pages": {
      intro:
        "Masukkan satu atau banyak PDF, atur ulang urutan halamannya lewat seret-lepas, putar, atau buang halaman tertentu, lalu ekspor PDF baru, semuanya di browser kamu. Memasukkan banyak file otomatis menggabungkannya sesuai urutan. Tanpa unggah, tanpa akun, tanpa data keluar dari perangkatmu.",
      howItWorks: {
        step1:
          "Masukkan satu atau banyak file PDF. Halaman dari tiap file otomatis muncul dalam satu daftar berurutan.",
        step2:
          "Seret baris untuk mengatur urutan halaman, putar halaman tertentu 90°, hapus yang tidak perlu, atau centang halaman untuk dipisah.",
        step3:
          "Klik Merge & Export All Pages untuk seluruh set halaman, atau Export selected pages untuk hanya mengekspor halaman yang kamu centang.",
        step4:
          "Library pdf-lib menyalin objek halaman asli langsung ke file PDF baru tanpa rasterisasi, menjaga kualitas teks tetap tajam.",
      },
      useCases: {
        subtitle:
          "Gabung, pisah, dan rapikan PDF tanpa software desktop atau unggah cloud.",
        case1:
          "Menggabungkan invoice, kontrak, atau halaman hasil scan dari beberapa file terpisah menjadi satu dokumen yang rapi.",
        case2:
          "Memilih beberapa halaman penting saja dari file PDF besar dan mengekspornya menjadi file PDF baru yang lebih ringan.",
        case3:
          "Mengatur ulang urutan halaman yang terbalik akibat salah scan atau salah ekspor tanpa harus scan ulang.",
        case4:
          "Memutar posisi halaman landscape atau miring menjadi tegak sebelum diekspor sebagai PDF akhir.",
      },
      faq: {
        q1: "Apakah PDF saya diunggah ke server?",
        a1: "Tidak. Semua pemuatan, pengeditan, dan ekspor dilakukan secara lokal di browser kamu. File kamu tidak pernah meninggalkan perangkat.",
        q2: "Bagaimana cara menggabungkan dua file PDF?",
        a2: "Masukkan file pertama, klik Add more files untuk memasukkan file kedua. Halamannya otomatis tergabung dalam satu daftar. Klik Merge & Export All Pages untuk menyimpannya.",
        q3: "Bagaimana cara memisahkan atau mengambil halaman tertentu?",
        a3: "Centang halaman yang kamu mau di daftar barisnya, lalu klik Export selected pages. Cuma halaman terpilih yang bakal diunduh.",
        q4: "Apakah hasil ekspor bakal menurunkan kualitas file?",
        a4: "Tidak. pdf-lib menyalin objek halaman asli langsung ke file PDF baru tanpa merender ulang, jadi kualitasnya tetap 100% sama.",
        q5: "Bisa memakai PDF yang diproteksi password?",
        a5: "PDF terenkripsi atau dilindungi kata sandi tidak dapat dibuka di browser tanpa kata sandi. Hapus dulu password-nya pakai software desktop, baru masukkan ke sini.",
      },
      privacyNotice:
        "Setiap PDF yang kamu masukkan dibaca dan diproses lokal memakai library pdf-lib di browser kamu. File tidak pernah menyentuh server kami atau pihak ketiga. Begitu tab browser ditutup, dokumen otomatis terhapus dari memori.",
      exportAllExplanation:
        "Ekspor semua halaman sebagai satu PDF, sesuai urutan yang ditampilkan di atas.",
      exportSelectedPlaceholder: "Pilih halaman terlebih dahulu.",
      exportSelectedExplanation: "Hanya halaman yang dicek yang diekspor.",
    },
    "pdf-to-image": {
      intro:
        "Ubah halaman PDF menjadi file gambar JPG atau PNG berkualitas tinggi langsung di browser kamu. Pilih halaman atau rentang tertentu, atur skala resolusi, lalu unduh halaman per halaman atau unduh sekaligus sebagai file ZIP. Tanpa unggah, tanpa daftar akun, 100% privat.",
      howItWorks: {
        step1:
          "Masukkan file PDF kamu lewat seret-lepas atau tombol pilih file.",
        step2:
          "Pilih format PNG (disarankan jika butuh transparansi) atau JPG (background putih otomatis) dan atur skala render.",
        step3:
          "Pilih semua halaman atau tentukan halaman mana saja yang mau kamu ubah jadi gambar.",
        step4:
          "Klik Konversi dan unduh gambarmu atau unduh sekaligus dalam arsip ZIP.",
      },
      useCases: {
        case1:
          "Mengubah slide presentasi atau halaman dokumen PDF menjadi gambar untuk dipajang di web atau media sosial.",
        case2:
          "Mengambil foto, struk belanja, atau bagan penting dari file PDF sebagai file gambar terpisah yang bersih.",
        case3:
          "Mengubah dokumen teks menjadi gambar agar bisa langsung dilihat tanpa butuh PDF reader.",
        case4:
          "Mengonversi file laporan keuangan sensitif secara lokal di perangkatmu tanpa lewat server pihak ketiga.",
      },
      faq: {
        q1: "Apakah PDF-ku diunggah ke server untuk dikonversi?",
        a1: "Tidak. Semuanya berjalan lokal di sandbox browser kamu. Halaman PDF dirender ke elemen canvas lokal, menjaga filemu tetap aman.",
        q2: "Format gambar apa saja yang didukung?",
        a2: "Kamu bisa mengekspor halaman ke PNG (terbaik untuk grafis tanpa pecah) atau JPEG (format terkompresi dengan background putih otomatis).",
        q3: "Apa fungsi pengaturan skala render?",
        a3: "Ini mengontrol resolusi gambar keluaran. Skala 1x mencocokkan dimensi halaman default PDF, sedangkan 2x dan 3x mengalikan piksel untuk teks dan grafis yang lebih tajam dan berkualitas cetak.",
        q4: "Dapatkah saya mengonversi sebagian halaman saja?",
        a4: "Ya. Kamu bisa memilih semua halaman, memilih halaman tertentu dari daftar pratinjau, atau mengetik rentang halaman (contoh: 1-3, 5).",
        q5: "Apakah alat ini mendukung PDF yang diproteksi password?",
        a5: "PDF yang dilindungi atau dienkripsi tidak dapat dirender di browser. Kamu harus menghapus perlindungan kata sandi terlebih dahulu sebelum mengunggah.",
      },
      privacyNotice:
        "Alatify memproses file PDF kamu sepenuhnya secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau data pribadimu ke server luar, sehingga 100% aman dari kebocoran data.",
      scaleStandard: "1x (Standar)",
      scaleHigh: "2x (Tinggi)",
      scaleMaximum: "3x (Maksimum)",
      scaleHelper:
        "Skala lebih tinggi = gambar lebih tajam, tapi ukuran file jadi lebih besar dan prosesnya lebih lambat.",
    },
    "image-to-pdf": {
      intro:
        "Gabungkan banyak gambar JPG, PNG, atau WebP menjadi satu dokumen PDF yang terorganisir dengan rapi. Atur urutan halamannya lewat seret-lepas atau tombol Naik/Turun, sesuaikan ukuran kertas, margin, dan orientasi halaman, semuanya dihitung lokal di perangkatmu.",
      howItWorks: {
        step1:
          "Masukkan satu atau banyak gambar (seret-lepas atau pilih file sekaligus).",
        step2:
          "Atur urutan halaman dengan menyeret thumbnail gambar atau pakai tombol Naik/Turun.",
        step3:
          "Atur setelan halaman: ukuran kertas (A4, Letter, atau ikuti ukuran asli gambar), orientasi, dan margin.",
        step4: "Ekspor dan unduh file PDF hasil kompilasimu seketika.",
      },
      useCases: {
        case1:
          "Menggabungkan foto dokumen, struk belanja, atau sketsa hasil scan menjadi satu file PDF untuk syarat pengiriman atau arsip.",
        case2:
          "Menyusun portofolio digital, album foto, atau slide presentasi dari file desain terpisah.",
        case3:
          "Mengubah urutan foto menjadi dokumen PDF multi-halaman agar mudah dibaca berurutan.",
        case4:
          "Menyusun dokumen penting, kontrak kerja, atau kartu identitas secara lokal dan privat tanpa risiko bocor ke internet.",
      },
      faq: {
        q1: "Apakah gambar saya diunggah ke server?",
        a1: "Tidak. Pembuatan PDF dilakukan sepenuhnya di browser kamu menggunakan jsPDF. Filemu tidak pernah meninggalkan perangkat.",
        q2: "Bisa mengatur urutan halaman PDF?",
        a2: "Bisa. Kamu bisa menyeret thumbnail gambar atau menggunakan tombol Naik dan Turun (didesain agar stabil dan mudah di layar HP).",
        q3: "Pilihan ukuran halaman kertas apa saja yang didukung?",
        a3: "Kamu bisa memilih 'Sesuaikan Halaman dengan Gambar' agar ukuran PDF mengikuti dimensi asli fotomu, atau pilih ukuran standar seperti A4 dan Letter dengan gambar yang otomatis diskalakan pas.",
        q4: "Apakah gambarnya bakal dikompres saat digabungkan?",
        a4: "Alat ini menyematkan gambar apa adanya ke PDF. Untuk ukuran file PDF yang paling ringan, kamu disarankan mengecilkan gambarnya terlebih dahulu memakai alat Image Compressor kami sebelum digabungkan.",
        q5: "Berapa batas maksimal gambar yang bisa digabungkan?",
        a5: "Sama sekali tidak ada batasan jumlah, tapi menggabungkan puluhan foto resolusi tinggi sekaligus bakal memakan memori perangkat. Alat ini bekerja lancar untuk set standar.",
      },
      privacyNotice:
        "Alatify menggabungkan gambarmu ke dalam PDF secara lokal menggunakan sandbox API di dalam tab browser kamu. Kami tidak pernah mengunggah file atau koordinat pribadimu ke server luar, sehingga 100% aman dari kebocoran data.",
    },
    status: {
      available: "Tersedia",
    },
  },
  toolsPage: {
    intro:
      "Koleksi pilihan alat gambar yang mengutamakan privasi dan berjalan sepenuhnya di browser kamu. Tanpa unggah, tanpa daftar akun, sepenuhnya privat. Mulai dari Background Remover dan Image Compressor hingga konversi format, pengubahan ukuran, dan lainnya, setiap alat memproses gambar kamu langsung di perangkat.",
    backToHome: "Kembali ke beranda",
    title: "Tools",
    scrollExplore: "Gulir untuk menjelajah",
    stockFinder: {
      badge: "Belum punya gambar?",
      description:
        "Mulai dari nol. Cari foto stok gratis lalu edit langsung dalam satu klik.",
      button: "Cari Foto Stok",
    },
    section: {
      title: "Tools kami",
      subtitle:
        "Setiap alat berjalan 100% di browser kamu, jadi tidak ada data yang keluar dari perangkatmu.",
    },
  },
  "tools-image": {
    intro:
      "Temukan berbagai alat edit, optimasi, dan konversi gambar yang mengutamakan privasi kamu. Semuanya berjalan aman di dalam sandbox browser kamu.",
    nav: "Gambar",
  },
  "tools-document": {
    intro:
      "Akses berbagai alat berbasis browser yang aman untuk menyusun halaman PDF, konversi Markdown, dan ekstraksi teks.",
    nav: "Dokumen",
  },
  "tools-all": {
    nav: "Semua",
  },
  header: {
    tools: "Tools",
    support: "Dukung Kami",
    backToTools: "Kembali ke Tools",
    menu: "Menu",
    menuTitle: "Tools",
    browseAll: "Lihat semua tools",
  },
  footer: {
    tagline:
      "Alat gambar yang mengutamakan privasi, berjalan sepenuhnya di browser kamu. Tanpa unggah ke server, privasimu benar-benar terjaga.",
    builtWithCare: "© 2026 Alatify. Dibuat dengan sepenuh hati.",
    product: "Produk",
    allTools: "Semua Tools",
    embedWidgets: "Embed Widget",
    privacyPolicy: "Kebijakan Privasi",
    termsOfService: "Ketentuan Layanan",
    about: "Tentang",
    supportUs: "Dukung Kami",
    sourceCode: "Source Code",
    connect: "Ikuti Kami",
    madeIn: "Dibuat di Indonesia 🇮🇩",
  },
  backToTop: {
    label: "Kembali ke atas",
  },
  download: {
    success: "File berhasil diunduh",
    error: "Ada yang salah. Silakan coba lagi",
    label: "Unduh",
    filenameLabel: "Nama file output",
    filenamePlaceholder: "nama file",
    filenameHeader: "Nama File",
  },
  embed: {
    attribution: {
      private: "100% privat, berjalan di browser kamu",
      poweredBy: "Didukung oleh",
    },
    brandHeader: {
      back: "Kembali",
    },
    helpBubble: {
      openFull: "Baru di sini? Buka alat lengkapnya",
    },
    generator: {
      "toastCopied": "Tersalin ke clipboard!",
      "toastCopiedDesc": "Snippet embed siap kamu paste ke website kamu.",
      "toastCopyFailed": "Gagal menyalin snippet kode.",
      "backHome": "Kembali ke beranda",
      "badge": "Kode Embed buat Developer",
      "title": "Embed Tools Alatify",
      "intro": "Distribusikan widget privacy-first, 100% client-side kami ke blog, app, atau website kamu sendiri. Semuanya jalan sepenuhnya di dalam browser pengguna, tanpa perlu bandwidth server atau sign-up.",
      "selectLabel": "Pilih Tool yang Mau Di-embed",
      "selectPlaceholder": "Pilih tool",
      "snippetLabel": "Snippet Embed HTML",
      "copied": "Tersalin!",
      "copyCode": "Salin Kode",
      "featuresTitle": "Cara Kerja & Fitur",
      "feature1Title": "Nol Beban Server",
      "feature1Desc": "Widget-nya menjalankan model AI dan utilitas sepenuhnya client-side di browser pengguna. Pakai akselerasi WebGPU kalau tersedia, dan otomatis fallback ke CPU dengan mulus.",
      "feature2Title": "Integrasi Privacy-First",
      "feature2Desc": "File nggak pernah menyentuh server kami maupun server kamu. Seluruh operasinya bisa di-sandbox, artinya privasi mutlak buat pengguna situs kamu.",
      "previewTitle": "Preview Interaktif Langsung",
      "openFull": "Buka preview penuh ↗",
      "previewToolTitle": "Preview {name}",
      "previewPrompt": "Klik di bawah buat memuat preview widget-nya. Ini mencegah widget dimuat sebelum kamu siap mengetesnya.",
      "loadPreview": "Muat Preview Langsung"
    }
  },
  imagePreview: {
    alt: "Pratinjau",
    replace: "Ganti",
    remove: "Hapus",
  },
  imageUploader: {
    error: {
      failedRead: "Gagal membaca file gambar.",
      unsupportedType:
        "Tipe file tidak didukung. Silakan unggah PNG, JPG, WebP, GIF, AVIF, BMP, HEIC, TIFF, atau SVG.",
      tooLarge: "File terlalu besar. Ukuran maksimal 50MB.",
      invalidSelection: "File yang dipilih tidak valid.",
    },
    reading: "Membaca file gambar...",
    dropImages: "Taruh gambar di sini",
    dropImage: "Taruh gambar di sini",
    unsupportedTypeTitle: "Tipe file tidak didukung",
    dragAndDropMultiple:
      "Seret dan taruh gambar di sini, atau klik untuk memilih",
    dragAndDropSingle:
      "Seret dan taruh gambar di sini, atau klik untuk memilih",
    checkFile: "Cek lagi format atau ukuran filenya",
    specsMultiple: "Maks 50MB per file · JPG, PNG, WebP, HEIC, TIFF, SVG",
    specsSingle: "Maks 50MB · JPG, PNG, WebP, HEIC, TIFF, SVG",
  },
  requiresInternet: {
    toast: {
      restored: "Koneksi kembali! Sekarang kamu bisa pakai alat ini.",
      stillOffline: "Masih offline. Coba cek koneksi internet kamu.",
    },
    title: "Butuh Koneksi Internet",
    desc: "Alat {toolName} butuh koneksi internet aktif untuk mengunduh model AI atau mengambil data dari luar.",
    checking: "Mengecek...",
    checkButton: "Cek Koneksi",
  },
  languageToggle: {
    ariaLabel: "Ganti bahasa",
  },
  themeToggle: {
    ariaLabel: "Ganti tema",
  },
  imageSourceInput: {
    toast: {
      gifWarning: "GIF animasi akan diproses sebagai satu frame saja.",
    },
    error: {
      emptyUrl: "Masukkan URL dulu",
      failedFetch: "Gagal mengambil gambar",
    },
    uploadFile: "Unggah File",
    replaceFile: "Ganti file",
    pasteUrl: "Tempel URL",
    placeholder: "Tempel URL gambar atau halaman web apa pun",
    fetching: "Mengambil...",
    fetchImage: "Ambil Gambar",
    privacyNote: {
      title: "🛡 Catatan Privasi",
      text: "Kami yang mengambil URL-nya untuk kamu. Kalau kamu menempel URL halaman web, kami otomatis cari gambar utamanya di halaman itu. Setelah itu semua proses terjadi sepenuhnya di browser kamu. Ukuran file gambar maksimal {maxSizeMB}MB.",
    },
    needHelp: "Butuh bantuan cari URL yang tepat? ↓",
  },
  processingOverlay: {
    default: {
      title: "Menghapus latar belakang...",
      description:
        "Biasanya makan waktu 30-60 detik. Jangan tutup tab ini dulu, ya.",
    },
    downloading: {
      title: "Mengunduh model AI (cuma sekali di awal)…",
      description:
        "Mengunduh model AI {modelSize}. File ini disimpan di perangkatmu, jadi proses berikutnya langsung cepat.",
    },
    initializing: {
      title: "Menyiapkan mesin AI…",
      description: "Menyiapkan lingkungan eksekusi...",
    },
    compiling: {
      description: "Mengompilasi shader WebGPU untuk akselerasi hardware...",
    },
    processing: {
      description:
        "Menjalankan ekstraksi subjek langsung di hardware perangkatmu.",
    },
    downloadingLabel: "Mengunduh...",
    upscalingTiles: "Upscaling… {done} / {total} bagian",
    elapsedPrefix: "Waktu: ",
    cancelButton: "Batal",
    noCancelNotice: "Proses tidak bisa dibatalkan setelah dimulai",
  },
  landing: {
    comparison: {
      title: "Perbandingannya",
      localLabel: "Lokal",
      othersLabel: "Alat yang pakai unggahan",
    },
    faq: {
      title: "Pertanyaan Umum",
    },
    cta: {
      title: "Siap coba Alatify?",
      subtitle:
        "Proses gambarmu dengan aman dan cepat. Tanpa unggah, tanpa batasan, tanpa jebakan.",
    },
  },
  hintBubble: {
    toggleTip: "Tampilkan tip",
    ariaToggleTip: "Tampilkan tip petunjuk",
    dismiss: "Tutup tip",
  },
  "url-input-help": {
    title: "Cara dapetin URL gambar yang benar",
    intro:
      "Kamu bisa paste URL gambar langsung (klik kanan → Copy Image Address) ATAU URL halaman web yang menampilkan gambarnya. Di kebanyakan kasus, kami otomatis nyari gambar utama di halaman itu.",
    note: "**Catatan:** Kalau paste URL halaman web nggak jalan (beberapa situs memblokirnya), pakai cara Copy Image Address di bawah.",
    "desktop-title": "Di Desktop",
    "desktop-step1": "Buka gambar sumbernya (misalnya di Unsplash, Imgur).",
    "desktop-step2": "**Klik kanan tepat di gambar** itu sendiri.",
    "desktop-step3":
      'Pilih **"Copy Image Address"** (Chrome/Edge) atau **"Copy Image Link"** (Firefox/Safari).',
    "desktop-step4": "Paste URL-nya langsung ke kotak input di atas.",
    "desktop-warning":
      '**Penting:** Jangan pilih "Copy Link Address", itu bakal nyalin URL halaman web, bukan gambarnya.',
    "mobile-title": "Di HP",
    "mobile-step1": "Cari gambarnya di browser HP kamu.",
    "mobile-step2": "**Tekan lama gambarnya** sampai menu muncul.",
    "mobile-step3":
      'Pilih **"Copy Image Link"** / **"Copy Image Address"**, atau pilih **"Open image in new tab"**.',
    "mobile-step4":
      "Kalau dibuka di tab baru: ketuk address bar dan salin URL lengkapnya.",
    "mobile-step5": "Paste URL-nya ke kotak input di atas.",
    "examples-title": "Seperti apa bentuk URL gambar langsung",
    "examples-correct-label": "Benar: URL Gambar Langsung",
    "examples-wrong-label": "Salah: URL Halaman Web",
    "blocked-title": "Beberapa situs memblokir akses gambar dari luar",
    "blocked-desc":
      "Pinterest, Instagram, Facebook, dan TikTok sengaja memblokir gambar mereka biar nggak bisa dimuat di luar platformnya (dikenal sebagai hotlink protection). Kalau kamu dapet error akses diblokir, ikuti langkah ini:",
    "blocked-step1": "Simpan gambarnya langsung ke komputer atau HP kamu.",
    "blocked-step2":
      'Pindah ke tab **"Upload File"** di bagian atas workspace.',
    "blocked-step3":
      "Pilih atau drag file yang udah kamu simpan buat mulai proses secara lokal.",
  },
  toolCard: {
    "bg-remover": "Hapus background gambar otomatis, langsung di browser.",
    "upscaler": "Perbesar resolusi gambar pakai AI tanpa bikin pecah.",
    "watermark": "Tambah watermark teks atau logo ke gambar.",
    "compressor": "Perkecil ukuran file gambar, kualitas kamu yang atur.",
    "resizer": "Ubah ukuran gambar per pixel atau skala, satuan atau batch.",
    "converter": "Konversi gambar antar format seperti JPG, PNG, dan WebP.",
    "cropper": "Crop dan potong gambar sesuai ukuran yang kamu mau.",
    "code-to-image": "Ubah potongan kode jadi gambar rapi siap dibagikan.",
    "exif-cleaner": "Lihat dan hapus metadata EXIF serta lokasi GPS dari foto.",
    "id-protector": "Sensor dan tutup info sensitif di KTP dan dokumen.",
    "blur": "Blur, pixelate, atau sensor bagian mana pun dari gambar.",
    "steganography": "Sembunyikan pesan rahasia di dalam gambar, lalu baca lagi.",
    "qr-toolkit": "Bikin dan scan QR code, termasuk URL dan Wi-Fi.",
    "stock-finder": "Cari foto stok gratis dari Unsplash, Pexels, dan Pixabay.",
    "markdown-to-pdf": "Ubah Markdown jadi dokumen PDF rapi di perangkat kamu.",
    "pdf-to-markdown": "Ekstrak teks dari PDF jadi Markdown bersih di perangkat.",
    "pdf-pages": "Gabung, pisah, urutkan, putar, dan hapus halaman PDF.",
    "html-to-markdown": "Ubah HTML jadi Markdown bersih, langsung di browser.",
    "pdf-to-image": "Ubah halaman PDF jadi gambar JPG atau PNG.",
    "image-to-pdf": "Gabung beberapa gambar jadi satu file PDF.",
  },
  toolCategory: {
    image: "Gambar",
    privacy: "Privasi",
    document: "Dokumen",
    utility: "Lainnya",
  },
};
