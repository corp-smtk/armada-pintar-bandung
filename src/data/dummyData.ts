// Dummy data for internal public testing
// Covers 3 companies, each with up to 5 vehicles, and all label types
// All reminders are set for future dates (after 8 July 2025)

import type {
  Vehicle,
  Document,
  MaintenanceRecord,
  OperationalCost,
  ReminderConfig,
  VehiclePhoto
} from '../services/LocalStorageService';

export interface Company {
  id: string;
  name: string;
  email: string;
  address: string;
}

export interface DummyData {
  companies: Company[];
  vehicles: Vehicle[];
  documents: Document[];
  maintenance: MaintenanceRecord[];
  costs: OperationalCost[];
  reminders: ReminderConfig[];
}

// --- Companies ---
export const companies: Company[] = [
  {
    id: 'company-1',
    name: 'PT Armada Pintar Bandung',
    email: 'admin1@armadapintar.com',
    address: 'Jl. Merdeka No. 1, Bandung'
  },
  {
    id: 'company-2',
    name: 'CV Transportasi Cerdas',
    email: 'admin2@transportasicerdas.com',
    address: 'Jl. Soekarno Hatta No. 10, Bandung'
  },
  {
    id: 'company-3',
    name: 'UD Logistik Maju',
    email: 'admin3@logistikmaju.com',
    address: 'Jl. Asia Afrika No. 99, Bandung'
  }
];

