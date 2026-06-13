import { PatientCase } from "./types";

export const EXTENDED_SCENARIOS: PatientCase[] = [
  // --- KATEGORI MERAH (IMMEDIATE) ---
  {
    id: "case-01",
    name: "Tn. Andi",
    age: 30,
    gender: "Laki-laki",
    chiefComplaint: "Kecelakaan mobil membentur setir. Sesak napas sangat berat, trakea bergeser ke kanan, dan vena leher membesar.",
    vitals: {
      bloodPressure: "80/50",
      heartRate: 135,
      respiratoryRate: 36,
      consciousness: "Gelisah (Verbal)"
    },
    correctTriage: "red",
    rationale: "Tanda klinis khas Tension Pneumothorax kiri. Kondisi ini menyebabkan syok obstruktif (Circulation) dan gagal napas (Breathing). Perlu dekompresi jarum segera. Kategori Merah.",
    questionName: "Q1: OBSTRUCTIVE SHOCK"
  },
  {
    id: "case-02",
    name: "Ny. Siti",
    age: 25,
    gender: "Perempuan",
    chiefComplaint: "Korban terjebak di ruangan terbakar. Wajah cemong, alis terbakar, batuk dengan dahak hitam, dan terdengar suara napas mengorok (stridor).",
    vitals: {
      bloodPressure: "110/70",
      heartRate: 115,
      respiratoryRate: 28,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "red",
    rationale: "Cedera inhalasi dengan ancaman sumbatan jalan napas (Airway compromise). Stridor menunjukkan edema laring yang bisa menutup total jalan napas kapan saja. Perlu intubasi profilaksis segera. Kategori Merah.",
    questionName: "Q2: AIRWAY BURN INHALATION"
  },
  {
    id: "case-03",
    name: "Tn. Budi",
    age: 40,
    gender: "Laki-laki",
    chiefComplaint: "Korban penusukan di dada kiri. Suara jantung terdengar sangat jauh/menjauh, vena leher menonjol, ekstremitas dingin.",
    vitals: {
      bloodPressure: "75/40",
      heartRate: 128,
      respiratoryRate: 26,
      consciousness: "Letargi (Pain)"
    },
    correctTriage: "red",
    rationale: "Trias Beck (hipotensi, distensi vena leher, suara jantung menjauh) mengindikasikan Tamponade Jantung. Kedaruratan sirkulasi yang mengancam nyawa. Perlu perikardiosentesis. Kategori Merah.",
    questionName: "Q3: CARDIAC TAMPONADE"
  },
  {
    id: "case-04",
    name: "Sdr. Rio",
    age: 20,
    gender: "Laki-laki",
    chiefComplaint: "Kecelakaan mesin pabrik, amputasi parsial kaki kanan dengan perdarahan memancar deras. Pucat pasi dan akral sangat dingin.",
    vitals: {
      bloodPressure: "60/palpasi",
      heartRate: 145,
      respiratoryRate: 30,
      consciousness: "Somnolen (Verbal)"
    },
    correctTriage: "red",
    rationale: "Perdarahan masif eksternal (Massive Hemorrhage / Exsanguination) memicu Syok Hemoragik Kelas IV. Membutuhkan pemasangan tourniquet dan resusitasi darah masif segera. Kategori Merah.",
    questionName: "Q4: MASSIVE EXSANGUINATION"
  },
  {
    id: "case-05",
    name: "Tn. Karto",
    age: 55,
    gender: "Laki-laki",
    chiefComplaint: "Pejalan kaki tertabrak motor. Terdapat luka robek di kepala. Pasien tidak merespons panggilan, hanya mengerang saat diberi rangsang nyeri, lengan ekstensi abnormal.",
    vitals: {
      bloodPressure: "170/95",
      heartRate: 50,
      respiratoryRate: 10,
      consciousness: "Unresponsive (Pain)"
    },
    correctTriage: "red",
    rationale: "Cedera Otak Berat (GCS 4). Bradikardia dan hipertensi menunjukkan Refleks Cushing akibat peningkatan Tekanan Intrakranial (TIK) yang mematikan. Perlu manajemen definitif airway dan neurosurgery. Kategori Merah.",
    questionName: "Q5: SEVERE TBI"
  },
  {
    id: "case-06",
    name: "Ny. Lina",
    age: 35,
    gender: "Perempuan",
    chiefComplaint: "Dada terbentur dashboard. Dinding dada kiri tampak bergerak masuk saat menarik napas (paradoxical breathing). Nyeri hebat saat bernapas.",
    vitals: {
      bloodPressure: "90/60",
      heartRate: 120,
      respiratoryRate: 34,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "red",
    rationale: "Flail Chest akibat fraktur iga multipel. Mengganggu mekanisme ventilasi normal (Breathing) dan berisiko tinggi memicu hipoksia berat atau kontusio paru. Kategori Merah.",
    questionName: "Q6: FLAIL CHEST"
  },

  // --- KATEGORI KUNING (URGENT/DELAYED) ---
  {
    id: "case-07",
    name: "Sdr. Anton",
    age: 22,
    gender: "Laki-laki",
    chiefComplaint: "Jatuh dari pohon. Tulang kering (tibia) kanan patah hingga menembus kulit. Darah merembes namun tidak memancar aktif.",
    vitals: {
      bloodPressure: "115/75",
      heartRate: 95,
      respiratoryRate: 20,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "yellow",
    rationale: "Fraktur terbuka (Open Fracture) merupakan kegawatdaruratan ortopedi untuk mencegah infeksi dan kerusakan jaringan, namun hemodinamik stabil dan perdarahan terkontrol. Kategori Kuning.",
    questionName: "Q7: OPEN FRACTURE STABLE"
  },
  {
    id: "case-08",
    name: "An. Bima",
    age: 12,
    gender: "Laki-laki",
    chiefComplaint: "Tersiram air panas rebusan. Luka bakar melepuh di lengan kanan dan sebagian dada depan (sekitar 15% luas permukaan tubuh). Tidak ada sesak napas.",
    vitals: {
      bloodPressure: "110/70",
      heartRate: 110,
      respiratoryRate: 22,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "yellow",
    rationale: "Luka bakar derajat II sedang (15% TBSA). Membutuhkan perawatan luka dan resusitasi cairan (Formula Parkland), namun tidak mengancam nyawa segera karena jalan napas aman. Kategori Kuning.",
    questionName: "Q8: MODERATE THERMAL BURN"
  },
  {
    id: "case-09",
    name: "Tn. Rudi",
    age: 45,
    gender: "Laki-laki",
    chiefComplaint: "Kecelakaan motor, perut membentur stang. Mengeluh nyeri perut kiri atas. Tampak jejas kemerahan di area tersebut, namun perut belum tegang keras.",
    vitals: {
      bloodPressure: "105/70",
      heartRate: 98,
      respiratoryRate: 20,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "yellow",
    rationale: "Curiga trauma tumpul abdomen (kemungkinan cedera limpa/spleen rupture). Pasien saat ini terkompensasi, namun butuh observasi ketat (FAST USG) sebelum bergeser ke syok. Kategori Kuning.",
    questionName: "Q9: BLUNT ABDOMINAL TRAUMA"
  },
  {
    id: "case-10",
    name: "Ny. Ratna",
    age: 28,
    gender: "Perempuan",
    chiefComplaint: "Jatuh terduduk dari tangga. Mengeluh nyeri hebat di punggung bawah dan mengeluh kedua kakinya terasa kebas dan sulit digerakkan.",
    vitals: {
      bloodPressure: "120/80",
      heartRate: 85,
      respiratoryRate: 18,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "yellow",
    rationale: "Curiga cedera medula spinalis (Spinal Cord Injury). Tidak ada masalah ABC (Airway, Breathing, Circulation), namun butuh imobilisasi *log-roll* dan perlindungan tulang belakang untuk mencegah paralisis permanen. Kategori Kuning.",
    questionName: "Q10: SPINAL CORD INJURY"
  },
  {
    id: "case-11",
    name: "Tn. Eko",
    age: 38,
    gender: "Laki-laki",
    chiefComplaint: "Dipukul benda tumpul di kepala. Luka robek 5 cm, perdarahan telah dihentikan dengan balut tekan. Sempat pingsan 2 menit, sekarang mengeluh pusing dan mual.",
    vitals: {
      bloodPressure: "130/85",
      heartRate: 80,
      respiratoryRate: 18,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "yellow",
    rationale: "Cedera Otak Ringan-Sedang (Mild TBI) dengan riwayat hilang kesadaran. Pasien berisiko mengalami perdarahan intrakranial lambat. Perlu CT Scan kepala elektif. Kategori Kuning.",
    questionName: "Q11: MILD TRAUMATIC BRAIN INJURY"
  },
  {
    id: "case-12",
    name: "Ny. Desi",
    age: 50,
    gender: "Perempuan",
    chiefComplaint: "Terpeleset dan bertumpu pada lengan kanan. Bahu kanan tampak asimetris dan nyeri hebat saat digerakkan. Denyut nadi pergelangan tangan teraba kuat.",
    vitals: {
      bloodPressure: "135/85",
      heartRate: 92,
      respiratoryRate: 20,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "yellow",
    rationale: "Dislokasi bahu anterior. Nyeri hebat namun status neurovaskular distal intak dan hemodinamik stabil. Membutuhkan reposisi dalam waktu dekat untuk kenyamanan dan mencegah komplikasi. Kategori Kuning.",
    questionName: "Q12: SHOULDER DISLOCATION"
  },

  // --- KATEGORI HIJAU (MINOR / WALKING WOUNDED) ---
  {
    id: "case-13",
    name: "Sdr. Kevin",
    age: 19,
    gender: "Laki-laki",
    chiefComplaint: "Jatuh saat lari sore. Lengan bawah kiri bengkak dan nyeri (curiga fraktur tertutup). Mampu berjalan sendiri menuju area triase.",
    vitals: {
      bloodPressure: "120/80",
      heartRate: 82,
      respiratoryRate: 16,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "green",
    rationale: "Fraktur ekstremitas terisolasi yang stabil dan pasien mampu berjalan sendiri (walking wounded). Penanganan dapat ditunda setelah pasien merah dan kuning tertangani. Kategori Hijau.",
    questionName: "Q13: CLOSED RADIUS FRACTURE"
  },
  {
    id: "case-14",
    name: "Nn. Siska",
    age: 21,
    gender: "Perempuan",
    chiefComplaint: "Tergores pecahan kaca di area betis. Luka robek dangkal, perdarahan minimal dan sudah berhenti dengan sendirinya.",
    vitals: {
      bloodPressure: "115/75",
      heartRate: 78,
      respiratoryRate: 16,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "green",
    rationale: "Luka laserasi minor. Hanya butuh pembersihan luka (irigasi) dan jahitan minor jika perlu. Sama sekali tidak mengancam nyawa. Kategori Hijau.",
    questionName: "Q14: MINOR LACERATION"
  },
  {
    id: "case-15",
    name: "Tn. Yoga",
    age: 30,
    gender: "Laki-laki",
    chiefComplaint: "Penumpang mobil yang ditabrak dari belakang. Merasa sedikit kaku pada otot leher (whiplash ringan), berjalan santai masuk ke UGD.",
    vitals: {
      bloodPressure: "125/80",
      heartRate: 85,
      respiratoryRate: 18,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "green",
    rationale: "Strain otot servikal ringan. Tanda-tanda vital stabil, defisit neurologis negatif. Bisa menunggu. Kategori Hijau.",
    questionName: "Q15: WHIPLASH INJURY"
  },
  {
    id: "case-16",
    name: "An. Cika",
    age: 15,
    gender: "Perempuan",
    chiefComplaint: "Betis kanan terkena knalpot motor. Terdapat luka kemerahan seukuran telapak tangan (Derajat 1). Sangat mengeluh perih.",
    vitals: {
      bloodPressure: "110/70",
      heartRate: 88,
      respiratoryRate: 18,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "green",
    rationale: "Luka bakar derajat superfisial (derajat 1) dengan luas < 5%. Cukup diberikan salep dan analgesik oral. Kategori Hijau.",
    questionName: "Q16: MINOR THERMAL BURN"
  },
  {
    id: "case-17",
    name: "Sdr. Rian",
    age: 24,
    gender: "Laki-laki",
    chiefComplaint: "Terlibat tabrakan beruntun. Mobil rusak tapi pasien tidak lecet sedikitpun. Bernapas sangat cepat, jari tangan kesemutan, dan tampak sangat panik.",
    vitals: {
      bloodPressure: "135/85",
      heartRate: 110,
      respiratoryRate: 32,
      consciousness: "Sadar (Alert)"
    },
    correctTriage: "green",
    rationale: "Serangan panik / hiperventilasi akut pasca-trauma psikologis. Tidak ada cedera fisik yang memerlukan intervensi ATLS (Breathing rate tinggi karena stres, bukan patologis trauma). Kategori Hijau.",
    questionName: "Q17: PANIC ATTACK"
  }
];