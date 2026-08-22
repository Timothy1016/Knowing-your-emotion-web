// --- State Management ---
let isLogin = false;
let currentUser = "";
let currentLang = 'en'; // Default: 'en'; available: 'id' | 'en' | 'zh'
let currentTheme = 'light';
let currentEmotionView = 'home'; // 'home' | 'subs' | 'detail'
let activeCategory = '';
let activeSubIndex = -1;

// --- Multi-Language Data & Comprehensive Essay Database ---
const uiText = {
    id: {
        brand: "Know your Emotions", langBtn: "EN",
        authRegTitle: "Buat Akun ✨", authRegSub: "Mulai kenali dan kelola emosimu hari ini.", btnReg: "Daftar Sekarang",
        authLogTitle: "Selamat Datang 👋", authLogSub: "Masuk untuk melanjutkan perjalananmu.", btnLog: "Masuk",
        switchLog: "Sudah punya akun? ", switchLogAct: "Masuk di sini",
        switchReg: "Belum punya akun? ", switchRegAct: "Daftar di sini",
        lblUser: "Nama Panggilan", lblPass: "Kata Sandi", usernamePlaceholder: "Cth: Budi",
        toastErrEmpty: "Nama & kata sandi wajib diisi!", toastErrWrong: "Data tidak cocok!", toastOkReg: "Akun siap! Silakan masuk.", toastOkNote: "Catatan disimpan!", toastDelNote: "Catatan dihapus.",
        hello: "Selamat datang,", logout: "Keluar",
        dashTitle: "Bagaimana perasaanmu?", dashSub: "Pilih spektrum emosi di bawah ini.",
        subPrompt: "Pilih yang paling mewakili kondisimu:",
        btnBack: "Kembali", variations: "Variasi", clickRefl: "Lihat Esai & Refleksi",
        lblRefl: "💡 Refleksi & Esai", lblAdv: "🌱 Saran Tindakan", lblSeeAlso: "🔗 Terkait",
        navEmo: "Emosi", navLib: "Pustaka", navNote: "Catatan",
        libTitle: "Pustaka Emosi 📚", libSub: "68 penjelasan dari 11 spektrum emosi, tersedia dalam 3 bahasa.",
        notesTitle: "Catatan Saya 📝", notesSub: "Tuliskan pikiran dan perasaanmu di sini.",
        emptyNote: "Belum ada catatan.", createNoteTitle: "Tulis Catatan ✍️",
        noteHolder: "Tulis sesuatu...", btnCancel: "Batal", btnSave: "Simpan", newNoteLabel: "Tulis catatan baru", deleteNoteLabel: "Hapus catatan",
        curhatTitle: "✍️ Curhat Dulu, Yuk", curhatSub: "Tulis apa yang kamu rasakan, biar sistem coba menebak emosinya.",
        curhatPlaceholder: "Cth: aku lagi bete banget sama kerjaan...", curhatBtn: "Analisa Perasaanku",
        curhatEmpty: "Tulis dulu ceritanya ya!", curhatSeeDetail: "Lihat Detail Emosi Ini →",
        curhatOffline: "Server analisis (app.py) belum jalan. Coba jalankan 'python app.py' di komputer kamu dulu ya.",
        curhatResultLabel: "Hasil deteksi:", curhatResultMessage: "Gunakan hasil ini sebagai petunjuk awal untuk mengeksplorasi perasaanmu.", curhatSafety: "Hasil ini untuk refleksi, bukan diagnosis medis.",
        searchLabel: "Cari emosi", searchPlaceholder: "Cari nama, kategori, atau penjelasan emosi...",
        clearSearch: "Hapus pencarian", resultSuffix: "emosi ditemukan", noSearchResults: "Tidak ada emosi yang cocok.",
        crisisTitle: "Kamu tidak harus menghadapi ini sendirian.",
        crisisMessage: "Jika kamu berada dalam bahaya segera, hubungi layanan darurat setempat atau orang tepercaya sekarang. Untuk dukungan lanjutan, hubungi tenaga kesehatan mental profesional.",
        switchLanguageLabel: "Ganti bahasa", toggleThemeLabel: "Ganti tema", openRelatedLabel: "Buka emosi terkait"
    },
    en: {
        brand: "Know your Emotions", langBtn: "中文",
        authRegTitle: "Create Account ✨", authRegSub: "Start recognizing and managing your emotions.", btnReg: "Sign Up",
        authLogTitle: "Welcome Back 👋", authLogSub: "Sign in to continue your journey.", btnLog: "Sign In",
        switchLog: "Already have an account? ", switchLogAct: "Sign in here",
        switchReg: "Don't have an account? ", switchRegAct: "Sign up here",
        lblUser: "Nickname", lblPass: "Password", usernamePlaceholder: "e.g. Alex",
        toastErrEmpty: "Username & password required!", toastErrWrong: "Incorrect credentials!", toastOkReg: "Account ready! Please log in.", toastOkNote: "Note saved!", toastDelNote: "Note deleted.",
        hello: "Welcome,", logout: "Logout",
        dashTitle: "How are you feeling?", dashSub: "Choose an emotion spectrum below.",
        subPrompt: "Select what best represents your state:",
        btnBack: "Back", variations: "Variations", clickRefl: "View Essay & Reflection",
        lblRefl: "💡 Essay & Reflection", lblAdv: "🌱 Action Plan", lblSeeAlso: "🔗 See Also",
        navEmo: "Emotions", navLib: "Library", navNote: "Notes",
        notesTitle: "My Notes 📝", notesSub: "Write down your thoughts and feelings here.",
        libTitle: "Emotion Library 📚", libSub: "68 explanations across 11 emotion spectrums, available in 3 languages.",
        emptyNote: "No notes yet.", createNoteTitle: "Write Note ✍️",
        noteHolder: "Write something...", btnCancel: "Cancel", btnSave: "Save", newNoteLabel: "Write a new note", deleteNoteLabel: "Delete note",
        curhatTitle: "✍️ Tell Me What's Up", curhatSub: "Write what you're feeling and let the system guess the emotion.",
        curhatPlaceholder: "e.g. I'm so annoyed at work right now...", curhatBtn: "Analyze My Feeling",
        curhatEmpty: "Write something first!", curhatSeeDetail: "See This Emotion's Detail →",
        curhatOffline: "The analysis server (app.py) isn't running. Try running 'python app.py' on your computer first.",
        curhatResultLabel: "Detected result:", curhatResultMessage: "Use this result as a starting point for exploring how you feel.", curhatSafety: "This result is for reflection, not a medical diagnosis.",
        searchLabel: "Search emotions", searchPlaceholder: "Search by emotion, category, or description...",
        clearSearch: "Clear search", resultSuffix: "emotions found", noSearchResults: "No matching emotions found.",
        crisisTitle: "You do not have to face this alone.",
        crisisMessage: "If you are in immediate danger, contact local emergency services or a trusted person now. For ongoing support, contact a qualified mental-health professional.",
        switchLanguageLabel: "Switch language", toggleThemeLabel: "Toggle theme", openRelatedLabel: "Open related emotion"
    },
    zh: {
        brand: "Know your Emotions", langBtn: "ID",
        authRegTitle: "创建账号 ✨", authRegSub: "开始认识并管理您的情绪。", btnReg: "立即注册",
        authLogTitle: "欢迎回来 👋", authLogSub: "登录以继续您的旅程。", btnLog: "登录",
        switchLog: "已有账号？ ", switchLogAct: "在此登录",
        switchReg: "没有账号？ ", switchRegAct: "在此注册",
        lblUser: "昵称", lblPass: "密码", usernamePlaceholder: "例如：小明",
        toastErrEmpty: "请输入用户名和密码！", toastErrWrong: "账号或密码错误！", toastOkReg: "账号创建成功！请登录。", toastOkNote: "笔记已保存！", toastDelNote: "笔记已删除。",
        hello: "欢迎，", logout: "退出",
        dashTitle: "你现在感觉怎么样？", dashSub: "请选择下方的情绪谱系。",
        subPrompt: "选择最能代表你当前状态的选项：",
        btnBack: "返回", variations: "种变化", clickRefl: "查看详细散文与反思",
        lblRefl: "💡 散文与反思", lblAdv: "🌱 行动建议", lblSeeAlso: "🔗 相关链接",
        navEmo: "情绪", navLib: "文库", navNote: "笔记",
        libTitle: "情绪文库 📚", libSub: "涵盖 11 个情绪光谱的 68 篇说明，支持三种语言。",
        notesTitle: "我的笔记 📝", notesSub: "在这里写下你的想法和感受。",
        emptyNote: "暂无笔记。", createNoteTitle: "写笔记 ✍️",
        noteHolder: "写点什么...", btnCancel: "取消", btnSave: "保存", newNoteLabel: "写新笔记", deleteNoteLabel: "删除笔记",
        curhatTitle: "✍️ 先说说心事吧", curhatSub: "写下你的感受，让系统猜猜你的情绪。",
        curhatPlaceholder: "例如：我现在对工作感到很烦躁...", curhatBtn: "分析我的情绪",
        curhatEmpty: "请先写点内容！", curhatSeeDetail: "查看此情绪详情 →",
        curhatOffline: "分析服务器（app.py）尚未运行。请先在你的电脑上运行 'python app.py'。",
        curhatResultLabel: "检测结果：", curhatResultMessage: "请将此结果作为探索自身感受的起点。", curhatSafety: "此结果仅供自我反思，并非医学诊断。",
        searchLabel: "搜索情绪", searchPlaceholder: "按情绪、类别或说明搜索...",
        clearSearch: "清除搜索", resultSuffix: "种情绪", noSearchResults: "没有找到匹配的情绪。",
        crisisTitle: "你不必独自面对这一切。",
        crisisMessage: "如果你正处于紧急危险中，请立即联系当地急救服务或你信任的人。如需持续支持，请联系合格的心理健康专业人员。",
        switchLanguageLabel: "切换语言", toggleThemeLabel: "切换主题", openRelatedLabel: "打开相关情绪"
    }
};
Object.assign(uiText.id, {
    guest: "Lanjut sebagai tamu", guestName: "Tamu", homeLabel: "Buka Emotion Wheel", authPrivacy: "Kata sandi diproses oleh server secara aman dan tidak disimpan di browser.",
    goodMorning: "Selamat pagi", goodAfternoon: "Selamat siang", goodEvening: "Selamat malam", greetingQuoteLabel: "Refleksi hari ini",
    greetingQuotes: [
        "Semua perasaan datang membawa pesan; dengarkan tanpa terburu-buru menghakimi.",
        "Tidak apa-apa jika hari ini kamu belum bisa menjelaskan apa yang kamu rasakan.",
        "Perasaanmu valid, bahkan ketika orang lain tidak sepenuhnya memahaminya.",
        "Beri dirimu ruang untuk merasa sebelum memutuskan apa yang harus dilakukan.",
        "Emosi bukan musuh; ia membantu menunjukkan apa yang penting bagimu.",
        "Kamu tidak harus selalu kuat untuk tetap berharga.",
        "Menarik napas sejenak juga merupakan bentuk keberanian.",
        "Hari yang berat tidak menentukan seluruh perjalananmu.",
        "Mengenali perasaan adalah langkah pertama untuk merawat diri.",
        "Kamu boleh berjalan perlahan; pemulihan bukan perlombaan.",
        "Di balik rasa marah, mungkin ada kebutuhan yang ingin didengar.",
        "Kesedihan tidak membuatmu lemah; ia menunjukkan bahwa sesuatu berarti.",
        "Rasa takut bisa hadir bersamaan dengan keberanian.",
        "Kebahagiaan kecil tetap layak dirayakan.",
        "Kamu boleh berubah pikiran setelah memahami perasaanmu lebih baik.",
        "Tidak semua perasaan harus segera diperbaiki; sebagian hanya perlu ditemani.",
        "Bersikap lembut kepada diri sendiri juga sebuah kemajuan.",
        "Kamu berhak menetapkan batas ketika hatimu membutuhkan ruang.",
        "Apa pun yang kamu rasakan hari ini, kamu tidak sendirian.",
        "Luangkan waktu untuk bertanya: apa yang paling kubutuhkan saat ini?"
    ],
    authOffline: "Server akun belum tersedia. Kamu tetap dapat menggunakan mode tamu.", authWorking: "Memproses...",
    authLocalPrivacy: "Akun lokal aktif: kata sandi disimpan sebagai hash PBKDF2 bersalt di perangkat ini, bukan sebagai teks biasa.",
    authLocalExists: "Nama akun lokal tersebut sudah digunakan.", authLocalWrong: "Nama atau kata sandi akun lokal tidak cocok.", authLocalCrypto: "Browser ini tidak mendukung penyimpanan akun lokal yang aman.",
    installApp: "Pasang aplikasi", installReady: "Box of Emotions siap dipasang.", installed: "Aplikasi berhasil dipasang.",
    wheelTitle: "Emotion Wheel", wheelSubtitle: "Putar roda atau pilih simbol untuk menjelajahi spektrum emosi.", wheelCenter: "Putar Roda", wheelCenterHint: "Temukan spektrum acak", wheelSpin: "Putar Roda", wheelSpinHint: "Temukan spektrum acak", wheelSpinning: "Sedang berputar...", wheelSpinAgain: "Tekan untuk putar lagi", wheelSelectedHint: "Terpilih · tekan simbol untuk membuka", wheelLabel: "Roda putar berisi 11 spektrum emosi", scrollTop: "Kembali ke atas",
    wheelResultKicker: "Hasil putaranmu", wheelResultMeta: "{count} variasi emosi untuk dijelajahi", wheelResultOpen: "Jelajahi spektrum", wheelResultSpin: "Putar lagi",
    gameKicker: "MINI GAME · 2+ PEMAIN", gameTitle: "Cerita Bergilir", gameSubtitle: "Ambil satu kartu, lalu bergantian berbagi pengalaman bersama teman.",
    gameReady: "Siap bermain", gameReadySpectrum: "Kenali cerita satu sama lain", gameReadyName: "Ambil kartu pertamamu", gameStartPrompt: "Setiap pemain boleh melewati pertanyaan yang belum nyaman untuk dijawab.", gameRound: "Ronde", gameDraw: "Ambil kartu", gameNext: "Kartu berikutnya", gameShare: "Kirim pertanyaan", gameSafety: "Tidak ada jawaban benar atau salah. Dengarkan tanpa menghakimi dan semua pemain boleh melewati giliran.", gameShareLead: "Kartu Cerita Bergilir untukmu:", gameShareFooter: "Mau berbagi ceritamu? Kamu boleh melewatinya jika belum nyaman.", gameCopied: "Pertanyaan disalin. Kirim ke temanmu, ya!", gameShareUnavailable: "Fitur berbagi belum tersedia di browser ini.",
    gamePrompts: ["Ceritakan kapan terakhir kali kamu merasakan {emotion}. Apa yang terjadi?", "Ketika {emotion} muncul, apa yang paling kamu butuhkan dari orang lain?", "Kalau {emotion} punya warna atau cuaca, seperti apa? Mengapa?", "Apa satu hal kecil yang membantumu menghadapi {emotion}?", "Lengkapi: ‘Saat merasa {emotion}, aku berharap teman-temanku...’", "Adakah pengalaman tentang {emotion} yang mengubah caramu memahami diri sendiri?"],
    fuzzyHint: "Pencarian tetap bekerja meskipun ada salah ketik.", spectrumKicker: "Tentang spektrum ini", spectrumNote: "Spektrum adalah kelompok pengalaman emosi, bukan satu emosi tunggal.", backToSpectrums: "Semua spektrum", backToCategory: "Kembali ke spektrum",
    navAbout: "Tentang", navGames: "Games", gamesPageKicker: "MAIN BERSAMA", gamesPageTitle: "Emotion Games 🎴", gamesPageSubtitle: "Ruang khusus untuk mengenal emosi lewat permainan bersama teman.", favoritesTitle: "Favorit", recentTitle: "Terakhir dilihat", favorite: "Favorit", favorited: "Difavoritkan",
    filters: { all: "Semua", calm: "Tenang", heavy: "Berat", positive: "Positif", favorites: "Favorit", recent: "Terakhir dilihat", frequent: "Sering dilihat" },
    readMore: "Baca selengkapnya", readLess: "Tutup", notesSearch: "Cari catatan...", exportNotes: "Ekspor", editNote: "Edit catatan",
    noteTag: "Tag emosi", updateNote: "Perbarui", undo: "Batalkan", noteRestored: "Catatan dikembalikan.",
    aboutTitle: "Tentang & Kredit ℹ️", aboutSubtitle: "Tujuan, batasan, dan asal konsep Box of Emotions.",
    aboutPurposeTitle: "Tujuan edukasi", aboutPurpose: "Box of Emotions membantu pengguna menemukan bahasa untuk merefleksikan perasaan. Konten ini bukan alat diagnosis atau pengganti psikolog, psikiater, dokter, maupun layanan krisis.",
    reminderTitle: "Pengingat harian", reminderDescription: "Pilih waktu untuk mengingatkanmu melakukan check-in emosi.", reminderTimeLabel: "Waktu pengingat", reminderEnable: "Aktifkan pengingat", reminderDisable: "Nonaktifkan", reminderTest: "Kirim tes", reminderInactive: "Pengingat belum aktif.", reminderActive: "Pengingat aktif setiap hari pukul {time}.", reminderPermissionDenied: "Izin notifikasi diblokir. Aktifkan kembali melalui pengaturan browser.", reminderUnavailable: "Browser ini tidak mendukung notifikasi web.", reminderHttps: "Notifikasi dapat diaktifkan setelah web dibuka melalui HTTPS GitHub Pages, bukan file lokal.", reminderEnabledToast: "Pengingat harian diaktifkan.", reminderDisabledToast: "Pengingat dinonaktifkan.", reminderTestSent: "Notifikasi tes dikirim.", reminderHelp: "Notifikasi dijalankan oleh PWA saat tersedia. Pada beberapa perangkat, pengingat mungkin tidak muncul jika aplikasi benar-benar ditutup.",
    aboutCrisisTitle: "Saat membutuhkan bantuan segera", aboutCrisis: "Jika kamu atau orang lain berada dalam bahaya, hubungi layanan darurat setempat dan orang tepercaya. Untuk dukungan berkelanjutan, pertimbangkan tenaga kesehatan mental profesional.",
    aboutCreditTitle: "Kredit dan bahasa", aboutCredit: "Konsep dan penjelasan diadaptasi dari materi Box of Emotions yang diberikan pemilik proyek. Terjemahan tersedia dalam Indonesia, Inggris, dan Mandarin; istilah budaya dipertahankan bila tidak memiliki padanan langsung.",
    aboutPrivacyTitle: "Privasi", aboutPrivacy: "Mode tamu dan akun lokal menyimpan data hanya di perangkat ini; akun lokal memakai hash PBKDF2 bersalt. Akun server menyinkronkan catatan, favorit, serta riwayat melalui backend."
});
Object.assign(uiText.en, {
    guest: "Continue as guest", guestName: "Guest", homeLabel: "Go to Emotion Wheel", authPrivacy: "Your password is securely processed by the server and is never stored in the browser.",
    goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening", greetingQuoteLabel: "Today's reflection",
    greetingQuotes: [
        "Every feeling carries a message; listen before rushing to judge it.",
        "It is okay if you cannot explain what you feel today.",
        "Your feelings are valid, even when others do not fully understand them.",
        "Give yourself room to feel before deciding what to do next.",
        "Emotions are not enemies; they help reveal what matters to you.",
        "You do not have to be strong all the time to remain worthy.",
        "Taking one slow breath can also be an act of courage.",
        "A difficult day does not define your whole journey.",
        "Naming a feeling is the first step toward caring for yourself.",
        "You may move slowly; healing is not a race.",
        "Behind anger, there may be a need asking to be heard.",
        "Sadness does not make you weak; it shows that something mattered.",
        "Fear and courage can exist at the same time.",
        "Small moments of happiness still deserve to be celebrated.",
        "You may change your mind after understanding your feelings more clearly.",
        "Not every feeling must be fixed immediately; some simply need company.",
        "Being gentle with yourself is also a form of progress.",
        "You are allowed to set boundaries when your heart needs space.",
        "Whatever you are feeling today, you are not alone.",
        "Take a moment to ask: what do I need most right now?"
    ],
    authOffline: "The account server is unavailable. You can still use guest mode.", authWorking: "Working...",
    authLocalPrivacy: "Local account active: your password is stored as a salted PBKDF2 hash on this device, never as plain text.",
    authLocalExists: "That local account name is already in use.", authLocalWrong: "The local account name or password is incorrect.", authLocalCrypto: "This browser does not support secure local-account storage.",
    installApp: "Install app", installReady: "Box of Emotions is ready to install.", installed: "App installed successfully.",
    wheelTitle: "Emotion Wheel", wheelSubtitle: "Spin the wheel or tap a symbol to explore an emotion spectrum.", wheelCenter: "Spin the Wheel", wheelCenterHint: "Find a random spectrum", wheelSpin: "Spin the Wheel", wheelSpinHint: "Find a random spectrum", wheelSpinning: "Spinning...", wheelSpinAgain: "Tap to spin again", wheelSelectedHint: "Selected · tap its symbol to open", wheelLabel: "Spinning wheel with 11 emotion spectrums", scrollTop: "Back to top",
    wheelResultKicker: "Your spin result", wheelResultMeta: "{count} emotion variations to explore", wheelResultOpen: "Explore spectrum", wheelResultSpin: "Spin again",
    gameKicker: "MINI GAME · 2+ PLAYERS", gameTitle: "Story Circle", gameSubtitle: "Draw a card, then take turns sharing experiences with friends.",
    gameReady: "Ready to play", gameReadySpectrum: "Get to know each other's stories", gameReadyName: "Draw your first card", gameStartPrompt: "Every player may pass on a question they are not comfortable answering.", gameRound: "Round", gameDraw: "Draw a card", gameNext: "Next card", gameShare: "Send question", gameSafety: "There are no right or wrong answers. Listen without judgment, and let anyone pass their turn.", gameShareLead: "Here is your Story Circle card:", gameShareFooter: "Want to share your story? You can pass if you are not comfortable yet.", gameCopied: "Question copied. Send it to a friend!", gameShareUnavailable: "Sharing is not available in this browser yet.",
    gamePrompts: ["Tell us about the last time you felt {emotion}. What happened?", "When {emotion} shows up, what do you need most from other people?", "If {emotion} had a color or weather, what would it be? Why?", "What is one small thing that helps you move through {emotion}?", "Finish this sentence: ‘When I feel {emotion}, I wish my friends would...’", "Has an experience with {emotion} changed how you understand yourself?"],
    fuzzyHint: "Search still works when a word is misspelled.", spectrumKicker: "About this spectrum", spectrumNote: "A spectrum is a family of emotional experiences, not one single emotion.", backToSpectrums: "All spectrums", backToCategory: "Back to spectrum",
    navAbout: "About", navGames: "Games", gamesPageKicker: "PLAY TOGETHER", gamesPageTitle: "Emotion Games 🎴", gamesPageSubtitle: "A dedicated space to explore emotions through games with friends.", favoritesTitle: "Favorites", recentTitle: "Recently viewed", favorite: "Favorite", favorited: "Favorited",
    filters: { all: "All", calm: "Calm", heavy: "Heavy", positive: "Positive", favorites: "Favorites", recent: "Recently viewed", frequent: "Frequently viewed" },
    readMore: "Read more", readLess: "Show less", notesSearch: "Search notes...", exportNotes: "Export", editNote: "Edit note",
    noteTag: "Emotion tag", updateNote: "Update", undo: "Undo", noteRestored: "Note restored.",
    aboutTitle: "About & Credits ℹ️", aboutSubtitle: "Purpose, limitations, and origins of Box of Emotions.",
    aboutPurposeTitle: "Educational purpose", aboutPurpose: "Box of Emotions helps people find language for reflecting on feelings. It is not a diagnostic tool or a substitute for a psychologist, psychiatrist, doctor, or crisis service.",
    reminderTitle: "Daily reminder", reminderDescription: "Choose a time for your daily emotion check-in reminder.", reminderTimeLabel: "Reminder time", reminderEnable: "Enable reminder", reminderDisable: "Disable", reminderTest: "Send test", reminderInactive: "The reminder is not active.", reminderActive: "Your reminder is active every day at {time}.", reminderPermissionDenied: "Notification permission is blocked. Re-enable it in your browser settings.", reminderUnavailable: "This browser does not support web notifications.", reminderHttps: "Notifications can be enabled on the HTTPS GitHub Pages site, not from a local file.", reminderEnabledToast: "Daily reminder enabled.", reminderDisabledToast: "Reminder disabled.", reminderTestSent: "Test notification sent.", reminderHelp: "The PWA delivers the reminder when available. On some devices, it may not appear when the app is completely closed.",
    aboutCrisisTitle: "When immediate help is needed", aboutCrisis: "If you or someone else is in danger, contact local emergency services and a trusted person. For ongoing support, consider a qualified mental-health professional.",
    aboutCreditTitle: "Credits and language", aboutCredit: "The concepts and explanations are adapted from Box of Emotions materials supplied by the project owner. Indonesian, English, and Mandarin versions are available; culture-specific terms remain when no direct equivalent exists.",
    aboutPrivacyTitle: "Privacy", aboutPrivacy: "Guest mode and local accounts keep data on this device; local accounts use salted PBKDF2 hashes. Server accounts synchronize notes, favorites, and history through the backend."
});
Object.assign(uiText.zh, {
    guest: "以访客身份继续", guestName: "访客", homeLabel: "前往情绪轮", authPrivacy: "密码由服务器安全处理，不会存储在浏览器中。",
    goodMorning: "早上好", goodAfternoon: "下午好", goodEvening: "晚上好", greetingQuoteLabel: "今日心语",
    greetingQuotes: [
        "每一种感受都带着讯息；先倾听，不必急着评判。",
        "如果今天还说不清自己的感受，也没有关系。",
        "即使别人无法完全理解，你的感受依然真实而重要。",
        "在决定下一步之前，先给自己一些感受的空间。",
        "情绪不是敌人；它们会告诉你什么对你很重要。",
        "你不需要一直坚强，依然值得被珍惜。",
        "慢慢深呼吸一次，也是一种勇敢。",
        "艰难的一天并不能定义你的整段旅程。",
        "说出感受的名字，是照顾自己的第一步。",
        "你可以慢慢前进；疗愈不是一场比赛。",
        "愤怒背后，也许藏着一个渴望被听见的需要。",
        "悲伤并不代表软弱，它说明有些事情曾经很重要。",
        "恐惧与勇气可以同时存在。",
        "微小的快乐也值得庆祝。",
        "更理解自己的感受后，你可以改变想法。",
        "并非所有感受都要立刻修复；有些只需要陪伴。",
        "温柔地对待自己，也是一种进步。",
        "当内心需要空间时，你有权设下界限。",
        "无论今天感受到什么，你都不是孤单一人。",
        "花一点时间问自己：此刻我最需要什么？"
    ],
    authOffline: "账户服务器暂不可用。你仍可使用访客模式。", authWorking: "处理中...",
    authLocalPrivacy: "本地账户已启用：密码以加盐 PBKDF2 哈希存储在此设备上，而不是明文。",
    authLocalExists: "该本地账户名称已被使用。", authLocalWrong: "本地账户名称或密码不正确。", authLocalCrypto: "此浏览器不支持安全的本地账户存储。",
    installApp: "安装应用", installReady: "Box of Emotions 已可安装。", installed: "应用安装成功。",
    wheelTitle: "情绪轮", wheelSubtitle: "转动情绪轮或点击符号，探索不同的情绪光谱。", wheelCenter: "转动情绪轮", wheelCenterHint: "随机发现一种情绪光谱", wheelSpin: "转动情绪轮", wheelSpinHint: "随机发现一种情绪光谱", wheelSpinning: "转动中...", wheelSpinAgain: "点击再次转动", wheelSelectedHint: "已选中 · 点击符号打开", wheelLabel: "包含 11 种情绪光谱的转盘", scrollTop: "返回顶部",
    wheelResultKicker: "你的转盘结果", wheelResultMeta: "探索 {count} 种情绪变化", wheelResultOpen: "探索这个光谱", wheelResultSpin: "再次转动",
    gameKicker: "迷你游戏 · 2 人以上", gameTitle: "故事接力", gameSubtitle: "抽一张卡片，和朋友轮流分享情绪经历。",
    gameReady: "准备开始", gameReadySpectrum: "了解彼此的故事", gameReadyName: "抽取第一张卡片", gameStartPrompt: "每位玩家都可以跳过暂时不愿回答的问题。", gameRound: "第", gameDraw: "抽一张卡", gameNext: "下一张卡", gameShare: "发送问题", gameSafety: "答案没有对错。请不带评判地倾听，也允许任何人跳过自己的回合。", gameShareLead: "这是给你的故事接力卡：", gameShareFooter: "愿意分享你的故事吗？如果还没准备好，也可以跳过。", gameCopied: "问题已复制，可以发给朋友了！", gameShareUnavailable: "此浏览器暂不支持分享功能。",
    gamePrompts: ["说说你上一次感到{emotion}是什么时候。当时发生了什么？", "当{emotion}出现时，你最需要别人给予什么？", "如果{emotion}是一种颜色或天气，它会是什么？为什么？", "有什么小事情能帮助你度过{emotion}？", "完成这句话：‘当我感到{emotion}时，我希望朋友们……’", "关于{emotion}的某次经历，是否改变了你理解自己的方式？"],
    fuzzyHint: "即使输入有拼写错误，搜索仍然有效。", spectrumKicker: "关于这个情绪谱系", spectrumNote: "情绪谱系是一组彼此相关的情绪体验，而不是某一种单独的情绪。", backToSpectrums: "所有情绪谱系", backToCategory: "返回情绪谱系",
    navAbout: "关于", navGames: "游戏", gamesPageKicker: "一起玩", gamesPageTitle: "情绪游戏 🎴", gamesPageSubtitle: "和朋友一起通过游戏探索情绪的专属空间。", favoritesTitle: "收藏", recentTitle: "最近浏览", favorite: "收藏", favorited: "已收藏",
    filters: { all: "全部", calm: "平静", heavy: "沉重", positive: "积极", favorites: "收藏", recent: "最近浏览", frequent: "经常浏览" },
    readMore: "阅读全文", readLess: "收起", notesSearch: "搜索笔记...", exportNotes: "导出", editNote: "编辑笔记",
    noteTag: "情绪标签", updateNote: "更新", undo: "撤销", noteRestored: "笔记已恢复。",
    aboutTitle: "关于与鸣谢 ℹ️", aboutSubtitle: "Box of Emotions 的目的、限制与概念来源。",
    aboutPurposeTitle: "教育目的", aboutPurpose: "Box of Emotions 帮助人们找到反思感受的语言。它不是诊断工具，也不能替代心理学家、精神科医生、医生或危机干预服务。",
    reminderTitle: "每日提醒", reminderDescription: "选择每天进行情绪记录的提醒时间。", reminderTimeLabel: "提醒时间", reminderEnable: "开启提醒", reminderDisable: "关闭提醒", reminderTest: "发送测试", reminderInactive: "提醒尚未开启。", reminderActive: "提醒已开启，每天 {time} 发送。", reminderPermissionDenied: "通知权限已被阻止，请在浏览器设置中重新开启。", reminderUnavailable: "此浏览器不支持网页通知。", reminderHttps: "通知需要通过 HTTPS GitHub Pages 网站启用，无法从本地文件启用。", reminderEnabledToast: "每日提醒已开启。", reminderDisabledToast: "提醒已关闭。", reminderTestSent: "测试通知已发送。", reminderHelp: "PWA 会在可用时发送提醒。在某些设备上，应用完全关闭后提醒可能不会出现。",
    aboutCrisisTitle: "需要紧急帮助时", aboutCrisis: "如果你或他人正处于危险中，请联系当地急救服务和你信任的人。若需要持续支持，请考虑合格的心理健康专业人员。",
    aboutCreditTitle: "鸣谢与语言", aboutCredit: "概念与说明改编自项目所有者提供的 Box of Emotions 材料。内容提供印尼语、英语和中文版本；没有直接对应词的文化术语会保留原文。",
    aboutPrivacyTitle: "隐私", aboutPrivacy: "访客模式和本地账户仅在此设备保存数据；本地账户使用加盐 PBKDF2 哈希。服务器账户通过后端同步笔记、收藏和浏览记录。"
});