// --- Vehicles ---
export const vehicles: Vehicle[] = [
  // Company 1 - PT Armada Pintar Bandung (5 vehicles)
  {
    id: 'veh-1-1',
    platNomor: 'D 1001 APB',
    jenisKendaraan: 'Truk',
    merek: 'Mitsubishi',
    model: 'Canter',
    tahunPembuatan: 2022,
    nomorRangka: 'MHKC1-2022-001',
    nomorMesin: '4M40T-2022-001',
    kapasitasMusatan: '3 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Kuning',
    tanggalPerolehan: '2025-04-10',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Utama Bandung',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-01-15',
    photos: [
      {
        id: 'photo-1-1',
        vehicleId: 'veh-1-1',
        category: 'front' as const,
        fileName: 'mitsubishi-canter-front.jpg',
        fileType: 'image/jpeg',
        fileData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Rm90byBEZXBhbjwvdGV4dD48L3N2Zz4=',
        title: 'Foto Depan Mitsubishi Canter',
        description: 'Foto bagian depan kendaraan yang menampilkan kondisi bumper dan lampu depan',
        uploadDate: '2025-06-15T08:30:00.000Z',
        createdAt: '2025-06-15T08:30:00.000Z',
        updatedAt: '2025-06-15T08:30:00.000Z'
      },
      {
        id: 'photo-1-2',
        vehicleId: 'veh-1-1',
        category: 'side' as const,
        fileName: 'mitsubishi-canter-side.jpg',
        fileType: 'image/jpeg',
        fileData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzE2YTM0YSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Rm90byBTYW1waW5nPC90ZXh0Pjwvc3ZnPg==',
        title: 'Foto Samping Kiri',
        description: 'Foto samping kiri yang menunjukkan kondisi body dan ban',
        uploadDate: '2025-06-15T08:45:00.000Z',
        createdAt: '2025-06-15T08:45:00.000Z',
        updatedAt: '2025-06-15T08:45:00.000Z'
      },
      {
        id: 'photo-1-3',
        vehicleId: 'veh-1-1',
        category: 'interior' as const,
        fileName: 'mitsubishi-canter-interior.jpg',
        fileType: 'image/jpeg',
        fileData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzk5MzNmZiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW50ZXJpb3I8L3RleHQ+PC9zdmc+',
        title: 'Interior Dashboard',
        description: 'Kondisi dashboard dan steering dalam keadaan baik',
        uploadDate: '2025-06-15T09:00:00.000Z',
        createdAt: '2025-06-15T09:00:00.000Z',
        updatedAt: '2025-06-15T09:00:00.000Z'
      }
    ],
    createdAt: '2025-04-10',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-1-2',
    platNomor: 'D 1002 APB',
    jenisKendaraan: 'Pickup',
    merek: 'Toyota',
    model: 'Hilux',
    tahunPembuatan: 2021,
    nomorRangka: 'MHR-2021-002',
    nomorMesin: '2KD-2021-002',
    kapasitasMusatan: '1 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Putih',
    tanggalPerolehan: '2025-05-15',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Utama Bandung',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-02-05',
    createdAt: '2025-05-15',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-1-3',
    platNomor: 'D 1003 APB',
    jenisKendaraan: 'Box',
    merek: 'Isuzu',
    model: 'Elf',
    tahunPembuatan: 2020,
    nomorRangka: 'ISZ-2020-003',
    nomorMesin: '4JB1-2020-003',
    kapasitasMusatan: '2 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Biru',
    tanggalPerolehan: '2025-06-01',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Utama Bandung',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-11-01',
    createdAt: '2025-06-01',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-1-4',
    platNomor: 'D 1004 APB',
    jenisKendaraan: 'Minibus',
    merek: 'Toyota',
    model: 'Hiace',
    tahunPembuatan: 2021,
    nomorRangka: 'THC-2021-004',
    nomorMesin: '2TR-2021-004',
    kapasitasMusatan: '1.5 Ton',
    jenisBahanBakar: 'Bensin',
    warna: 'Silver',
    tanggalPerolehan: '2025-06-10',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Utama Bandung',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-12-01',
    createdAt: '2025-06-10',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-1-5',
    platNomor: 'D 1005 APB',
    jenisKendaraan: 'Truk',
    merek: 'Hino',
    model: 'Ranger',
    tahunPembuatan: 2023,
    nomorRangka: 'HINO-2023-005',
    nomorMesin: 'J08E-2023-005',
    kapasitasMusatan: '6 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Merah',
    tanggalPerolehan: '2025-06-20',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Utama Bandung',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-12-15',
    createdAt: '2025-06-20',
    updatedAt: '2025-07-08'
  },
  // Company 2 - CV Transportasi Cerdas (5 vehicles)
  {
    id: 'veh-2-1',
    platNomor: 'D 2001 CTC',
    jenisKendaraan: 'Truk',
    merek: 'Hino',
    model: 'Dutro',
    tahunPembuatan: 2023,
    nomorRangka: 'HINO-2023-001',
    nomorMesin: 'N04C-2023-001',
    kapasitasMusatan: '4 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Hijau',
    tanggalPerolehan: '2025-04-20',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Soekarno Hatta',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-07-25',
    createdAt: '2025-04-20',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-2-2',
    platNomor: 'D 2002 CTC',
    jenisKendaraan: 'Pickup',
    merek: 'Suzuki',
    model: 'Carry',
    tahunPembuatan: 2022,
    nomorRangka: 'SUZ-2022-002',
    nomorMesin: 'G15A-2022-002',
    kapasitasMusatan: '1 Ton',
    jenisBahanBakar: 'Bensin',
    warna: 'Merah',
    tanggalPerolehan: '2025-05-10',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Soekarno Hatta',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-08-05',
    createdAt: '2025-05-10',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-2-3',
    platNomor: 'D 2003 CTC',
    jenisKendaraan: 'Van',
    merek: 'Daihatsu',
    model: 'Gran Max',
    tahunPembuatan: 2021,
    nomorRangka: 'DHT-2021-003',
    nomorMesin: '3SZ-2021-003',
    kapasitasMusatan: '1.2 Ton',
    jenisBahanBakar: 'Bensin',
    warna: 'Putih',
    tanggalPerolehan: '2025-05-25',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Soekarno Hatta',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-11-15',
    createdAt: '2025-05-25',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-2-4',
    platNomor: 'D 2004 CTC',
    jenisKendaraan: 'Truk',
    merek: 'Mitsubishi',
    model: 'Fuso Fighter',
    tahunPembuatan: 2022,
    nomorRangka: 'FUSO-2022-004',
    nomorMesin: '6M60-2022-004',
    kapasitasMusatan: '8 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Biru',
    tanggalPerolehan: '2025-06-05',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Soekarno Hatta',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-12-05',
    createdAt: '2025-06-05',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-2-5',
    platNomor: 'D 2005 CTC',
    jenisKendaraan: 'Pickup',
    merek: 'Ford',
    model: 'Ranger',
    tahunPembuatan: 2023,
    nomorRangka: 'FORD-2023-005',
    nomorMesin: 'P4T-2023-005',
    kapasitasMusatan: '1.5 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Hitam',
    tanggalPerolehan: '2025-06-15',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Soekarno Hatta',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-12-20',
    createdAt: '2025-06-15',
    updatedAt: '2025-07-08'
  },
  // Company 3 - UD Logistik Maju (5 vehicles)
  {
    id: 'veh-3-1',
    platNomor: 'D 3001 ULM',
    jenisKendaraan: 'Truk',
    merek: 'Fuso',
    model: 'Super Great',
    tahunPembuatan: 2021,
    nomorRangka: 'FUSO-2021-001',
    nomorMesin: '6M70-2021-001',
    kapasitasMusatan: '5 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Hitam',
    tanggalPerolehan: '2025-04-25',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Asia Afrika',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-07-30',
    createdAt: '2025-04-25',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-3-2',
    platNomor: 'D 3002 ULM',
    jenisKendaraan: 'Box',
    merek: 'Isuzu',
    model: 'Giga',
    tahunPembuatan: 2022,
    nomorRangka: 'ISZ-2022-002',
    nomorMesin: '6WG1-2022-002',
    kapasitasMusatan: '10 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Kuning',
    tanggalPerolehan: '2025-05-05',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Asia Afrika',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-08-10',
    createdAt: '2025-05-05',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-3-3',
    platNomor: 'D 3003 ULM',
    jenisKendaraan: 'Pickup',
    merek: 'Nissan',
    model: 'Navara',
    tahunPembuatan: 2021,
    nomorRangka: 'NSN-2021-003',
    nomorMesin: 'YD25-2021-003',
    kapasitasMusatan: '1.2 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Silver',
    tanggalPerolehan: '2025-05-20',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Asia Afrika',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-11-20',
    createdAt: '2025-05-20',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-3-4',
    platNomor: 'D 3004 ULM',
    jenisKendaraan: 'Truk',
    merek: 'Volvo',
    model: 'FH',
    tahunPembuatan: 2023,
    nomorRangka: 'VOLVO-2023-004',
    nomorMesin: 'D13K-2023-004',
    kapasitasMusatan: '12 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Biru',
    tanggalPerolehan: '2025-06-12',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Asia Afrika',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-12-10',
    createdAt: '2025-06-12',
    updatedAt: '2025-07-08'
  },
  {
    id: 'veh-3-5',
    platNomor: 'D 3005 ULM',
    jenisKendaraan: 'Van',
    merek: 'Mercedes',
    model: 'Sprinter',
    tahunPembuatan: 2022,
    nomorRangka: 'MB-2022-005',
    nomorMesin: 'OM651-2022-005',
    kapasitasMusatan: '2 Ton',
    jenisBahanBakar: 'Solar',
    warna: 'Putih',
    tanggalPerolehan: '2025-06-30',
    statusKepemilikan: 'Milik Sendiri',
    lokasiPool: 'Pool Asia Afrika',
    status: 'Aktif',
    statusDokumen: 'Lengkap',
    servisBerikutnya: '2025-12-30',
    createdAt: '2025-06-30',
    updatedAt: '2025-07-08'
  }
];

