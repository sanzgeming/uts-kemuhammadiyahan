// 1. Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

mobileMenuBtn.addEventListener('click', () => {
    const isExpanded = mobileMenu.classList.toggle('hidden');
    if (!isExpanded) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-xmark');
    } else {
        menuIcon.classList.remove('fa-xmark');
        menuIcon.classList.add('fa-bars');
    }
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuIcon.classList.remove('fa-xmark');
        menuIcon.classList.add('fa-bars');
    });
});

// 2. Koordinat Tetap Masjid Ar-Royyan (Siwalanpanji, Buduran, Sidoarjo)
const MASJID_LAT = -7.4286;
const MASJID_LNG = 112.7214;

let prayerSchedule = [
    { id: 'card-subuh', name: 'SUBUH', hour: 3, min: 47, startMinutes: 3 * 60 + 47 },
    { id: 'card-terbit', name: 'TERBIT', hour: 4, min: 59, startMinutes: 4 * 60 + 59 },
    { id: 'card-zuhur', name: 'ZUHUR', hour: 11, min: 16, startMinutes: 11 * 60 + 16 },
    { id: 'card-ashar', name: 'ASHAR', hour: 14, min: 39, startMinutes: 14 * 60 + 39 },
    { id: 'card-maghrib', name: 'MAGHRIB', hour: 17, min: 30, startMinutes: 17 * 60 + 30 },
    { id: 'card-isya', name: 'ISYA', hour: 18, min: 45, startMinutes: 18 * 60 + 45 },
];

const inactiveCardClasses = [
    'bg-emerald-950/40', 'border', 'border-emerald-700/30', 'backdrop-blur-sm',
    'shadow-sm', 'hover:bg-emerald-900/40'
];

const activeCardClasses = [
    'bg-gradient-to-b', 'from-emerald-400', 'to-emerald-600',
    'text-slate-950', 'border-2', 'border-emerald-200',
    'shadow-[0_0_35px_rgba(52,211,153,0.55)]',
    'scale-105', '-translate-y-1', 'z-10'
];

function parseTimeStr(timeStr) {
    if (!timeStr) return null;
    const match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (isNaN(h) || isNaN(m)) return null;
    return { hour: h, min: m, startMinutes: h * 60 + m };
}

// Ambil waktu shalat langsung berdasarkan nama properti JSON KHGT (tanpa Imsak & Dhuha)
function extractPrayerTimes(rawObj) {
    if (!rawObj || typeof rawObj !== 'object') return null;

    // Cari objek terdalam yang menyimpan properti waktu shalat
    let target = rawObj;
    if (rawObj.times && typeof rawObj.times === 'object') target = rawObj.times;
    else if (rawObj.jadwal && typeof rawObj.jadwal === 'object') target = rawObj.jadwal;
    else if (rawObj.sholat && typeof rawObj.sholat === 'object') target = rawObj.sholat;

    const sSubuh = parseTimeStr(target.subuh ?? target.fajr ?? target.Subuh ?? target.Fajr);
    const sTerbit = parseTimeStr(target.terbit ?? target.sunrise ?? target.syuruq ?? target.Terbit ?? target.Sunrise);
    const sZuhur = parseTimeStr(target.zuhur ?? target.dzuhur ?? target.dhuhr ?? target.Zuhur ?? target.Dzuhur);
    const sAshar = parseTimeStr(target.ashar ?? target.asr ?? target.Ashar ?? target.Asr);
    const sMaghrib = parseTimeStr(target.maghrib ?? target.Maghrib);
    const sIsya = parseTimeStr(target.isya ?? target.isha ?? target.Isya ?? target.Isha);

    if (sSubuh && sTerbit && sZuhur && sAshar && sMaghrib && sIsya) {
        return [
            { id: 'card-subuh', name: 'SUBUH', ...sSubuh },
            { id: 'card-terbit', name: 'TERBIT', ...sTerbit },
            { id: 'card-zuhur', name: 'ZUHUR', ...sZuhur },
            { id: 'card-ashar', name: 'ASHAR', ...sAshar },
            { id: 'card-maghrib', name: 'MAGHRIB', ...sMaghrib },
            { id: 'card-isya', name: 'ISYA', ...sIsya },
        ];
    }

    // Jika key memakai nama lain, ambil semua HH:MM lalu saring khusus 6 waktu utama (lewati Imsak & Dhuha)
    const allTimes = [];
    (function scan(node) {
        if (!node) return;
        if (typeof node === 'string') {
            const m = node.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
            if (m) allTimes.push(`${String(m[1]).padStart(2, '0')}:${m[2]}`);
        } else if (Array.isArray(node)) {
            node.forEach(scan);
        } else if (typeof node === 'object') {
            Object.values(node).forEach(scan);
        }
    })(target);

    // Urutan 8 waktu dari server KHGT: [0:Imsak, 1:Subuh, 2:Terbit, 3:Dhuha, 4:Zuhur, 5:Ashar, 6:Maghrib, 7:Isya]
    if (allTimes.length >= 8) {
        const pSubuh = parseTimeStr(allTimes[1]);
        const pTerbit = parseTimeStr(allTimes[2]);
        const pZuhur = parseTimeStr(allTimes[4]);
        const pAshar = parseTimeStr(allTimes[5]);
        const pMaghrib = parseTimeStr(allTimes[6]);
        const pIsya = parseTimeStr(allTimes[7]);

        if (pSubuh && pTerbit && pZuhur && pAshar && pMaghrib && pIsya) {
            return [
                { id: 'card-subuh', name: 'SUBUH', ...pSubuh },
                { id: 'card-terbit', name: 'TERBIT', ...pTerbit },
                { id: 'card-zuhur', name: 'ZUHUR', ...pZuhur },
                { id: 'card-ashar', name: 'ASHAR', ...pAshar },
                { id: 'card-maghrib', name: 'MAGHRIB', ...pMaghrib },
                { id: 'card-isya', name: 'ISYA', ...pIsya },
            ];
        }
    }
    return null;
}