// Twenty reflection themes paired with five gentle next steps create exactly
// 100 additional, aligned variations in every supported language.
const additionalGreetingQuoteParts = {
    id: {
        starters: [
            "Ketika pikiran terasa penuh, berhenti sejenak;", "Saat hatimu belum menemukan jawabannya, beri waktu;",
            "Jika hari ini terasa lebih berat dari biasanya, pelankan langkah;", "Ketika kamu mulai membandingkan perjalananmu, kembali pada dirimu;",
            "Saat rasa marah muncul, cari pesan di baliknya;", "Ketika kesedihan datang, jangan buru-buru mengusirnya;",
            "Saat kecemasan membayangkan banyak kemungkinan, kembali ke saat ini;", "Ketika tubuh meminta istirahat, dengarkan sinyalnya;",
            "Saat kamu takut mengecewakan orang lain, ingat kebutuhanmu juga;", "Ketika sebuah batas perlu disampaikan, kamu boleh bersikap jujur;",
            "Saat sesuatu tidak berjalan sesuai rencana, beri ruang untuk menyesuaikan diri;", "Ketika kamu merasa tertinggal, hormati ritmemu sendiri;",
            "Saat kegembiraan kecil hadir, izinkan dirimu menikmatinya;", "Ketika keraguan muncul, tidak semua hal harus langsung dipastikan;",
            "Saat kamu kehilangan kata-kata, keheningan pun dapat menemani;", "Ketika kamu terlalu keras kepada diri sendiri, ubah nada bicaramu;",
            "Saat hubungan terasa rumit, pisahkan fakta dari asumsi;", "Ketika masa depan tampak kabur, fokuslah pada langkah terdekat;",
            "Saat kamu ingin segera bereaksi, buat sedikit ruang sebelum menjawab;", "Ketika kamu merasa sendirian, carilah satu koneksi yang terasa aman;"
        ],
        endings: [
            "kamu tidak harus memahami semuanya sekaligus.", "satu napas sadar sudah menjadi langkah yang berarti.",
            "dengarkan kebutuhanmu dengan lembut, tanpa menghakimi.", "pilih satu hal kecil yang dapat kamu lakukan sekarang.",
            "ingat bahwa perasaan ini boleh hadir dan akan berubah."
        ]
    },
    en: {
        starters: [
            "When your mind feels crowded, pause for a moment;", "When your heart has not found an answer, give it time;",
            "If today feels heavier than usual, slow your pace;", "When you begin comparing your journey, return to yourself;",
            "When anger appears, look for the message beneath it;", "When sadness arrives, do not rush to send it away;",
            "When anxiety imagines many possibilities, return to this moment;", "When your body asks for rest, listen to its signal;",
            "When you fear disappointing someone, remember your needs too;", "When a boundary needs to be expressed, you may be honest;",
            "When something does not go to plan, make room to adjust;", "When you feel behind, honor your own rhythm;",
            "When a small joy appears, let yourself enjoy it;", "When doubt appears, not everything needs immediate certainty;",
            "When words are hard to find, silence can keep you company;", "When you are too hard on yourself, soften your inner voice;",
            "When a relationship feels complicated, separate facts from assumptions;", "When the future looks unclear, focus on the nearest step;",
            "When you want to react immediately, make a little room before replying;", "When you feel alone, reach for one connection that feels safe;"
        ],
        endings: [
            "you do not have to understand everything at once.", "one mindful breath is already a meaningful step.",
            "listen to your needs gently, without judgment.", "choose one small thing you can do right now.",
            "remember that this feeling is allowed to be here and will change."
        ]
    },
    zh: {
        starters: [
            "当思绪变得拥挤时，先停一下；", "当内心还没有答案时，给它一点时间；",
            "如果今天比平常更沉重，放慢脚步；", "当你开始比较彼此的旅程时，回到自己身上；",
            "当愤怒出现时，看看它背后的讯息；", "当悲伤到来时，不必急着赶走它；",
            "当焦虑想象许多可能时，回到此刻；", "当身体请求休息时，听一听它的讯号；",
            "当你害怕让别人失望时，也别忘记自己的需要；", "当界限需要被说出来时，你可以诚实；",
            "当事情没有按计划进行时，给自己调整的空间；", "当你觉得落后时，尊重自己的节奏；",
            "当微小的快乐出现时，允许自己享受它；", "当怀疑出现时，不是所有事情都要立刻确定；",
            "当你找不到语言时，沉默也可以陪伴你；", "当你对自己太苛刻时，放柔内心的语气；",
            "当关系变得复杂时，把事实与假设分开；", "当前方显得模糊时，专注于最近的一步；",
            "当你想立刻反应时，先为回应留一点空间；", "当你感到孤单时，寻找一段让你安心的连接；"
        ],
        endings: [
            "你不需要一次理解所有事情。", "一次有意识的呼吸，已经是有意义的一步。",
            "温柔而不带评判地听听自己的需要。", "选择一件此刻能够完成的小事。",
            "记得这种感受可以存在，也会慢慢变化。"
        ]
    }
};