// --- Documents ---
export const documents: Document[] = [
  // Company 1 - PT Armada Pintar Bandung
  // Vehicle 1-1 documents
  {
    id: 'doc-1-1-stnk',
    vehicleId: 'veh-1-1',
    platNomor: 'D 1001 APB',
    jenisDokumen: 'STNK',
    nomorDokumen: 'STNK-2025-APB-1',
    tanggalTerbit: '2025-04-10',
    tanggalKadaluarsa: '2026-04-10',
    penerbitDokumen: 'Samsat Bandung',
    status: 'Valid',
    hariTersisa: 276,
    createdAt: '2025-04-10',
    updatedAt: '2025-07-08'
  },
  {
    id: 'doc-1-1-kir',
    vehicleId: 'veh-1-1',
    platNomor: 'D 1001 APB',
    jenisDokumen: 'KIR (Kendaraan Bermotor)',
    nomorDokumen: 'KIR-2025-APB-1',
    tanggalTerbit: '2025-04-15',
    tanggalKadaluarsa: '2025-07-20',
    penerbitDokumen: 'Dishub Bandung',
    status: 'Valid',
    hariTersisa: 11,
    createdAt: '2025-04-15',
    updatedAt: '2025-07-08'
  },
  {
    id: 'doc-1-1-asuransi',
    vehicleId: 'veh-1-1',
    platNomor: 'D 1001 APB',
    jenisDokumen: 'Asuransi',
    nomorDokumen: 'ASR-APB-2025-001',
    tanggalTerbit: '2025-04-20',
    tanggalKadaluarsa: '2026-04-20',
    penerbitDokumen: 'PT Asuransi Jasa Indonesia',
    status: 'Valid',
    hariTersisa: 286,
    createdAt: '2025-04-20',
    updatedAt: '2025-07-08'
  },
  // Vehicle 1-2 documents
  {
    id: 'doc-1-2-stnk',
    vehicleId: 'veh-1-2',
    platNomor: 'D 1002 APB',
    jenisDokumen: 'STNK',
    nomorDokumen: 'STNK-2025-APB-2',
    tanggalTerbit: '2025-05-15',
    tanggalKadaluarsa: '2026-05-15',
    penerbitDokumen: 'Samsat Bandung',
    status: 'Valid',
    hariTersisa: 311,
    createdAt: '2025-05-15',
    updatedAt: '2025-07-08'
  },
  {
    id: 'doc-1-2-sim',
    vehicleId: 'veh-1-2',
    platNomor: 'D 1002 APB',
    jenisDokumen: 'SIM Driver',
    nomorDokumen: 'SIM-BDG-2025-002',
    tanggalTerbit: '2025-05-20',
    tanggalKadaluarsa: '2027-05-20',
    penerbitDokumen: 'Polres Bandung',
    status: 'Valid',
    hariTersisa: 681,
    createdAt: '2025-05-20',
    updatedAt: '2025-07-08'
  },

  // Company 2 - CV Transportasi Cerdas
  // Vehicle 2-1 documents
  {
    id: 'doc-2-1-stnk',
    vehicleId: 'veh-2-1',
    platNomor: 'D 2001 CTC',
    jenisDokumen: 'STNK',
    nomorDokumen: 'STNK-2025-CTC-1',
    tanggalTerbit: '2025-04-20',
    tanggalKadaluarsa: '2026-04-20',
    penerbitDokumen: 'Samsat Bandung',
    status: 'Valid',
    hariTersisa: 286,
    createdAt: '2025-04-20',
    updatedAt: '2025-07-08'
  },
  {
    id: 'doc-2-1-kir',
    vehicleId: 'veh-2-1',
    platNomor: 'D 2001 CTC',
    jenisDokumen: 'KIR (Kendaraan Bermotor)',
    nomorDokumen: 'KIR-2025-CTC-1',
    tanggalTerbit: '2025-04-25',
    tanggalKadaluarsa: '2025-07-25',
    penerbitDokumen: 'Dishub Bandung',
    status: 'Valid',
    hariTersisa: 16,
    createdAt: '2025-04-25',
    updatedAt: '2025-07-08'
  },
  {
    id: 'doc-2-1-izin',
    vehicleId: 'veh-2-1',
    platNomor: 'D 2001 CTC',
    jenisDokumen: 'Izin Usaha',
    nomorDokumen: 'IU-CTC-2025-001',
    tanggalTerbit: '2025-05-01',
    tanggalKadaluarsa: '2027-05-01',
    penerbitDokumen: 'Dinas Perindustrian Bandung',
    status: 'Valid',
    hariTersisa: 662,
    createdAt: '2025-05-01',
    updatedAt: '2025-07-08'
  },

  // Company 3 - UD Logistik Maju
  // Vehicle 3-1 documents
  {
    id: 'doc-3-1-stnk',
    vehicleId: 'veh-3-1',
    platNomor: 'D 3001 ULM',
    jenisDokumen: 'STNK',
    nomorDokumen: 'STNK-2025-ULM-1',
    tanggalTerbit: '2025-04-25',
    tanggalKadaluarsa: '2026-04-25',
    penerbitDokumen: 'Samsat Bandung',
    status: 'Valid',
    hariTersisa: 291,
    createdAt: '2025-04-25',
    updatedAt: '2025-07-08'
  },
  {
    id: 'doc-3-1-lpg',
    vehicleId: 'veh-3-1',
    platNomor: 'D 3001 ULM',
    jenisDokumen: 'Sertifikat LPG',
    nomorDokumen: 'LPG-ULM-2025-001',
    tanggalTerbit: '2025-05-10',
    tanggalKadaluarsa: '2025-08-05',
    penerbitDokumen: 'Kementerian ESDM',
    status: 'Valid',
    hariTersisa: 27,
    createdAt: '2025-05-10',
    updatedAt: '2025-07-08'
  }
];

