# Grades Service

Service untuk manajemen nilai dan transkrip akademik dalam Sistem SIAKAD Terdistribusi.

## Fitur

- ✅ Input & Update Nilai
- ✅ Kalkulasi Nilai Akhir Otomatis
- ✅ Konversi ke Huruf & Grade Point
- ✅ Hitung GPA per Semester/Kumulatif
- ✅ Generate Transkrip
- ✅ Notifikasi via RabbitMQ
- ✅ Background Job untuk Report

## Konfigurasi

Port: **3003**  
IP VM: **192.168.10.14**

## Environment Variables

```env
PORT=3003
DB_HOST=192.168.10.16
DB_PORT=3306
DB_USERNAME=siakad_app
DB_PASSWORD=admin
DB_DATABASE=siakad
RABBITMQ_URL=amqp://192.168.10.15:5672
```

## Install Dependencies

```bash
npm install
```

## Run

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Grade Management

- `POST /api/grades` - Input nilai baru
- `GET /api/grades` - Ambil semua nilai
- `GET /api/grades?studentNim=2024001` - Filter by mahasiswa
- `GET /api/grades?courseId=1` - Filter by mata kuliah
- `GET /api/grades/:id` - Detail nilai
- `PATCH /api/grades/:id` - Update komponen nilai
- `DELETE /api/grades/:id` - Hapus nilai
- `POST /api/grades/:id/finalize` - Finalisasi nilai (trigger notifikasi)

### Academic Records

- `GET /api/grades/student/:nim/gpa` - Hitung GPA
- `GET /api/grades/student/:nim/gpa?semester=1&academicYear=2024` - GPA semester tertentu
- `GET /api/grades/student/:nim/transcript` - Generate transkrip lengkap

## Request Examples

```bash
# Input nilai
curl -X POST http://192.168.10.14:3003/api/grades \
  -H "Content-Type: application/json" \
  -d '{
    "studentNim":"2024001",
    "courseId":1,
    "courseName":"Pemrograman Dasar",
    "quiz":85,
    "assignment":90,
    "midterm":80,
    "final":88,
    "semester":1,
    "academicYear":"2024/2025"
  }'

# Finalisasi nilai (kirim notifikasi)
curl -X POST http://192.168.10.14:3003/api/grades/1/finalize

# Hitung GPA
curl -X GET http://192.168.10.14:3003/api/grades/student/2024001/gpa

# GPA semester 1 tahun 2024/2025
curl -X GET http://192.168.10.14:3003/api/grades/student/2024001/gpa?semester=1&academicYear=2024/2025

# Generate transkrip
curl -X GET http://192.168.10.14:3003/api/grades/student/2024001/transcript
```

## Sistem Penilaian

### Bobot Komponen Nilai

- Quiz: **15%**
- Assignment: **15%**
- Midterm: **30%**
- Final: **40%**

**Formula:**  
`Nilai Akhir = (Quiz × 0.15) + (Assignment × 0.15) + (Midterm × 0.3) + (Final × 0.4)`

### Konversi Nilai Huruf

| Nilai Akhir | Huruf | Grade Point |
| ----------- | ----- | ----------- |
| 85 - 100    | A     | 4.0         |
| 75 - 84     | B     | 3.0         |
| 65 - 74     | C     | 2.0         |
| 55 - 64     | D     | 1.0         |
| 0 - 54      | E     | 0.0         |

### Perhitungan GPA

```
GPA = Σ(Grade Point) / Total Mata Kuliah
```

## RabbitMQ Integration

### Queue: `grade_notifications`

Dikirim saat nilai difinalisasi.

```json
{
  "studentNim": "2024001",
  "courseName": "Pemrograman Dasar",
  "letterGrade": "A",
  "finalScore": 87.5
}
```

### Queue: `report_generation`

Dikirim saat generate transkrip.

```json
{
  "type": "transcript",
  "studentNim": "2024001",
  "timestamp": "2025-12-05T10:30:00Z"
}
```

## Database Schema

```sql
CREATE TABLE grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  studentNim VARCHAR(20) NOT NULL,
  courseId INT NOT NULL,
  courseName VARCHAR(255) NOT NULL,
  quiz DECIMAL(5,2),
  assignment DECIMAL(5,2),
  midterm DECIMAL(5,2),
  final DECIMAL(5,2),
  finalScore DECIMAL(5,2),
  letterGrade VARCHAR(2),
  gradePoint DECIMAL(3,2),
  semester INT NOT NULL,
  academicYear VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_grade (studentNim, courseId, semester, academicYear)
);
```

## Deployment ke VM

1. Copy folder `grades-service` ke VM4
2. Pastikan RabbitMQ sudah running di VM5 (192.168.10.15)
3. Konfigurasi `.env`
4. Jalankan `npm install`
5. Jalankan `npm run start:prod`