for (const lang of ["id", "en", "zh"]) {
    const parts = additionalGreetingQuoteParts[lang];
    uiText[lang].greetingQuotes.push(...parts.starters.flatMap(starter => parts.endings.map(ending => `${starter} ${ending}`)));
}

const spectrumDescriptions = {
    emptiness: {
        id: "Spektrum Kekosongan mencakup perasaan yang muncul ketika sesuatu yang penting terasa hilang, jauh, atau tidak lagi bermakna. Duka, kesepian, melankoli, dan keputusasaan berada di sini karena semuanya dapat meninggalkan ruang batin yang terasa sunyi atau hampa.",
        en: "The Emptiness spectrum gathers feelings that arise when something important feels lost, distant, or no longer meaningful. Grief, loneliness, melancholy, and despair belong here because each can leave an inner space that feels quiet or hollow.",
        zh: "空虚谱系包含当重要的人、事物或意义仿佛失去、远离或不复存在时产生的感受。哀伤、孤独、忧郁与绝望都可能在内心留下寂静而空洞的空间。"
    },
    heartache: {
        id: "Spektrum Luka Hati berkaitan dengan rasa sakit karena perpisahan, kerinduan, perubahan, atau kenangan yang tidak dapat diulang. Emosinya sering terasa pahit-manis: kita berduka atas yang telah pergi sambil tetap menyimpan kasih terhadapnya.",
        en: "The Heartache spectrum concerns the pain of separation, longing, change, or memories that cannot be relived. Its emotions are often bittersweet: we grieve what has gone while still holding affection for it.",
        zh: "心痛谱系与分离、思念、变化，以及无法重现的回忆所带来的痛楚有关。这些感受往往苦乐交织：我们为已经离去的事物悲伤，同时仍保留着对它的眷恋。"
    },
    bitterness: {
        id: "Spektrum Kepahitan muncul saat kenyataan terasa tidak adil, harapan terluka, atau kita membandingkan diri dengan orang lain. Penyesalan, iri, cemburu, dan jijik dapat menjadi sinyal bahwa ada kebutuhan, batas, atau luka yang belum selesai dipahami.",
        en: "The Bitterness spectrum appears when reality feels unfair, expectations are wounded, or we compare ourselves with others. Regret, envy, jealousy, and disgust can signal a need, boundary, or hurt that has not yet been understood.",
        zh: "苦涩谱系常在现实显得不公、期待受到伤害，或我们与他人比较时出现。后悔、羡慕、妒忌与厌恶，可能提示某种尚未被理解的需要、界限或创伤。"
    },
    heat: {
        id: "Spektrum Gejolak Panas berisi emosi berenergi tinggi yang membuat tubuh dan pikiran siap bereaksi. Jengkel, marah, panik, dan murka dapat mendorong perlindungan atau perubahan, tetapi intensitasnya juga perlu diarahkan agar tidak melukai diri sendiri maupun orang lain.",
        en: "The Heat spectrum contains high-energy emotions that prepare body and mind to react. Irritation, anger, panic, and rage can drive protection or change, but their intensity needs direction so it does not harm us or others.",
        zh: "激烈情绪谱系包含让身心迅速进入反应状态的高能量感受。烦躁、愤怒、恐慌与暴怒可以推动自我保护或改变，但也需要被适当引导，以免伤害自己或他人。"
    },
    possibility: {
        id: "Possibility bukan satu emosi, melainkan spektrum perasaan yang muncul ketika masa depan masih terbuka. Antisipasi, harapan, rasa ingin tahu, keinginan menjelajah, dan ketidakpastian sama-sama tumbuh dari pertanyaan: ‘Apa yang mungkin terjadi selanjutnya?’",
        en: "Possibility is not one emotion, but a spectrum of feelings that arise while the future remains open. Anticipation, hope, curiosity, wanderlust, and uncertainty all grow from the question: ‘What might happen next?’",
        zh: "可能性并不是某一种单独的情绪，而是未来仍然开放时出现的一组感受。期待、希望、好奇、远行的渴望与不确定感，都源于同一个问题：“接下来可能会发生什么？”"
    },
    zen: {
        id: "Spektrum Zen menggambarkan keadaan yang menenangkan, menopang, dan membantu kita kembali seimbang. Tenang, lega, nyaman, empati, serta kehangatan setelah berbuat baik bukan berarti hidup tanpa masalah, melainkan adanya ruang untuk bernapas dan terhubung.",
        en: "The Zen spectrum describes states that soothe, support, and help us return to balance. Calm, relief, comfort, empathy, and the warm glow of helping do not mean life is problem-free; they create room to breathe and reconnect.",
        zh: "禅意谱系描述能安抚、支撑我们并帮助恢复平衡的状态。平静、宽慰、舒适、同理心，以及助人后的温暖，并不表示生活毫无问题，而是让我们拥有喘息与重新连接的空间。"
    },
    bliss: {
        id: "Spektrum Kebahagiaan mencakup rasa hidup yang terasa penuh, hangat, dan bernilai. Bahagia, cinta, kepuasan, keceriaan, dan euforia berbeda tingkat intensitasnya, tetapi semuanya dapat memperluas rasa syukur, kedekatan, atau kebermaknaan.",
        en: "The Bliss spectrum includes experiences in which life feels full, warm, and worthwhile. Happiness, love, satisfaction, cheerfulness, and euphoria differ in intensity, yet each can expand gratitude, connection, or meaning.",
        zh: "极乐谱系包含那些让生命显得充实、温暖而有价值的体验。幸福、爱、满足、愉快与欣快的强度各不相同，却都可能拓展感恩、连接感与生命意义。"
    },
    loathing: {
        id: "Spektrum Pergulatan Diri berhubungan dengan penolakan, penilaian keras, atau luka yang diarahkan kepada diri sendiri maupun orang lain. Rasa bersalah, malu, dendam, dan kecewa dapat membantu mengenali tanggung jawab atau batas, tetapi dapat menjadi berat bila berubah menjadi hukuman tanpa akhir.",
        en: "The Loathing spectrum involves rejection, harsh judgment, or hurt directed toward ourselves or others. Guilt, shame, resentment, and disappointment may reveal responsibility or boundaries, but become burdensome when they turn into endless punishment.",
        zh: "厌恶与自我挣扎谱系涉及指向自己或他人的排斥、严厉评判与伤痛。内疚、羞耻、怨恨和失望可以帮助我们看见责任或界限，但若变成无休止的惩罚，也会成为沉重负担。"
    },
    enjoyment: {
        id: "Spektrum Kenikmatan berisi perasaan menyenangkan yang menghidupkan tubuh dan menarik kita menuju pengalaman tertentu. Hasrat, kegembiraan, kejutan, ekstase, dan sensasi kehilangan kendali dapat terasa seru, walau tetap perlu dijalani dengan kesadaran terhadap batas dan akibatnya.",
        en: "The Enjoyment spectrum contains pleasurable feelings that enliven the body and draw us toward an experience. Desire, excitement, surprise, ecstasy, and the thrill of losing control can feel exhilarating while still calling for awareness of limits and consequences.",
        zh: "愉悦谱系包含使身体充满活力、吸引我们走向某种体验的快乐感受。欲望、兴奋、惊喜、狂喜，以及暂时失控的刺激都可能令人振奋，同时也需要留意界限与后果。"
    },
    ego: {
        id: "Spektrum Diri & Harga Diri berkaitan dengan cara kita melihat kemampuan, martabat, identitas, dan posisi sosial. Percaya diri, bangga, berani, malu, atau merasa seperti penipu menunjukkan bagaimana penilaian diri bertemu dengan pandangan orang lain.",
        en: "The Ego spectrum concerns how we see our ability, dignity, identity, and social standing. Confidence, pride, courage, embarrassment, or feeling like a fraud reveal where self-evaluation meets the gaze of others.",
        zh: "自我谱系关系到我们如何看待自己的能力、尊严、身份与社会位置。自信、自豪、勇气、尴尬，或觉得自己像个冒牌货，都反映了自我评价与他人目光相遇的地方。"
    },
    angst: {
        id: "Spektrum Kecemasan muncul ketika kita merasakan ancaman, ketidakpastian, atau kehilangan kendali. Khawatir, takut, cemas, gentar, dan teror berbeda dalam sumber serta intensitasnya, tetapi semuanya berusaha memperingatkan dan mempersiapkan kita menghadapi bahaya.",
        en: "The Angst spectrum arises when we sense threat, uncertainty, or loss of control. Worry, fear, anxiety, dread, and terror differ in source and intensity, yet each tries to warn and prepare us for danger.",
        zh: "焦虑谱系在我们感到威胁、不确定或失去控制时出现。担忧、恐惧、焦虑、惶恐与惊恐的来源和强度各不相同，但都试图提醒我们并为危险做好准备。"
    }
};