// --- Maintenance ---
export const maintenance: MaintenanceRecord[] = [
  // Company 1 - PT Armada Pintar Bandung
  {
    id: 'mnt-1-1-1',
    vehicleId: 'veh-1-1',
    platNomor: 'D 1001 APB',
    tanggal: '2025-06-10',
    jenisPerawatan: 'Servis Rutin',
    deskripsi: 'Ganti oli dan filter',
    kilometer: 12000,
    biaya: 500000,
    bengkel: 'Bengkel Resmi Mitsubishi',
    teknisi: 'Pak Budi',
    spareParts: [
      { nama: 'Oli Mesin', jumlah: 4, harga: 100000 },
      { nama: 'Filter Oli', jumlah: 1, harga: 50000 }
    ],
    status: 'Selesai',
    nextServiceKm: 17000,
    nextServiceDate: '2025-09-10',
    createdAt: '2025-06-10',
    updatedAt: '2025-07-08'
  },
  {
    id: 'mnt-1-1-2',
    vehicleId: 'veh-1-1',
    platNomor: 'D 1001 APB',
    tanggal: '2025-05-15',
    jenisPerawatan: 'Tune Up',
    deskripsi: 'Tune up mesin dan ganti busi',
    kilometer: 10500,
    biaya: 750000,
    bengkel: 'Bengkel Resmi Mitsubishi',
    teknisi: 'Pak Andi',
    spareParts: [
      { nama: 'Busi', jumlah: 4, harga: 200000 },
      { nama: 'Filter Udara', jumlah: 1, harga: 150000 }
    ],
    status: 'Selesai',
    nextServiceKm: 15500,
    nextServiceDate: '2025-08-15',
    createdAt: '2025-05-15',
    updatedAt: '2025-07-08'
  },
  {
    id: 'mnt-1-2-1',
    vehicleId: 'veh-1-2',
    platNomor: 'D 1002 APB',
    tanggal: '2025-06-20',
    jenisPerawatan: 'Ganti Ban',
    deskripsi: 'Ganti ban depan dan balancing',
    kilometer: 25000,
    biaya: 1200000,
    bengkel: 'Ban & Velg Center',
    teknisi: 'Pak Joko',
    spareParts: [
      { nama: 'Ban Depan', jumlah: 2, harga: 1000000 },
      { nama: 'Balancing', jumlah: 1, harga: 200000 }
    ],
    status: 'Selesai',
    createdAt: '2025-06-20',
    updatedAt: '2025-07-08'
  },

  // Company 2 - CV Transportasi Cerdas
  {
    id: 'mnt-2-1-1',
    vehicleId: 'veh-2-1',
    platNomor: 'D 2001 CTC',
    tanggal: '2025-06-05',
    jenisPerawatan: 'Servis AC',
    deskripsi: 'Service AC dan ganti freon',
    kilometer: 15000,
    biaya: 400000,
    bengkel: 'AC Mobil Specialist',
    teknisi: 'Pak Dedi',
    spareParts: [
      { nama: 'Freon R134a', jumlah: 2, harga: 200000 },
      { nama: 'Filter AC', jumlah: 1, harga: 100000 }
    ],
    status: 'Selesai',
    createdAt: '2025-06-05',
    updatedAt: '2025-07-08'
  },
  {
    id: 'mnt-2-2-1',
    vehicleId: 'veh-2-2',
    platNomor: 'D 2002 CTC',
    tanggal: '2025-06-25',
    jenisPerawatan: 'Cek Sistem Rem',
    deskripsi: 'Cek dan ganti kampas rem',
    kilometer: 18000,
    biaya: 600000,
    bengkel: 'Bengkel Rem Specialist',
    teknisi: 'Pak Agus',
    spareParts: [
      { nama: 'Kampas Rem Depan', jumlah: 1, harga: 250000 },
      { nama: 'Kampas Rem Belakang', jumlah: 1, harga: 200000 }
    ],
    status: 'Selesai',
    createdAt: '2025-06-25',
    updatedAt: '2025-07-08'
  },

  // Company 3 - UD Logistik Maju
  {
    id: 'mnt-3-1-1',
    vehicleId: 'veh-3-1',
    platNomor: 'D 3001 ULM',
    tanggal: '2025-06-15',
    jenisPerawatan: 'Ganti Oli',
    deskripsi: 'Ganti oli transmisi dan filter',
    kilometer: 22000,
    biaya: 800000,
    bengkel: 'Bengkel Resmi Fuso',
    teknisi: 'Pak Rudi',
    spareParts: [
      { nama: 'Oli Transmisi', jumlah: 6, harga: 600000 },
      { nama: 'Filter Transmisi', jumlah: 1, harga: 150000 }
    ],
    status: 'Selesai',
    nextServiceKm: 27000,
    nextServiceDate: '2025-09-15',
    createdAt: '2025-06-15',
    updatedAt: '2025-07-08'
  },

  // --- SCHEDULED MAINTENANCE (Dijadwalkan) ---
  // These match the servisBerikutnya dates in vehicles to show in "Perawatan Mendatang"
  
  // Company 1 - PT Armada Pintar Bandung
  {
    id: 'mnt-scheduled-2-1',
    vehicleId: 'veh-2-1',
    platNomor: 'D 2001 CTC',
    tanggal: '2025-07-25', // Match with vehicle servisBerikutnya
    jenisPerawatan: 'Servis Rutin',
    deskripsi: 'Servis rutin 15.000 KM - ganti oli dan filter',
    kilometer: 15000,
    biaya: 0,
    spareParts: [],
    status: 'Dijadwalkan',
    nextServiceKm: 20000,
    nextServiceDate: '2025-11-25',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  },
  {
    id: 'mnt-scheduled-3-1',
    vehicleId: 'veh-3-1',
    platNomor: 'D 3001 ULM',
    tanggal: '2025-07-30', // Match with vehicle servisBerikutnya
    jenisPerawatan: 'Cek Sistem Rem',
    deskripsi: 'Pemeriksaan sistem rem dan kampas rem',
    kilometer: 10000,
    biaya: 0,
    spareParts: [],
    status: 'Dijadwalkan',
    nextServiceKm: 15000,
    nextServiceDate: '2025-11-30',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  }
];