function renderTimesToCards() {
    const mapIds = {
        'SUBUH': 'time-subuh',
        'TERBIT': 'time-terbit',
        'ZUHUR': 'time-zuhur',
        'ASHAR': 'time-ashar',
        'MAGHRIB': 'time-maghrib',
        'ISYA': 'time-isya'
    };

    prayerSchedule.forEach(item => {
        const el = document.getElementById(mapIds[item.name]);
        if (el) {
            const hh = String(item.hour).padStart(2, '0');
            const mm = String(item.min).padStart(2, '0');
            el.textContent = `${hh}:${mm}`;
        }
    });
}

// 3. Fetch Jadwal Salat Resmi dari API KHGT Muhammadiyah
async function loadJadwalMasjid() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateIso = `${year}-${month}-${day}`;

    const khgtEndpoint = 'https://api-khgt.muhammadiyah.or.id/api/sholat/schedule';
    const payload = {
        lat: MASJID_LAT,
        lng: MASJID_LNG,
        date: dateIso,
        mode: "daily"
    };

    try {
        const response = await fetch(khgtEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const json = await response.json();
        const rawItem = Array.isArray(json.data) ? json.data[0] : (json.data || json);
        const parsedSchedule = extractPrayerTimes(rawItem);

        if (parsedSchedule) {
            prayerSchedule = parsedSchedule;
        }
    } catch (err) {
        console.warn("Fallback aktif:", err);
    }
    renderTimesToCards();
}