const pdfEmotionGroups = {
    emptiness: {
        icon: "🕳️", color: "#64748b",
        title: { id: "Emptiness (Kekosongan)", en: "Emptiness", zh: "空虚" },
        items: [
            { emoji: "🎹", name: "Żal", page: 5, reflection: "Żal adalah melankoli atas kehilangan yang tak mungkin dipulihkan. Perasaan ini tidak diam: ia dapat bergerak dari pasrah menjadi memberontak, mencampurkan kekecewaan, penyesalan, dan amarah karena sebagian hidup telah direnggut untuk selamanya; pada Chopin, pergulatan itu menjelma menjadi tenaga emosional dalam musiknya.", seeAlso: "Disappointment, Regret" },
            { emoji: "⚫", name: "Hatred", page: 3, reflection: "Hatred dibahas melalui lahirnya istilah ‘hate crime’ dan perdebatan tentang apakah hukum dapat mengukur atau menghukum sebuah emosi. Bahasa kebencian dianggap dapat memperberat penilaian atas kekerasan, sementara pendukungnya menekankan bahwa kebencianlah yang menyulut penghinaan, intoleransi, dan serangan terhadap kelompok rentan.", seeAlso: "Jealousy" },
            { emoji: "☀️", name: "Acedia", page: 2, reflection: "Acedia adalah krisis batin yang dahulu dikaitkan dengan para pertapa di gurun: rasa lesu dan jengkel pada tengah hari yang dapat berkembang menjadi kehampaan dan keputusasaan. Ketika tidak lagi termasuk dosa besar, gejalanya terbagi ke dalam gagasan tentang melankolia, depresi, kecemasan, dan sifat malas.", seeAlso: "Boredom, Melancholy" },
            { emoji: "🕯️", name: "Grief", page: 1, reflection: "Grief sangat pribadi dan sering membuat seseorang syok, kaku, lega, bersalah, atau seolah hidup tertahan. Model lima tahap dapat membantu sebagai gambaran, tetapi duka jarang bergerak lurus dari penyangkalan menuju penerimaan; bagi banyak orang ia datang dalam gelombang atau menjadi proses melingkar yang dipelajari untuk dijalani.", seeAlso: "Sadness" },
            { emoji: "🪨", name: "Despair", page: 4, reflection: "Despair berarti kehilangan harapan akan makna. Melalui kisah Sisyphus, Camus melihat sisi yang ganjil namun membebaskan: ketika pencarian makna yang pasti dilepaskan, manusia dapat menerima tindakannya sendiri, menyesuaikan diri dengan ketidakpastian, dan menemukan keringanan di tengah keadaan yang tampak sia-sia.", seeAlso: "Hopefulness, Sadness" }
        ]
    },
    heartache: {
        icon: "💔", color: "#3b82f6",
        title: { id: "Heartache (Luka Hati)", en: "Heartache", zh: "心痛" },
        items: [
            { emoji: "🌊", name: "Saudade", page: 8, reflection: "Saudade adalah kerinduan melankolis kepada seseorang, tempat, atau masa yang jauh maupun hilang. Di dalamnya ada harapan yang berbalut duka, kepasrahan, dan kenikmatan mengenang kegembiraan lama; dalam budaya Portugis, rasa pahit-manis ini mendapat bentuk khas melalui musik fado.", seeAlso: "Nostalgia, Melancholy" },
            { emoji: "🏠", name: "Nostalgia", page: 9, reflection: "Nostalgia mula-mula dipahami sebagai penyakit rindu kampung halaman yang dapat melemahkan tentara secara fisik. Kini ia lebih sering dipandang sebagai refleksi yang dapat memperkuat makna hidup, kehangatan, dan keterhubungan sosial—perubahan besar dari diagnosis berbahaya menjadi kegiatan batin yang menyehatkan.", seeAlso: "Melancholy, Regret" },
            { emoji: "🚪", name: "Awumbuk", page: 14, reflection: "Awumbuk adalah kehampaan setelah tamu pergi: rumah mendadak terlalu sunyi, luas, dan terasa diselimuti kabut. Masyarakat Baining di Papua Nugini memberi ruang tiga hari bagi rasa berat ini dan menggunakan ritual semangkuk air untuk menyerap suasana tersebut sebelum kehidupan sehari-hari dimulai kembali.", seeAlso: "Melancholy, Grief" },
            { emoji: "🍂", name: "Mono No Aware", page: 10, reflection: "Mono no aware adalah kesedihan tenang saat menyadari bahwa segala sesuatu akan berubah dan berakhir. Kesadaran akan kefanaan membuat kehilangan terasa lebih dekat, tetapi sekaligus menambah kedalaman pada kenikmatan dan keindahan—seperti pesona benda yang retak, tidak sempurna, atau bunga yang segera gugur.", seeAlso: "Grief" },
            { emoji: "⏳", name: "Boredom", page: 12, reflection: "Boredom memadukan rasa terjebak, pasif, dan tidak tertarik, disertai keinginan samar agar sesuatu berubah. Walau pernah dianggap kegagalan pribadi atau penyakit sosial, kebosanan juga membuka ruang bagi lamunan, imajinasi, dan kreativitas ketika rangsangan terus-menerus dihentikan sejenak.", seeAlso: "Acedia, Curiosity" },
            { emoji: "🌫️", name: "Melancholy", page: 13, reflection: "Melancholy pernah dipandang sebagai penyakit berbahaya sekaligus sumber kejeniusaan kreatif. Tradisi Renaisans membayangkannya sebagai kabut yang mengganggu pikiran dan melahirkan gambaran menakutkan, tetapi juga sebagai keadaan yang dapat membawa wawasan; bagi sebagian penulis, mempelajarinya menjadi penyebab sekaligus obat.", seeAlso: "Sadness" },
            { emoji: "🌧️", name: "Sadness", page: 11, reflection: "Sadness bukan sekadar gangguan yang harus segera disingkirkan. Ia membantu kita menyesuaikan diri dengan versi baru diri setelah kehilangan atau kekecewaan, melatih daya tahan, dan mengajarkan bahwa rasa sakit dapat ditanggung serta dijalani tanpa selalu dianggap sebagai penyakit.", seeAlso: "Grief" },
            { emoji: "👤", name: "Loneliness", page: 7, reflection: "Loneliness tidak sama dengan sekadar berada sendirian. Ia dapat lahir dari keterasingan di tengah kota, hilangnya komunitas, atau tekanan untuk menyesuaikan diri dengan harapan keluarga dan masyarakat; karena itu seseorang bisa merasa tersesat di dunia luas sekaligus terkurung oleh tuntutan di sekelilingnya.", seeAlso: "Emptiness, Dépaysement" }
        ]
    },
    bitterness: {
        icon: "🍋", color: "#b45309",
        title: { id: "Bitterness (Kepahitan)", en: "Bitterness", zh: "苦涩" },
        items: [
            { emoji: "↩️", name: "Regret", page: 21, reflection: "Regret memikat karena menghadirkan kemungkinan bahwa masa lalu seharusnya dapat berakhir berbeda. Ia terasa paling menyakitkan saat tindakan kita bertentangan dengan identitas yang ingin dipertahankan, namun ‘seandainya’ yang terus mengusik itu juga menyimpan bibit harapan dan kesempatan untuk belajar.", seeAlso: "Melancholy, Nostalgia" },
            { emoji: "🫶", name: "Remorse", page: 18, reflection: "Remorse tidak hanya soal menampilkan kesedihan atau meminta maaf. Dalam pemikiran abad pertengahan, penyesalan sejati adalah kemauan sadar untuk memperbaiki kerusakan dan menjalani proses pertanggungjawaban; karena itu ukuran utamanya bukan seberapa meyakinkan emosi terlihat, melainkan apakah perbaikan benar-benar dipikirkan dan dilakukan.", seeAlso: "Guilt" },
            { emoji: "🥀", name: "Self-pity", page: 19, reflection: "Self-pity membuat kita membelah diri: satu bagian menjadi sosok malang, sementara bagian lain mengasihaninya dari kejauhan. Sesaat ia dapat memberi kelegaan, tetapi bila menetap ia menyempitkan pandangan hingga perspektif orang lain hilang; tindakan baik kecil kepada orang lain dapat membantu membuka kembali rasa belas kasih, termasuk kepada diri sendiri.", seeAlso: "Relief, Empathy" },
            { emoji: "👀", name: "Envy", page: 20, reflection: "Envy sering ditakuti karena dapat berubah menjadi keinginan merusak atau kebencian terhadap orang yang memiliki apa yang kita inginkan. Namun rasa iri juga dapat menjadi antena emosional yang menunjukkan ketimpangan nyata; pilihan berikutnya adalah mengubah sinyal itu menjadi tindakan kreatif atau membiarkannya membusuk menjadi permusuhan.", seeAlso: "Jealousy, Hatred" },
            { emoji: "🛡️", name: "Jealousy", page: 16, reflection: "Jealousy memiliki sejarah panjang sebagai alasan yang dipakai untuk membenarkan kekerasan dalam hubungan, terutama melalui pandangan bahwa pasangan adalah milik seseorang. Rasa cemburu akan tetap muncul selama manusia menjalin hubungan, tetapi statusnya sebagai pembenaran bagi pengendalian dan kekerasan perlu ditolak.", seeAlso: "Envy" },
            { emoji: "🤢", name: "Disgust", page: 17, reflection: "Disgust tampak seperti alarm tubuh terhadap racun, tetapi pemicunya sering justru sesuatu yang dianggap ‘tidak pada tempatnya’. Rasa jijik mencakup reaksi fisik, ngeri terhadap tubuh, hingga mual moral, dan menjadi paling kuat ketika batas, kategori, atau makna yang kita andalkan terasa runtuh.", seeAlso: "Loathing, Shame" }
        ]
    },
    heat: {
        icon: "🔥", color: "#ef4444",
        title: { id: "Heat (Gejolak Panas)", en: "Heat", zh: "激烈情绪" },
        items: [
            { emoji: "😒", name: "Contempt", page: 25, reflection: "Contempt membuat kita merasa lebih tinggi dan dapat menutup hubungan dengan dingin. Namun ketika digunakan oleh kelompok yang tidak berkuasa, ejekan dan penghinaan juga dapat menjadi bentuk protes yang mengguncang privilese, menantang kebiasaan, dan membuka percakapan baru.", seeAlso: "Irritation" },
            { emoji: "⌛", name: "Impatience", page: 23, reflection: "Impatience lebih dalam daripada sekadar tidak suka menunggu. Kisah lahirnya gagasan kepribadian Tipe A menunjukkan bagaimana rasa mendesak terhadap waktu, ambisi, dan kebutuhan mengendalikan jadwal dapat menekan tubuh serta memaksa seseorang berhadapan dengan ketidakpastian masa depannya.", seeAlso: "Anticipation, Uncertainty" },
            { emoji: "🪵", name: "Irritation", page: 28, reflection: "Irritation adalah gesekan—baik pada kulit maupun dalam hubungan—yang membuat setiap kontak terasa berlebihan. Sejarah medis pernah menghubungkannya dengan kepekaan, stres, dan gejala tubuh; sampai kini rasa jengkel kerap dianggap tidak rasional, seolah menggaruknya hanya akan membuat luka semakin parah.", seeAlso: "Anger" },
            { emoji: "😠", name: "Anger", page: 27, reflection: "Anger mencakup dendam yang mendidih, ledakan singkat, hingga amukan keras. Ia dapat merusak tetapi juga mendorong tindakan dan perubahan; terkadang ledakannya berfungsi sebagai pengalih yang memberi kelegaan sementara dari emosi lain yang lebih menyakitkan dan sulit diakui.", seeAlso: "Resentment, Rage" },
            { emoji: "⚔️", name: "Vengefulness", page: 26, reflection: "Vengefulness muncul ketika harga diri terluka dan kita ingin memulihkan martabat dengan membalas. Walau sistem hukum berusaha menempatkan balas dendam sebagai tindakan liar, kisah-kisah budaya tetap menyimpan kekaguman pada ‘keadilan’ pribadi—menunjukkan konflik antara keinginan membalas dan tuntutan untuk menyerahkannya kepada aturan bersama.", seeAlso: "Hatred, Resentment, Satisfaction" },
            { emoji: "🚨", name: "Panic", page: 29, reflection: "Panic dahulu dikaitkan dengan teror mendadak dan daya irasional yang menular di dalam kerumunan. Kini penularannya dapat bergerak melalui rumor, media sosial, dan jaringan digital; rasa panik bukan hanya pengalaman individu, tetapi juga arus kolektif yang melampaui batas tubuh dan menyebarkan kekacauan.", seeAlso: "Empathy, Terror" },
            { emoji: "🌋", name: "Rage", page: 24, reflection: "Rage muncul dalam banyak label modern karena ledakan amarah semakin dianggap tidak dapat diterima. Namun kemarahan besar juga lahir ketika ketidakadilan sebenarnya dapat diubah tetapi dibiarkan; menghapusnya sepenuhnya dapat merampas kemampuan individu untuk menentang dan masyarakat untuk bergerak menuju perubahan.", seeAlso: "Anger, Contempt" }
        ]
    },
    possibility: {
        icon: "🌱", color: "#10b981",
        title: { id: "Possibility (Kemungkinan)", en: "Possibility", zh: "可能性" },
        items: [
            { emoji: "🎁", name: "Anticipation", page: 31, reflection: "Anticipation seperti mencicipi kesenangan sebelum waktunya: hadiah belum dibuka, kue belum matang, pertunjukan belum dimulai. Harapan bisa berakhir kecewa, tetapi selama jeda singkat itu, kenikmatan yang dibayangkan terasa utuh dan bahkan lebih kuat daripada peristiwa yang akhirnya terjadi.", seeAlso: "Curiosity, Hopefulness" },
            { emoji: "🕯️", name: "Hopefulness", page: 33, reflection: "Hopefulness tidak selalu dapat diproduksi dengan berpikir positif, dan tuntutan untuk terus optimistis dapat membuat rasa takut atau marah terasa terlarang. Harapan justru sering hadir ketika semua tindakan praktis telah dilakukan: kilatan kemungkinan yang mengakui betapa sedikit kendali kita, sekaligus keberanian untuk tetap rentan.", seeAlso: "Dread" },
            { emoji: "🧭", name: "Wanderlust", page: 34, reflection: "Wanderlust adalah tarikan gelisah menuju tempat yang belum pernah didatangi dan keinginan melihat dunia terasa baru lagi. Berakar pada tradisi berjalan kaki romantik dan gagasan tentang naluri nomaden, ia memadukan petualangan, penemuan, gerak menuju masa depan, serta gema masa lalu manusia yang selalu berpindah.", seeAlso: "Loneliness, Dépaysement" },
            { emoji: "🔎", name: "Curiosity", page: 35, reflection: "Curiosity adalah gatal untuk mengetahui lebih banyak, sumber penting kreativitas, penemuan, dan kemampuan manusia memahami satu sama lain. Namun dorongan yang sama dapat menyeberangi batas, mencuri rahasia, dan menghasilkan pengetahuan yang menyakitkan; rasa ingin tahu selalu membawa pertanyaan tentang hak kita untuk mengetahui.", seeAlso: "Shame" },
            { emoji: "🌀", name: "Uncertainty", page: 32, reflection: "Uncertainty memang sulit ditoleransi, tetapi keraguan dan ketakterdugaan adalah bagian dari arsitektur hidup. Di dalamnya ada kebebasan, kebetulan, dan kreativitas; kemampuan bertahan di tengah misteri tanpa terburu-buru memaksakan jawaban memungkinkan kita menjelajah dan menemukan hal baru.", seeAlso: "Anticipation, Curiosity, Terror" }
        ]
    },
    zen: {
        icon: "🧘", color: "#0891b2",
        title: { id: "Zen (Ketenangan)", en: "Zen", zh: "禅意" },
        items: [
            { emoji: "😮‍💨", name: "Relief", page: 42, reflection: "Relief tidak selalu berupa kebahagiaan sederhana; ia dapat bercampur dengan adrenalin, kecewa, atau tangis setelah penantian panjang. Kelegaan mungkin muncul bukan karena emosi benar-benar ‘dibuang’, melainkan karena perasaan akhirnya terlihat, didengar, dan dipahami oleh orang lain.", seeAlso: "Empathy, Grief" },
            { emoji: "🌿", name: "Calm", page: 37, reflection: "Calm sering dibayangkan sebagai keadaan normal yang ingin kita panggil kembali ketika takut, cinta, atau cemas menjadi terlalu kuat. Kisah eksperimen pengendalian emosi menunjukkan daya tarik sekaligus bahaya mimpi tentang tombol yang dapat mematikan gejolak—sebab ketenangan buatan juga menyentuh persoalan kendali atas tubuh dan perasaan.", seeAlso: "Anxiety, Fear" },
            { emoji: "🧸", name: "Comfort", page: 38, reflection: "Comfort bukan kelemahan, melainkan sesuatu yang menguatkan. Seperti benda lembut yang menjembatani dunia batin bayi dengan kenyataan, seni, ritual, doa, kebiasaan, dan kehadiran orang lain dapat memantulkan rasa sakit kita sehingga dunia luar terasa sedikit lebih mampu menerimanya.", seeAlso: "Relief" },
            { emoji: "✨", name: "Delight", page: 41, reflection: "Delight adalah ledakan ringan yang dipicu keindahan indrawi—warna bunga, embun, taman, atau detail kecil yang memikat. Ia terasa seperti rayuan bercahaya yang membuat tubuh dan batin sejenak terangkat, sehingga sesuatu yang sederhana dapat terasa sangat dicintai.", seeAlso: "Love, Euphoria" },
            { emoji: "🤝", name: "Empathy", page: 40, reflection: "Empathy adalah resonansi emosional yang membuat tubuh kita ikut meringis saat melihat rasa sakit orang lain. Ia dipuji sebagai jembatan yang dapat melarutkan konflik dan bahkan diajarkan sebagai keterampilan, tetapi sejarah juga mengingatkan bahwa keharuan mudah berubah menjadi pertunjukan sentimental tanpa tindakan nyata.", seeAlso: "Warm Glow, Fago" },
            { emoji: "🫧", name: "Warm Glow", page: 39, reflection: "Warm Glow adalah rasa hangat dan ringan setelah membantu orang lain. Penelitian tentang altruisme menunjukkan bahwa memberi dapat mengaktifkan jalur penghargaan otak seperti saat menerima, seolah tubuh menyediakan imbalan alami bagi perilaku yang menguatkan solidaritas dan kelangsungan hidup bersama.", seeAlso: "Empathy, Pride" }
        ]
    },
    bliss: {
        icon: "🌟", color: "#f59e0b",
        title: { id: "Bliss (Kebahagiaan)", en: "Bliss", zh: "极乐" },
        items: [
            { emoji: "🌈", name: "Euphoria", page: 49, reflection: "Euphoria dapat muncul bahkan di tengah penyakit berat atau menjelang kematian sebagai rasa sangat hidup, bebas, dan cerah. Karena bertentangan dengan anggapan kita tentang kapan kebahagiaan ‘seharusnya’ terjadi, pengalaman ini menantang batas antara gejala medis, faktor sosial, dan respons manusia yang sah terhadap kefanaan.", seeAlso: "Ecstasy" },
            { emoji: "🙂", name: "Satisfaction", page: 48, reflection: "Satisfaction berakar pada gagasan ‘cukup’ dan pemenuhan kewajiban. Dalam budaya abad kedelapan belas ia tampak dalam senyum yang tenang, ingin tahu, dan percaya diri—kepuasan karena menggunakan kemampuan dengan baik, meskipun senyum puas juga dapat terasa sombong, ironis, atau penuh kemenangan.", seeAlso: "Pride, Desire" },
            { emoji: "😄", name: "Cheerfulness", page: 46, reflection: "Cheerfulness dapat menular, tetapi tuntutan untuk selalu tersenyum adalah bentuk kerja emosional. Memaksakan keceriaan di tempat kerja mungkin mengubah perasaan sesaat, namun dalam jangka panjang dapat berhubungan dengan kelelahan, stres, kecemasan, dan keterasingan ketika ekspresi harus terus bertentangan dengan batin.", seeAlso: "Happiness" },
            { emoji: "☀️", name: "Happiness", page: 45, reflection: "Happiness telah menjadi industri yang diukur, dilacak, dan sering diperlakukan sebagai kewajiban. Mengganti obsesi itu dengan gagasan ‘flourishing’ menekankan keberanian, kasih, dan kepuasan jangka panjang, sekaligus mengembalikan kebahagiaan ke tempat yang wajar: emosi sementara yang kadang hadir dan kadang tidak.", seeAlso: "Cheerfulness" },
            { emoji: "❤️", name: "Love", page: 47, reflection: "Love sering membuat bahasa gagal. Ia hadir dalam napas, diam, genggaman tangan, dan tatapan, sementara satu kata yang sama harus menampung rasa kepada kekasih, keluarga, sahabat, Tuhan, atau hewan; ketidakmampuan menjelaskannya justru menjadi bagian dari pengalaman mencintai.", seeAlso: "Desire" },
            { emoji: "🤲", name: "Fago", page: 44, reflection: "Fago adalah konsep dari Ifaluk yang meleburkan belas kasih, kesedihan, dan cinta. Ia muncul saat kebutuhan orang yang kita sayangi terasa begitu besar dan hidup begitu rapuh sehingga kita terdorong merawat mereka sambil menyadari bahwa suatu hari kita akan kehilangan mereka.", seeAlso: "Grief" }
        ]
    },
    loathing: {
        icon: "🤢", color: "#65a30d",
        title: { id: "Loathing (Pergulatan Diri)", en: "Loathing", zh: "厌恶" },
        items: [
            { emoji: "🫥", name: "Guilt", page: 51, reflection: "Guilt adalah dengung rasa bersalah yang terus kembali, bahkan ketika kita belum tentu berbuat salah. Terlalu tenggelam dalam menyalahkan diri dapat menjadi cara menghindari tindakan; tantangannya bukan menghapus rasa bersalah, melainkan menimbang tanggung jawab secara lebih tepat dan hidup dengan sisa suaranya.", seeAlso: "Remorse" },
            { emoji: "😏", name: "Schadenfreude", page: 52, reflection: "Schadenfreude adalah kenikmatan rahasia atas kemalangan orang lain. Ia dapat lahir dari rasa aman karena bukan kita yang tertimpa, persaingan, iri, atau keinginan melihat orang lain dihukum; pengalaman itu mengingatkan bahwa kegagalan dan harapan yang kandas bukan hanya milik kita sendiri.", seeAlso: "Curiosity, Envy, Resentment" },
            { emoji: "🙈", name: "Shame", page: 53, reflection: "Shame berbeda dari rasa bersalah terhadap tindakan; ia menempel pada siapa kita dan mendorong keinginan untuk bersembunyi. Meski sering dianggap racun, mengakui pengalaman malu—termasuk bagian diri yang canggung atau tidak bermartabat—dapat menjadi unsur penting dalam membentuk identitas yang utuh.", seeAlso: "Humiliation" },
            { emoji: "🪞", name: "Litost", page: 54, reflection: "Litost adalah emosi Ceko yang mencampurkan malu, dendam, dan amarah ketika orang lain membuat kita melihat kemalangan diri sendiri. Dorongan untuk membuat si pelaku sama menderitanya dapat menjadi begitu kuat hingga penghancuran diri sendiri terasa tidak penting dibanding keberhasilan membalas.", seeAlso: "Vengefulness" },
            { emoji: "🫙", name: "Resentment", page: 55, reflection: "Resentment tumbuh ketika kemarahan tidak dapat diungkapkan karena takut akan balasan, lalu dipelihara sebagai penderitaan panjang dan fantasi pembalasan. Bekasnya dapat memperdalam jiwa, tetapi juga mengukir luka yang menetap dalam lanskap emosi seseorang.", seeAlso: "Anger, Litost" },
            { emoji: "📉", name: "Disappointment", page: 56, reflection: "Disappointment terjadi ketika fantasi tentang diri dan dunia ditusuk oleh kenyataan. Melepaskan gambaran ideal dapat membantu perkembangan dan hubungan yang lebih autentik, tetapi kehilangan itu tidak selalu langsung menghasilkan kebenaran—sering kali yang tersisa lebih dahulu adalah kehampaan, kebingungan, dan rasa dikhianati oleh diri sendiri.", seeAlso: "Hopefulness" }
        ]
    },
    enjoyment: {
        icon: "🎈", color: "#ec4899",
        title: { id: "Enjoyment (Kenikmatan)", en: "Enjoyment", zh: "愉悦" },
        items: [
            { emoji: "🕊️", name: "Ecstasy", page: 62, reflection: "Ecstasy adalah kenikmatan yang melumpuhkan sekaligus terasa membebaskan, seolah dunia terbuka dan batas diri menghilang. Pengalaman yang dahulu menjadi inti praktik mistik kemudian dijelaskan sebagai gejala neurologis, memperlihatkan pergeseran dari makna spiritual menuju pembacaan tubuh dan otak.", seeAlso: "Euphoria, Love" },
            { emoji: "⚡", name: "Excitement", page: 63, reflection: "Excitement dipahami sebagai emosi yang menggerakkan: mata terang, pikiran cepat, momentum, dan rasa tak terkalahkan. Penemuan adrenalin mengubah ceritanya menjadi respons kimiawi tubuh terhadap krisis, menghubungkan pengalaman mendesak dan berenergi dengan kerja hormon.", seeAlso: "Anticipation, Ilinx" },
            { emoji: "🧲", name: "Desire", page: 61, reflection: "Desire dapat tertuju pada orang, benda, ketenaran, atau sesuatu yang sulit dinamai. Kerinduan terasa dekat dengan ketakutan karena dapat mengguncang hidup, melukai orang lain, dan berakhir kecewa; ia juga membuka rasa malu karena mengakui bahwa kita kekurangan sesuatu yang belum dapat dimiliki.", seeAlso: "Fear, Disappointment, Shame" },
            { emoji: "😁", name: "Glee", page: 60, reflection: "Glee tidak sepenuhnya polos: sejarah katanya memuat permainan, ejekan, dan kegembiraan nakal atas keberuntungan sendiri. Gerakan menggosok tangan dapat menandakan antisipasi yang menyenangkan, tetapi budaya panggung juga mengubahnya menjadi isyarat penjahat yang menyembunyikan niat buruk.", seeAlso: "Schadenfreude" },
            { emoji: "😲", name: "Surprise", page: 59, reflection: "Surprise menunjukkan bahwa banyak emosi muncul tanpa izin. Eksperimen Darwin dengan ular menegaskan bahwa tubuh dapat bereaksi lebih cepat daripada tekad sadar, sehingga kita bukan sepenuhnya pengemudi perasaan sendiri, melainkan juga penumpang dari warisan evolusi yang jauh lebih tua.", seeAlso: "Fear" },
            { emoji: "🎢", name: "Ilinx", page: 58, reflection: "Ilinx adalah ‘panik yang nikmat’: sensasi berputar, jatuh, kehilangan kendali, atau menimbulkan kekacauan kecil yang terasa menggairahkan. Dari tarian trans hingga roller coaster, ia memberi jalan untuk mengguncang keteraturan dan merasakan realitas alternatif dalam dosis yang relatif aman.", seeAlso: "Dépaysement, Ecstasy" }
        ]
    },
    ego: {
        icon: "👑", color: "#a855f7",
        title: { id: "Ego (Diri & Harga Diri)", en: "Ego", zh: "自我" },
        items: [
            { emoji: "😳", name: "Embarrassment", page: 70, reflection: "Embarrassment menandakan bahwa kita menyadari telah melanggar aturan sosial, dan kemerahan wajah mungkin membantu menjaga keseimbangan kelompok. Orang yang mudah malu bahkan cenderung lebih altruistis, meski rasa canggung kadang justru menghambat tindakan baik karena kita takut menarik perhatian.", seeAlso: "Shame" },
            { emoji: "🦁", name: "Courage", page: 69, reflection: "Courage bukan hanya keberanian menghadapi bahaya, melainkan keteguhan, kesabaran menanggung sakit, tanggung jawab atas tindakan, dan harapan yang kuat. Dalam kehidupan modern ia juga tampak ketika seseorang mengambil risiko sosial, menentang ketidakadilan, mempertahankan keyakinan, atau hidup dengan jujur setelah trauma.", seeAlso: "Fear, Hopefulness" },
            { emoji: "🎯", name: "Confidence", page: 68, reflection: "Confidence memikat, tetapi semboyan ‘pura-pura sampai berhasil’ dapat membuat keyakinan diri menggantikan kompetensi dan melemahkan kepercayaan pada kemampuan yang nyata. Terlalu banyak percaya diri juga menghambat perbaikan; keraguan, kebingungan, dan ketidakpastian yang tenang kadang lebih berguna.", seeAlso: "Feeling Like a Fraud, Uncertainty" },
            { emoji: "🎭", name: "Feeling Like a Fraud", page: 67, reflection: "Feeling like a fraud adalah pengalaman takut bahwa keberhasilan terjadi karena kebetulan dan suatu hari kita akan terbongkar. Dikenal sebagai imposter phenomenon, rasa ini banyak dialami orang berprestasi, profesional generasi pertama, atau mereka yang berganti karier, dan dapat dipahami sebagai rasa sakit pertumbuhan yang perlu ditanggung, bukan bukti ketidakmampuan.", seeAlso: "Confidence" },
            { emoji: "🏅", name: "Pride", page: 65, reflection: "Pride dapat membuat kita berani terlihat dan merayakan pencapaian, tetapi juga membutakan terhadap batas diri. Kebanggaan yang rapuh muncul sebagai sikap defensif: menolak bantuan, enggan meminta maaf, dan tak sanggup mengakui kekurangan; justru pengakuan atas diri yang tidak lengkap membuat harga diri lebih jujur.", seeAlso: "Humiliation" },
            { emoji: "🪶", name: "Humiliation", page: 66, reflection: "Humiliation dahulu dekat dengan latihan kerendahan hati, tetapi kini lebih sering berarti hukuman dan perendahan yang tidak diinginkan. Di balik perbedaan itu, ajakan untuk rendah hati tetap penting: keberhasilan dipengaruhi kelas, gender, ras, keberuntungan, dan bantuan orang lain, bukan kerja pribadi semata.", seeAlso: "Pride, Shame" }
        ]
    },
    angst: {
        icon: "🌪️", color: "#7c3aed",
        title: { id: "Angst (Kecemasan)", en: "Angst", zh: "焦虑" },
        items: [
            { emoji: "🕳️", name: "L’Appel du Vide", page: 76, reflection: "L’appel du vide atau ‘panggilan kehampaan’ adalah dorongan menakutkan untuk melompat dari ketinggian atau mendekati bahaya, meski kita tidak ingin melakukannya. Sensasi ini seperti permainan pikiran yang menguji kedekatan bahaya dan mengguncang kepercayaan bahwa naluri kita selalu dapat diandalkan.", seeAlso: "Terror" },
            { emoji: "💭", name: "Worry", page: 77, reflection: "Worry tidak selalu harus dimusnahkan. Kekhawatiran yang berlebihan memang melelahkan, tetapi kadar yang lebih ringan dapat menjadi proses imajinatif untuk menata masalah, menemukan pilihan baru, dan mempersiapkan diri; ada alasan untuk menerima sebagian kekhawatiran sebagai fungsi, bukan semata gangguan.", seeAlso: "Dread, Anxiety" },
            { emoji: "🧳", name: "Dépaysement", page: 72, reflection: "Dépaysement adalah rasa ‘terlepas dari negara’ saat berada di tempat asing. Ia dapat membuat kita frustrasi, tersesat, dan tidak pada tempatnya, tetapi juga memberi anonimitas, kebebasan, serta kegembiraan yang membuat petualangan tak terduga terasa mungkin dan dunia seolah baru kembali.", seeAlso: "Wanderlust, Ilinx" },
            { emoji: "🏃", name: "Fear", page: 73, reflection: "Fear adalah respons purba yang membantu tubuh melawan atau lari dari ancaman, tetapi masyarakat modern juga terus memproduksinya melalui peringatan risiko, berita, iklan, dan retorika politik. Upaya membuat hidup sepenuhnya aman dapat justru meningkatkan kesadaran akan kerentanan dan membuat kita lebih mudah diarahkan oleh ancaman.", seeAlso: "Courage, Panic, Terror" },
            { emoji: "🫨", name: "Anxiety", page: 78, reflection: "Anxiety berbeda dari takut atau khawatir yang memiliki sebab jelas; ia berputar di sekitar masalah biasa dan mengubahnya menjadi kemungkinan bencana. Kierkegaard melihat angst sebagai respons wajar ketika menyadari hidup tidak ditentukan sebelumnya—bukan hanya sesuatu yang harus disembuhkan, tetapi juga tanda dari kebebasan yang menakutkan.", seeAlso: "Uncertainty, Worry" },
            { emoji: "🥶", name: "Dread", page: 74, reflection: "Dread adalah kegelisahan dingin terhadap ancaman yang mendekat tetapi sulit dikendalikan, berbeda dari takut pada bahaya langsung. Rumor dan arus informasi membuatnya mudah tumbuh sebagai dengung latar kehidupan modern, meninggalkan kita dalam ketidakberdayaan sambil berharap bahaya tidak datang terlalu dekat.", seeAlso: "Panic" },
            { emoji: "🧊", name: "Terror", page: 75, reflection: "Terror dapat membekukan tubuh hingga pertahanan terasa terputus dan tindakan menjadi mustahil. Jejak puitisnya pernah memadukan rasa gentar dengan kekaguman terhadap sesuatu yang agung, tetapi dalam bahasa politik modern kelumpuhan itu dapat membuat orang merasa tak berdaya menghadapi ancaman kabur dan menerima pembalasan atas namanya.", seeAlso: "Dread, Fear" }
        ]
    }
};