// --- Costs ---
export const costs: OperationalCost[] = [
  // Company 1 - PT Armada Pintar Bandung
  {
    id: 'cost-1-1-bbm1',
    vehicleId: 'veh-1-1',
    platNomor: 'D 1001 APB',
    tanggal: '2025-01-15',
    jenisBiaya: 'Bahan Bakar',
    deskripsi: 'Isi solar di SPBU Shell',
    jumlah: 450000,
    lokasi: 'SPBU Shell Pasteur',
    kategori: 'Operasional',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15'
  },
  {
    id: 'cost-1-1-tol1',
    vehicleId: 'veh-1-1',
    platNomor: 'D 1001 APB',
    tanggal: '2025-01-20',
    jenisBiaya: 'Tol',
    deskripsi: 'Tol Jakarta-Bandung PP',
    jumlah: 85000,
    lokasi: 'Tol Cipularang',
    kategori: 'Operasional',
    createdAt: '2025-01-20',
    updatedAt: '2025-01-20'
  },
  {
    id: 'cost-1-1-parkir1',
    vehicleId: 'veh-1-1',
    platNomor: 'D 1001 APB',
    tanggal: '2025-01-25',
    jenisBiaya: 'Parkir',
    deskripsi: 'Parkir di Mall Bandung',
    jumlah: 15000,
    lokasi: 'Paris Van Java Mall',
    kategori: 'Operasional',
    createdAt: '2025-01-25',
    updatedAt: '2025-01-25'
  },
  {
    id: 'cost-1-2-bbm1',
    vehicleId: 'veh-1-2',
    platNomor: 'D 1002 APB',
    tanggal: '2025-01-10',
    jenisBiaya: 'Bahan Bakar',
    deskripsi: 'Isi bensin Premium',
    jumlah: 350000,
    lokasi: 'SPBU Pertamina Dago',
    kategori: 'Operasional',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-10'
  },
  {
    id: 'cost-1-2-asuransi1',
    vehicleId: 'veh-1-2',
    platNomor: 'D 1002 APB',
    tanggal: '2025-01-05',
    jenisBiaya: 'Asuransi',
    deskripsi: 'Premi asuransi tahunan',
    jumlah: 2500000,
    lokasi: 'PT Asuransi Jasa Indonesia',
    kategori: 'Administrasi',
    createdAt: '2025-01-05',
    updatedAt: '2025-01-05'
  },

  // Company 2 - CV Transportasi Cerdas
  {
    id: 'cost-2-1-bbm1',
    vehicleId: 'veh-2-1',
    platNomor: 'D 2001 CTC',
    tanggal: '2025-06-12',
    jenisBiaya: 'Bahan Bakar',
    deskripsi: 'Isi solar Biosolar B30',
    jumlah: 500000,
    lokasi: 'SPBU Shell Soekarno Hatta',
    kategori: 'Operasional',
    createdAt: '2025-06-12',
    updatedAt: '2025-07-08'
  },
  {
    id: 'cost-2-1-denda1',
    vehicleId: 'veh-2-1',
    platNomor: 'D 2001 CTC',
    tanggal: '2025-05-30',
    jenisBiaya: 'Denda',
    deskripsi: 'Denda parkir ilegal',
    jumlah: 100000,
    lokasi: 'Jl. Soekarno Hatta',
    kategori: 'Operasional',
    createdAt: '2025-05-30',
    updatedAt: '2025-07-08'
  },
  {
    id: 'cost-2-2-pajak1',
    vehicleId: 'veh-2-2',
    platNomor: 'D 2002 CTC',
    tanggal: '2025-06-01',
    jenisBiaya: 'Pajak',
    deskripsi: 'Pajak kendaraan tahunan',
    jumlah: 1800000,
    lokasi: 'Samsat Bandung',
    kategori: 'Administrasi',
    createdAt: '2025-06-01',
    updatedAt: '2025-07-08'
  },

  // Company 3 - UD Logistik Maju
  {
    id: 'cost-3-1-bbm1',
    vehicleId: 'veh-3-1',
    platNomor: 'D 3001 ULM',
    tanggal: '2025-06-18',
    jenisBiaya: 'Bahan Bakar',
    deskripsi: 'Isi solar untuk perjalanan jauh',
    jumlah: 650000,
    lokasi: 'SPBU Pertamina Asia Afrika',
    kategori: 'Operasional',
    createdAt: '2025-06-18',
    updatedAt: '2025-07-08'
  },
  {
    id: 'cost-3-1-perawatan1',
    vehicleId: 'veh-3-1',
    platNomor: 'D 3001 ULM',
    tanggal: '2025-06-22',
    jenisBiaya: 'Perawatan',
    deskripsi: 'Cuci dan wax kendaraan',
    jumlah: 75000,
    lokasi: 'Car Wash Asia Afrika',
    kategori: 'Perawatan',
    createdAt: '2025-06-22',
    updatedAt: '2025-07-08'
  },
  {
    id: 'cost-3-1-lain1',
    vehicleId: 'veh-3-1',
    platNomor: 'D 3001 ULM',
    tanggal: '2025-07-01',
    jenisBiaya: 'Lain-lain',
    deskripsi: 'Biaya administrasi surat-surat',
    jumlah: 150000,
    lokasi: 'Kantor Notaris',
    kategori: 'Administrasi',
    createdAt: '2025-07-01',
    updatedAt: '2025-07-08'
  }
];