// 4. Update Kartu Menyala & Hitung Mundur
function updatePrayersAndCountdown(now) {
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const totalCurrentMinutes = (currentHours * 60) + currentMinutes;
    const totalCurrentSeconds = (totalCurrentMinutes * 60) + currentSeconds;

    let activeId = 'card-isya';
    let nextPrayer = prayerSchedule[0];

    const [sSubuh, sTerbit, sZuhur, sAshar, sMaghrib, sIsya] = prayerSchedule;

    if (totalCurrentMinutes >= sSubuh.startMinutes && totalCurrentMinutes < sTerbit.startMinutes) {
        activeId = 'card-subuh';
        nextPrayer = sZuhur;
    } else if (totalCurrentMinutes >= sTerbit.startMinutes && totalCurrentMinutes < sZuhur.startMinutes) {
        activeId = 'card-terbit';
        nextPrayer = sZuhur;
    } else if (totalCurrentMinutes >= sZuhur.startMinutes && totalCurrentMinutes < sAshar.startMinutes) {
        activeId = 'card-zuhur';
        nextPrayer = sAshar;
    } else if (totalCurrentMinutes >= sAshar.startMinutes && totalCurrentMinutes < sMaghrib.startMinutes) {
        activeId = 'card-ashar';
        nextPrayer = sMaghrib;
    } else if (totalCurrentMinutes >= sMaghrib.startMinutes && totalCurrentMinutes < sIsya.startMinutes) {
        activeId = 'card-maghrib';
        nextPrayer = sIsya;
    } else {
        activeId = 'card-isya';
        nextPrayer = sSubuh;
    }

    let targetSeconds = (nextPrayer.hour * 3600) + (nextPrayer.min * 60);
    if (nextPrayer.id === 'card-subuh' && totalCurrentMinutes >= sIsya.startMinutes) {
        targetSeconds += 24 * 3600;
    }

    let diffSeconds = targetSeconds - totalCurrentSeconds;
    if (diffSeconds < 0) diffSeconds = 0;

    const cHours = String(Math.floor(diffSeconds / 3600)).padStart(2, '0');
    const cMinutes = String(Math.floor((diffSeconds % 3600) / 60)).padStart(2, '0');
    const cSecs = String(diffSeconds % 60).padStart(2, '0');

    const countdownLabel = document.getElementById('countdown-label');
    const countdownTimer = document.getElementById('countdown-timer');
    if (countdownLabel) countdownLabel.textContent = `MENUJU ${nextPrayer.name}`;
    if (countdownTimer) countdownTimer.textContent = `${cHours}:${cMinutes}:${cSecs}`;

    prayerSchedule.forEach(prayer => {
        const card = document.getElementById(prayer.id);
        if (!card) return;

        const nameEl = card.querySelector('.prayer-name');
        const timeEl = card.querySelector('.prayer-time');

        if (prayer.id === activeId) {
            card.classList.remove(...inactiveCardClasses);
            card.classList.add(...activeCardClasses);
            if (nameEl) nameEl.className = 'prayer-name text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-900';
            if (timeEl) timeEl.className = 'prayer-time text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-2';
        } else {
            card.classList.remove(...activeCardClasses);
            card.classList.add(...inactiveCardClasses);
            if (nameEl) nameEl.className = 'prayer-name text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-200/80';
            if (timeEl) timeEl.className = 'prayer-time text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2';
        }
    });
}

// 5. Update Tanggal Hero & Header KHGT
function updateDates(now) {
    const fullDateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    const heroDate = document.getElementById('current-date');
    if (heroDate) heroDate.textContent = fullDateStr;

    const heroClock = document.getElementById('current-clock');
    if (heroClock) {
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        heroClock.textContent = `${h}:${m}:${s}`;
    }

    const khgtElem = document.getElementById('khgt-hijri-masehi');
    if (khgtElem && khgtElem.textContent.includes('Memuat')) {
        const daysShort = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
        const monthsShort = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
        const masehiShort = `${daysShort[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${monthsShort[now.getMonth()]} ${now.getFullYear()}`;

        const khgtDateObj = new Date(now);
        khgtDateObj.setDate(khgtDateObj.getDate() + 1);

        try {
            const rawHijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(khgtDateObj).replace(/\s*H$/i, '');

            khgtElem.textContent = `${rawHijri} H KHGT / ${masehiShort}`;
        } catch (e) {
            khgtElem.textContent = `Kalender Hijriah Global Tunggal / ${masehiShort}`;
        }
    }
}

// 6. Fitur Salin Nomor Rekening & Modal QRIS
const btnCopyNorek = document.getElementById('btn-copy-norek');
const norekEl = document.getElementById('norek-masjid');
const copyTextEl = document.getElementById('copy-text');

if (btnCopyNorek && norekEl) {
    btnCopyNorek.addEventListener('click', () => {
        navigator.clipboard.writeText(norekEl.textContent.trim()).then(() => {
            copyTextEl.textContent = 'Tersalin!';
            btnCopyNorek.classList.replace('bg-gold-500', 'bg-emerald-400');
            setTimeout(() => {
                copyTextEl.textContent = 'Salin';
                btnCopyNorek.classList.replace('bg-emerald-400', 'bg-gold-500');
            }, 2000);
        });
    });
}

const qrisModal = document.getElementById('qris-modal');
const btnOpenQris = document.getElementById('btn-open-qris');
const btnCloseQris = document.getElementById('btn-close-qris');

if (btnOpenQris && qrisModal) {
    btnOpenQris.addEventListener('click', () => {
        qrisModal.classList.remove('hidden');
        qrisModal.classList.add('flex');
    });
    btnCloseQris.addEventListener('click', () => {
        qrisModal.classList.add('hidden');
        qrisModal.classList.remove('flex');
    });
    qrisModal.addEventListener('click', (e) => {
        if (e.target === qrisModal) {
            qrisModal.classList.add('hidden');
            qrisModal.classList.remove('flex');
        }
    });
}

// 7. Subtle Scroll Reveal Observer
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