const emotionTranslations = {
    en: {
        "Żal": "Żal is melancholy for an irretrievable loss. It shifts between resignation and rebellion, blending disappointment, regret, and anger over what is gone forever.",
        "Hatred": "Hatred is explored through hate-crime debates: can an emotion be measured or punished, and how does it turn prejudice into humiliation and violence?",
        "Acedia": "Acedia was a noonday spiritual crisis marked by listlessness, irritation, emptiness, and despair. Its symptoms later fed ideas of melancholy, anxiety, depression, and sloth.",
        "Grief": "Grief is deeply personal and may bring shock, numbness, relief, or guilt. It rarely moves through fixed stages, arriving instead in waves that we learn to live with.",
        "Despair": "Despair is the loss of hope that life has meaning. Camus saw a strange freedom in accepting uncertainty and continuing to act without guaranteed purpose.",
        "Saudade": "Saudade is a bittersweet longing for someone, somewhere, or some time that is distant or lost, mixing hope, grief, resignation, and remembered joy.",
        "Nostalgia": "Nostalgia was once treated as a dangerous illness of homesickness. Today, remembering the past can strengthen meaning, warmth, and social connection.",
        "Awumbuk": "Awumbuk is the heavy emptiness left after guests depart. The Baining people give this fog-like feeling time and ritual before ordinary life resumes.",
        "Mono No Aware": "Mono no aware is the gentle sorrow of knowing everything changes and ends. Impermanence deepens both anticipated loss and the beauty of the present.",
        "Boredom": "Boredom combines feeling trapped, inactive, and uninterested. Yet when constant stimulation stops, it can open space for daydreaming, imagination, and creativity.",
        "Melancholy": "Melancholy has been viewed as both a dangerous illness and a source of creative insight—a mental fog that may torment the mind while sharpening perception.",
        "Sadness": "Sadness is not merely a problem to remove. It helps us adjust after loss, tolerate pain, and develop the resilience needed to live through change.",
        "Loneliness": "Loneliness is more than being alone. It can arise in crowded cities or from feeling trapped by family and social expectations.",
        "Regret": "Regret imagines how the past might have ended differently. Although painful, its persistent ‘what if’ can also contain learning and a small seed of hope.",
        "Remorse": "Remorse is more than appearing sorry. It is a deliberate willingness to repair harm, accept responsibility, and follow through with meaningful amends.",
        "Self-pity": "Self-pity lets us watch and comfort ourselves from a distance. If it lingers, it narrows perspective; kindness toward others can reopen compassion for ourselves.",
        "Envy": "Envy can decay into hostility, but it can also signal a real inequality. We choose whether to turn that signal into destruction or constructive action.",
        "Jealousy": "Jealousy has often been used to justify control and violence in relationships. The feeling may be human, but it never excuses harming another person.",
        "Disgust": "Disgust is not only an alarm against poison. It also appears when boundaries and meanings break down, producing physical, visual, or moral revulsion.",
        "Contempt": "Contempt creates a sense of superiority and may close relationships. In the hands of the powerless, however, ridicule can challenge privilege and start change.",
        "Impatience": "Impatience is more than disliking delay. Time pressure, ambition, and the need for control can strain the body and expose fear of an uncertain future.",
        "Irritation": "Irritation is friction in the body or in relationships, making every contact feel excessive. Scratching at it carelessly can make the discomfort worse.",
        "Anger": "Anger ranges from simmering resentment to violent outbursts. It can damage, energize action, or temporarily hide emotions that feel more painful to face.",
        "Vengefulness": "Vengefulness seeks to restore wounded dignity through retaliation. It reveals the tension between private revenge and justice governed by shared rules.",
        "Panic": "Panic can spread beyond an individual through crowds, rumors, social media, and digital networks, becoming a contagious current of collective confusion.",
        "Rage": "Rage is increasingly treated as unacceptable, yet it often erupts when change is possible but injustice is allowed to continue. It can fuel defiance and reform.",
        "Anticipation": "Anticipation tastes pleasure before it arrives. Even when reality disappoints, the imagined moment can feel complete and sublime while we wait.",
        "Hopefulness": "Hope cannot always be manufactured through positive thinking. It often appears after practical options are exhausted, revealing both vulnerability and courage.",
        "Wanderlust": "Wanderlust is the restless pull toward unfamiliar places and a desire to see the world become new again through movement, discovery, and adventure.",
        "Curiosity": "Curiosity drives creativity and discovery, but it can also cross boundaries and steal secrets. It always raises the question of what we have a right to know.",
        "Uncertainty": "Uncertainty is difficult, but it also holds freedom, chance, and creativity. Remaining with mystery can make genuine exploration possible.",
        "Relief": "Relief may mix with tears, adrenaline, or disappointment. It often comes when feelings are finally seen, heard, and understood rather than simply expelled.",
        "Calm": "Calm is the state we long to recover when emotions become overwhelming. Attempts to manufacture it also raise questions about control over feeling and the body.",
        "Comfort": "Comfort is not weakness but support. Art, ritual, familiar objects, and other people can mirror inner pain and make the outside world feel bearable.",
        "Delight": "Delight is a light burst sparked by sensory beauty—a color, garden, or tiny detail that briefly lifts body and mind.",
        "Empathy": "Empathy is emotional resonance with another person’s pain. It can build bridges, but feeling moved matters little if it never becomes genuine action.",
        "Warm Glow": "Warm Glow is the pleasure that follows helping someone. Giving can activate the brain’s reward pathways and reinforce solidarity.",
        "Euphoria": "Euphoria can appear even during severe illness as an intense sense of freedom and aliveness, challenging assumptions about where happiness belongs.",
        "Satisfaction": "Satisfaction grows from a sense of ‘enough’ and using one’s abilities well, though its smile can also appear triumphant, ironic, or smug.",
        "Cheerfulness": "Cheerfulness can spread, but compulsory smiling is emotional labor. Sustaining it against one’s true feelings may lead to stress, burnout, and alienation.",
        "Happiness": "Happiness is often measured and treated as an obligation. It is healthier to remember that it is a temporary emotion, present sometimes and absent at others.",
        "Love": "Love often exceeds language. It lives in silence, breath, touch, and glances while one small word carries devotion to partners, family, friends, gods, and animals.",
        "Fago": "Fago is an Ifaluk emotion blending compassion, sadness, and love—the urge to care for someone while knowing how fragile and temporary life is.",
        "Guilt": "Guilt can hum in the background even when fault is unclear. The task is not to erase it, but to judge responsibility honestly and act where needed.",
        "Schadenfreude": "Schadenfreude is secret pleasure at another’s misfortune, fueled by safety, rivalry, envy, resentment, or a wish to see someone punished.",
        "Shame": "Shame attaches not only to what we did but to who we believe we are. Acknowledging it can help build a fuller identity instead of hiding forever.",
        "Litost": "Litost blends shame, resentment, and fury after another person exposes our misery. Revenge may become so consuming that self-destruction seems unimportant.",
        "Resentment": "Resentment grows when anger cannot be expressed and is preserved through long suffering and fantasies of revenge, leaving deep emotional scars.",
        "Disappointment": "Disappointment arrives when reality punctures an idealized self or future. Growth may follow, but emptiness and confusion often come first.",
        "Ecstasy": "Ecstasy is paralyzing pleasure that feels like freedom and the disappearance of boundaries. What was once mystical is now often explained neurologically.",
        "Excitement": "Excitement brings bright eyes, fast thoughts, momentum, and energy. The discovery of adrenaline linked this urgent feeling to the body’s chemistry.",
        "Desire": "Desire may target a person, object, status, or dream. It feels close to fear because longing exposes what we lack and risks shame or disappointment.",
        "Glee": "Glee is not entirely innocent: it combines playful delight with mockery and the mischievous thrill of expecting good fortune.",
        "Surprise": "Surprise shows that emotion can rise before conscious choice. Our bodies often react as passengers of an evolutionary inheritance older than reason.",
        "Ilinx": "Ilinx is pleasurable panic—the thrill of spinning, falling, losing control, or creating small chaos in a relatively safe way.",
        "Embarrassment": "Embarrassment signals awareness of a broken social rule and can support cooperation, though fear of attention sometimes prevents generous action.",
        "Courage": "Courage includes endurance, responsibility, patience, and hope—not only facing physical danger but also risking rejection to resist injustice or live honestly.",
        "Confidence": "Confidence attracts, but pretending can replace competence and weaken trust in real ability. Quiet doubt and uncertainty may support growth better.",
        "Feeling Like a Fraud": "Feeling like a fraud is the fear that success happened by accident and exposure is inevitable. It can be a painful sign of growth rather than incompetence.",
        "Pride": "Pride can celebrate achievement or blind us to our limits. Brittle pride rejects help and apology, while honest pride accepts an incomplete self.",
        "Humiliation": "Humiliation once stood close to humility but now suggests punishment and degradation. Healthy humility recognizes that success also depends on luck and others.",
        "L’Appel du Vide": "Walking along a high cliff path; you are gripped by a terrifying urge to leap. As an express train hurtles into view, you itch to fling yourself in front of it. People talk of a fear of heights, but in truth anxieties about precipices are often less to do with falling than the horrifying compulsion to jump … In Alfred Hitchcock’s Vertigo (1958), what paralyses James Stewart as he chases the suicidal Kim Novak up those rickety stairs is not dizziness. Hitchcock’s clever camera trick which makes the bottom of the stairwell swim into the foreground, also makes its vanishing point alluring. Stewart is terrified he might just give in.\n\nThe French have a name for this unnerving impulse: l’appel du vide, ‘the call of the void’. Perhaps it is a kind of terrifying game the mind plays, a test serving to remind us how close danger is. But most of all, as Jean-Paul Sartre recognised, l’appel du vide creates an unnerving, shaky sensation of not being able to trust one’s own instincts. And the fear that our emotions, with their impish irrational impulses, might be capable of leading us very far astray.",
        "Worry": "Worry is not always harmful. In moderate form it can reorganize problems, reveal options, and prepare us for what may happen.",
        "Dépaysement": "Dépaysement is the disorientation of being in a foreign place. It can unsettle us while also offering anonymity, freedom, and unexpected adventure.",
        "Fear": "Fear is an ancient fight-or-flight ally, yet modern warnings, media, advertising, and politics continually manufacture new threats around it.",
        "Anxiety": "Anxiety circles ordinary problems and turns them into disasters without a clear cause. Kierkegaard saw it as evidence of the frightening freedom of an undetermined life.",
        "Dread": "Dread is cold unease before an approaching threat we cannot control. Rumor and constant information help it become a background hum.",
        "Terror": "Terror can freeze thought and action. Faced with vague, overwhelming threats, people may feel powerless and let others seek retaliation in their name."
    },
    zh: {
        "Żal": ["哀恸（Żal）", "Żal 是对无法挽回之失的忧郁。它在顺从与反抗之间摆动，混合失望、遗憾和对永远失去之物的愤怒。"],
        "Hatred": ["仇恨", "仇恨引出一个难题：情绪能否被衡量或惩罚？它又如何把偏见转化为羞辱、不宽容与暴力？"],
        "Acedia": ["倦怠（Acedia）", "Acedia 曾指正午出现的精神危机，从懒散和烦躁发展为空虚与绝望，后来与忧郁、焦虑、抑郁和懒惰等概念相连。"],
        "Grief": ["哀伤", "哀伤非常个人化，可能带来震惊、麻木、宽慰或内疚。它很少依照固定阶段前进，而常以反复的波浪出现。"],
        "Despair": ["绝望", "绝望是失去对生命意义的希望。加缪认为，接受不确定性并在没有保证的意义下继续行动，反而可能带来一种自由。"],
        "Saudade": ["乡愁（Saudade）", "Saudade 是对遥远或失去的人、地方与时光的苦甜思念，融合希望、悲伤、释然和往日欢乐。"],
        "Nostalgia": ["怀旧", "怀旧曾被视为危险的思乡病。如今，回忆过去也被认为能增强生命意义、温暖感与社会联系。"],
        "Awumbuk": ["离客后的空虚（Awumbuk）", "Awumbuk 是客人离去后留下的沉重空虚。巴宁人会给这种雾般的感受留出时间和仪式，然后再恢复日常生活。"],
        "Mono No Aware": ["物哀", "物哀是意识到万物都会变化、消逝时产生的温柔悲伤。无常让失去更清晰，也让当下之美更深刻。"],
        "Boredom": ["无聊", "无聊结合了受困、停滞与失去兴趣，但当持续刺激停止时，它也能为幻想、想象和创造力打开空间。"],
        "Melancholy": ["忧郁", "忧郁曾同时被看作危险疾病与创造洞见的来源：它像精神迷雾，既折磨心灵，也可能让感知更敏锐。"],
        "Sadness": ["悲伤", "悲伤并非必须立即消除的问题。它帮助我们适应失去、承受痛苦，并培养面对变化的韧性。"],
        "Loneliness": ["孤独", "孤独不只是独处。它也会出现在拥挤城市中，或来自被家庭与社会期待困住的感受。"],
        "Regret": ["后悔", "后悔想象过去本可拥有不同结局。它虽然痛苦，但反复出现的“如果”也包含学习与一丝希望。"],
        "Remorse": ["悔恨", "悔恨不只是看起来难过，而是主动修复伤害、承担责任，并真正完成补偿。"],
        "Self-pity": ["自怜", "自怜让我们从远处观看并安慰自己。若长期停留其中，视野会变窄；善待他人可重新打开对自己的慈悲。"],
        "Envy": ["羡慕", "羡慕可能腐化为敌意，也可能提示真实的不平等。我们可以选择把它转为破坏，或建设性的行动。"],
        "Jealousy": ["妒忌", "妒忌常被用来为关系中的控制与暴力辩护。感受也许普遍存在，却永远不能成为伤害他人的理由。"],
        "Disgust": ["厌恶", "厌恶不只是对毒物的警报；当边界与意义崩塌时，它也会表现为身体、视觉或道德上的排斥。"],
        "Contempt": ["蔑视", "蔑视制造优越感并可能关闭关系；但对弱势者而言，嘲讽也能挑战特权并开启改变。"],
        "Impatience": ["不耐烦", "不耐烦不只是讨厌等待。时间压力、野心和控制欲会给身体带来负担，也暴露对未来不确定性的恐惧。"],
        "Irritation": ["烦躁", "烦躁是身体或关系中的摩擦，让每次接触都显得过量；若处理不慎，越抓挠反而越不舒服。"],
        "Anger": ["愤怒", "愤怒从隐忍怨气到猛烈爆发不等。它可能伤害人、推动行动，也可能暂时掩盖更难面对的痛苦。"],
        "Vengefulness": ["报复心", "报复心试图通过反击恢复受伤的尊严，揭示私人复仇与共同规则下的正义之间的冲突。"],
        "Panic": ["恐慌", "恐慌会通过人群、谣言、社交媒体与数字网络传播，从个人体验变成集体混乱。"],
        "Rage": ["暴怒", "暴怒常在不公本可改变却被放任时爆发。它固然危险，也可能成为反抗和改革的动力。"],
        "Anticipation": ["期待", "期待让我们提前品尝尚未到来的快乐。即使现实令人失望，等待中的想象也可能完整而强烈。"],
        "Hopefulness": ["希望", "希望无法总靠积极思考制造。它常在实际选择用尽后出现，同时显露脆弱与勇气。"],
        "Wanderlust": ["漫游欲", "漫游欲是前往陌生地方的躁动牵引，希望借由移动、发现与冒险让世界重新变得新鲜。"],
        "Curiosity": ["好奇", "好奇推动创造和发现，也可能越界、窃取秘密。它始终追问：我们究竟有权知道多少？"],
        "Uncertainty": ["不确定", "不确定令人不安，却也蕴含自由、偶然与创造力。容纳未知，才可能真正探索。"],
        "Relief": ["如释重负", "宽慰可能混合泪水、肾上腺素或失望。它常来自感受终于被看见、倾听与理解。"],
        "Calm": ["平静", "平静是情绪过强时我们渴望回到的状态；人为制造平静也会引出谁能控制身体与感受的问题。"],
        "Comfort": ["安慰", "安慰不是软弱，而是支持。艺术、仪式、熟悉物品和他人能映照内在痛苦，使外部世界变得可承受。"],
        "Delight": ["欣喜", "欣喜是由色彩、花园或微小细节等感官之美点燃的轻盈愉悦，短暂抬起身心。"],
        "Empathy": ["共情", "共情是对他人痛苦的情绪共鸣。它能搭建桥梁，但若不转化为真实行动，感动本身并不够。"],
        "Warm Glow": ["助人暖意", "助人暖意是帮助他人后的温暖快乐。给予会启动大脑的奖赏通路，并强化团结感。"],
        "Euphoria": ["欣快", "欣快甚至会在重病中出现，带来强烈的自由与鲜活感，挑战我们对幸福应在何时出现的想象。"],
        "Satisfaction": ["满足", "满足来自“已经足够”和妥善运用能力的感受，但满足的微笑也可能显得得意、讽刺或自满。"],
        "Cheerfulness": ["开朗", "开朗会感染他人，但被迫微笑是一种情绪劳动。长期违背真实感受，可能造成压力、倦怠与疏离。"],
        "Happiness": ["幸福", "幸福常被量化并当作义务。更健康的理解是：它只是暂时情绪，有时出现，有时缺席。"],
        "Love": ["爱", "爱常超越语言，存在于沉默、呼吸、触碰和目光中，而一个字承载着对伴侣、家人、朋友、神与动物的深情。"],
        "Fago": ["悲悯之爱（Fago）", "Fago 是伊法卢克文化中融合慈悲、悲伤与爱的情绪：照顾所爱之人，同时知道生命脆弱而短暂。"],
        "Guilt": ["内疚", "即使责任不明，内疚仍可能持续低鸣。重点不是消灭它，而是诚实判断责任并在需要时行动。"],
        "Schadenfreude": ["幸灾乐祸", "幸灾乐祸是对他人不幸的秘密快感，可能来自安全感、竞争、羡慕、怨恨或惩罚对方的愿望。"],
        "Shame": ["羞耻", "羞耻不仅指向做过的事，也黏附于我们相信自己是谁。承认它能帮助建立更完整的身份。"],
        "Litost": ["屈辱之痛（Litost）", "Litost 是他人揭开自身悲惨时出现的羞耻、怨恨与愤怒，报复甚至会重要到压过自我毁灭。"],
        "Resentment": ["怨恨", "怨恨在愤怒无法表达时生长，并通过长期受苦与复仇幻想保存下来，留下深刻的情绪伤痕。"],
        "Disappointment": ["失望", "失望在现实刺破理想化的自我或未来时到来。成长也许随后发生，但空虚与困惑往往先出现。"],
        "Ecstasy": ["狂喜", "狂喜是令人近乎瘫痪的快乐，仿佛获得自由并失去边界；昔日的神秘体验如今常被神经学解释。"],
        "Excitement": ["兴奋", "兴奋带来明亮目光、快速思绪、动力与能量；肾上腺素的发现把这种急迫感与身体化学联系起来。"],
        "Desire": ["欲望", "欲望可指向人、物、地位或梦想。渴望暴露我们缺少什么，因此靠近恐惧、羞耻与失望。"],
        "Glee": ["欢欣", "欢欣并不完全无辜，它把游戏般的快乐、嘲弄和等待好运的顽皮兴奋结合在一起。"],
        "Surprise": ["惊讶", "惊讶说明情绪能在意识选择之前升起。身体常像古老进化遗产的乘客，比理性更早反应。"],
        "Ilinx": ["眩晕之乐（Ilinx）", "Ilinx 是愉悦的恐慌：旋转、坠落、失控或在相对安全的范围内制造小混乱的刺激。"],
        "Embarrassment": ["尴尬", "尴尬表示我们意识到违反社会规则，能促进合作；但害怕引人注意有时也会阻止善意行动。"],
        "Courage": ["勇气", "勇气包含忍耐、责任、耐心与希望，不只面对身体危险，也包括冒着被排斥的风险反抗不公、诚实生活。"],
        "Confidence": ["自信", "自信很有吸引力，但假装自信可能取代能力并削弱真实信任。安静的怀疑与不确定有时更能促进成长。"],
        "Feeling Like a Fraud": ["冒牌者感", "冒牌者感是害怕成功纯属偶然、自己终将被揭穿。它可能是痛苦的成长信号，而非无能的证据。"],
        "Pride": ["自豪", "自豪能庆祝成就，也会让人看不见局限。脆弱的自豪拒绝帮助与道歉，诚实的自豪则接纳不完整的自己。"],
        "Humiliation": ["羞辱", "羞辱曾接近谦卑，如今更多意味着惩罚与贬低。健康的谦卑承认成功也依赖运气和他人。"],
        "L’Appel du Vide": ["虚空召唤", "虚空召唤是突然靠近危险的可怕冲动，它动摇我们对自身本能的信任。"],
        "Worry": ["担忧", "担忧并非总是有害。适度担忧能重新整理问题、发现选择，并帮助我们为可能发生的事做准备。"],
        "Dépaysement": ["异乡感", "异乡感是在陌生地方产生的失序感。它令人不安，也可能带来匿名、自由和意外冒险。"],
        "Fear": ["恐惧", "恐惧是古老的战斗或逃跑机制，但现代警告、媒体、广告与政治也不断制造新的威胁。"],
        "Anxiety": ["焦虑", "焦虑围绕日常问题盘旋并把它们变成灾难。克尔凯郭尔把它视为未被预定的人生所带来的可怕自由。"],
        "Dread": ["厄运感", "厄运感是面对无法控制、正在逼近的威胁时产生的冰冷不安；谣言与持续信息使它成为背景低鸣。"],
        "Terror": ["惊骇", "惊骇会冻结思想和行动。面对模糊而压倒性的威胁，人可能感到无力，并让他人以自己的名义报复。"]
    }
};

function translateEmotionItem(item, lang) {
    if (lang === "id") return item;
    if (lang === "en") return {
        ...item,
        reflection: globalThis.FULL_ESSAYS_EN?.[item.name] || emotionTranslations.en[item.name] || item.reflection
    };
    const translation = emotionTranslations.zh[item.name];
    return translation ? { ...item, name: translation[0], reflection: translation[1] } : item;
}

const emotionDB = Object.fromEntries(
    Object.entries(pdfEmotionGroups).map(([key, category]) => [key, {
        ...category,
        subs: {
            id: category.items,
            en: category.items.map(item => translateEmotionItem(item, "en")),
            zh: category.items.map(item => translateEmotionItem(item, "zh"))
        }
    }])
);