// --- Reminders ---
export const reminders: ReminderConfig[] = [
  // Company 1 - PT Armada Pintar Bandung
  // Service reminders
  {
    id: 'rem-1-1-service',
    title: 'Service Reminder - D 1001 APB',
    type: 'service',
    vehicle: 'veh-1-1',
    triggerDate: '2025-08-15',
    daysBeforeAlert: [7, 3, 1],
    channels: ['email', 'whatsapp'],
    recipients: ['admin1@armadapintar.com'],
    messageTemplate: 'Reminder: Servis kendaraan {vehicle} pada {date}',
    isRecurring: true,
    recurringInterval: 6,
    recurringUnit: 'month',
    status: 'active',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  },
  {
    id: 'rem-1-2-service',
    title: 'Service Reminder - D 1002 APB',
    type: 'service',
    vehicle: 'veh-1-2',
    triggerDate: '2025-09-25',
    daysBeforeAlert: [14, 7, 3],
    channels: ['email', 'telegram'],
    recipients: ['admin1@armadapintar.com'],
    messageTemplate: 'Reminder: Servis rutin kendaraan {vehicle} pada {date}',
    isRecurring: true,
    recurringInterval: 3,
    recurringUnit: 'month',
    status: 'active',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  },
  // Document reminders
  {
    id: 'rem-1-1-kir',
    title: 'KIR Expiry Reminder - D 1001 APB',
    type: 'document',
    vehicle: 'veh-1-1',
    document: 'doc-1-1-kir',
    triggerDate: '2025-10-15',
    daysBeforeAlert: [30, 14, 7, 1],
    channels: ['email', 'whatsapp'],
    recipients: ['admin1@armadapintar.com'],
    messageTemplate: 'Reminder: KIR kendaraan {vehicle} akan kadaluarsa pada {date}',
    isRecurring: false,
    status: 'active',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  },
  // Insurance reminders
  {
    id: 'rem-1-1-asuransi',
    title: 'Insurance Renewal - D 1001 APB',
    type: 'insurance',
    vehicle: 'veh-1-1',
    document: 'doc-1-1-asuransi',
    triggerDate: '2026-04-20',
    daysBeforeAlert: [60, 30, 14, 7],
    channels: ['email'],
    recipients: ['admin1@armadapintar.com'],
    messageTemplate: 'Reminder: Asuransi kendaraan {vehicle} akan berakhir pada {date}',
    isRecurring: true,
    recurringInterval: 1,
    recurringUnit: 'year',
    status: 'active',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  },

  // Company 2 - CV Transportasi Cerdas
  {
    id: 'rem-2-1-service',
    title: 'Service Reminder - D 2001 CTC',
    type: 'service',
    vehicle: 'veh-2-1',
    triggerDate: '2025-09-10',
    daysBeforeAlert: [7, 3],
    channels: ['email', 'telegram'],
    recipients: ['admin2@transportasicerdas.com'],
    messageTemplate: 'Reminder: Servis kendaraan {vehicle} pada {date}',
    isRecurring: true,
    recurringInterval: 4,
    recurringUnit: 'month',
    status: 'active',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  },
  {
    id: 'rem-2-1-kir',
    title: 'KIR Expiry Reminder - D 2001 CTC',
    type: 'document',
    vehicle: 'veh-2-1',
    document: 'doc-2-1-kir',
    triggerDate: '2025-10-25',
    daysBeforeAlert: [30, 14, 7],
    channels: ['whatsapp'],
    recipients: ['admin2@transportasicerdas.com'],
    messageTemplate: 'Reminder: KIR kendaraan {vehicle} akan kadaluarsa pada {date}',
    isRecurring: false,
    status: 'active',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  },
  {
    id: 'rem-2-2-custom',
    title: 'Custom Reminder - Pajak Tahunan D 2002 CTC',
    type: 'custom',
    vehicle: 'veh-2-2',
    triggerDate: '2026-06-01',
    daysBeforeAlert: [45, 30, 14],
    channels: ['email'],
    recipients: ['admin2@transportasicerdas.com'],
    messageTemplate: 'Reminder: Bayar pajak tahunan kendaraan {vehicle} pada {date}',
    isRecurring: true,
    recurringInterval: 1,
    recurringUnit: 'year',
    status: 'active',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  },

  // Company 3 - UD Logistik Maju
  {
    id: 'rem-3-1-service',
    title: 'Service Reminder - D 3001 ULM',
    type: 'service',
    vehicle: 'veh-3-1',
    triggerDate: '2025-09-05',
    daysBeforeAlert: [14, 7, 3, 1],
    channels: ['email', 'whatsapp', 'telegram'],
    recipients: ['admin3@logistikmaju.com'],
    messageTemplate: 'Reminder: Servis besar kendaraan {vehicle} pada {date}',
    isRecurring: true,
    recurringInterval: 6,
    recurringUnit: 'month',
    status: 'active',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  },
  {
    id: 'rem-3-1-lpg',
    title: 'LPG Certificate Renewal - D 3001 ULM',
    type: 'document',
    vehicle: 'veh-3-1',
    document: 'doc-3-1-lpg',
    triggerDate: '2026-05-10',
    daysBeforeAlert: [90, 60, 30, 14],
    channels: ['email'],
    recipients: ['admin3@logistikmaju.com'],
    messageTemplate: 'Reminder: Sertifikat LPG kendaraan {vehicle} akan kadaluarsa pada {date}',
    isRecurring: false,
    status: 'active',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  },
  {
    id: 'rem-3-1-custom',
    title: 'Custom Reminder - Inspeksi Keselamatan D 3001 ULM',
    type: 'custom',
    vehicle: 'veh-3-1',
    triggerDate: '2025-12-01',
    daysBeforeAlert: [30, 14, 7],
    channels: ['email', 'whatsapp'],
    recipients: ['admin3@logistikmaju.com'],
    messageTemplate: 'Reminder: Inspeksi keselamatan tahunan kendaraan {vehicle} pada {date}',
    isRecurring: true,
    recurringInterval: 1,
    recurringUnit: 'year',
    status: 'active',
    createdAt: '2025-07-08',
    updatedAt: '2025-07-08'
  }
];

export const dummyData: DummyData = {
  companies,
  vehicles,
  documents,
  maintenance,
  costs,
  reminders
}; 