function tick() {
    const now = new Date();
    updateDates(now);
    updatePrayersAndCountdown(now);
}

document.addEventListener("DOMContentLoaded", () => {
    renderTimesToCards();
    loadJadwalMasjid();
    tick();
    setInterval(tick, 1000);

    // Render QRIS Resmi Masjid Ar Royyan secara digital (Tampilan Modal Tajam)
    const QRIS_PAYLOAD = "00020101021126710019ID.CO.DSPRATAMA.WWW011893600998060000189402159982250737241040303UMI51440014ID.CO.QRIS.WWW0215ID10254173167970303UMI5204866153033605802ID5916Masjid Ar Royyan6008Sidoarjo61056125262070703A016304A8E2";
    const qrisContainer = document.getElementById("qris-canvas-container");

    if (qrisContainer && typeof QRCode !== "undefined") {
        new QRCode(qrisContainer, {
            text: QRIS_PAYLOAD,
            width: 220,
            height: 220,
            colorDark: "#052e16",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });
    }

    // Fitur Simpan / Unduh Gambar QRIS Berbingkai HD (800x1040 px)
    const btnDownloadQris = document.getElementById("btn-download-qris");
    if (btnDownloadQris && typeof QRCode !== "undefined") {
        btnDownloadQris.addEventListener("click", () => {
            // 1. Buat QR resolusi tinggi (560x560) di wadah sementara
            const tempDiv = document.createElement("div");
            new QRCode(tempDiv, {
                text: QRIS_PAYLOAD,
                width: 560,
                height: 560,
                colorDark: "#052e16",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });

            // Beri jeda singkat agar kanvas QR HD selesai dirender
            setTimeout(() => {
                const hdQrCanvas = tempDiv.querySelector("canvas");
                if (!hdQrCanvas) return;

                // 2. Siapkan Kanvas Kartu Bingkai HD (800 x 1040)
                const cardCanvas = document.createElement("canvas");
                cardCanvas.width = 800;
                cardCanvas.height = 1040;
                const ctx = cardCanvas.getContext("2d");

                // Latar belakang putih bersih seluruh kartu
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, 800, 1040);

                // Bingkai luar hijau zamrud
                ctx.strokeStyle = "#047857";
                ctx.lineWidth = 14;
                ctx.strokeRect(24, 24, 752, 992);

                // Header hijau gelap di bagian atas kartu
                ctx.fillStyle = "#064e3b";
                ctx.fillRect(31, 31, 738, 175);

                // Garis aksen kuning emas Muhammadiyah di bawah header
                ctx.fillStyle = "#f59e0b";
                ctx.fillRect(31, 206, 738, 10);

                // Teks Header
                ctx.textAlign = "center";
                ctx.fillStyle = "#fbbf24";
                ctx.font = "bold 20px sans-serif";
                ctx.fillText("QRIS INFAQ & WAKAF RESMI", 400, 85);

                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 34px sans-serif";
                ctx.fillText("MASJID AR-ROYYAN", 400, 132);

                ctx.fillStyle = "#a7f3d0";
                ctx.font = "600 22px sans-serif";
                ctx.fillText("Muhammadiyah Buduran • Sidoarjo", 400, 172);

                // Kotak putih & border tipis di sekeliling QR (Quiet Zone luas agar mudah di-scan)
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(95, 255, 610, 610);
                ctx.strokeStyle = "#d1fae5";
                ctx.lineWidth = 4;
                ctx.strokeRect(95, 255, 610, 610);

                // Tempelkan QR HD tepat di tengah kotak (dengan margin 25px di tiap sisi)
                ctx.drawImage(hdQrCanvas, 120, 280, 560, 560);

                // Informasi NMID & Rekening di bagian bawah
                ctx.fillStyle = "#0f172a";
                ctx.font = "bold 24px monospace";
                ctx.fillText("NMID: ID1025417316797", 400, 912);

                ctx.fillStyle = "#047857";
                ctx.font = "bold 22px sans-serif";
                ctx.fillText("BCA Syariah (536) • 0111191912", 400, 952);

                ctx.fillStyle = "#64748b";
                ctx.font = "500 18px sans-serif";
                ctx.fillText("a.n. Masjid Ar Royyan", 400, 984);

                // 3. Unduh hasil kartu QRIS HD sebagai PNG
                const link = document.createElement("a");
                link.href = cardCanvas.toDataURL("image/png");
                link.download = "QRIS-Masjid-Ar-Royyan-Buduran.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 80);
        });
    }
});