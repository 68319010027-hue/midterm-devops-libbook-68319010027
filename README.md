# ระบบบันทึกข้อมูลหนังสือห้องสมุด (libbook)

## 👤 ข้อมูลผู้จัดทำ
- **ชื่อ-นามสกุล:** พัชรพล ไวโสภา
- **รหัสนักศึกษา:** 68319010027

## 🧩 โครงสร้างโปรเจกต์
- `backend/` : API server ด้วย Node.js + Express + PostgreSQL
- `frontend/` : เว็บหน้าต่างแบบ static รันด้วย Nginx
- `docker-compose.yml` : สร้าง environment สำหรับพัฒนา
- `docker-compose.prod.yml` : ตัวอย่าง deploy โดยใช้ Docker images จาก Docker Hub

## 🚀 รันโครงการแบบพัฒนา (Local)
1. สร้างไฟล์ `.env` จากตัวอย่าง:
   ```powershell
   copy .env.example .env
   copy backend\.env.example backend\.env
   ```
2. สตาร์ทบริการทั้งหมด:
   ```powershell
   docker compose up -d --build
   ```
3. เปิดเว็บเบราว์เซอร์:
   - http://localhost:8080

## 🌐 โครงสร้างการใช้งาน
- Frontend จะเรียก API ที่ `http://localhost:3000/api/books`
- Backend จะเชื่อม PostgreSQL ที่ container `db`

## 📦 คำสั่งสำคัญ
- สตาร์ททั้งหมด (build ใหม่):
  ```powershell
  docker compose up -d --build
  ```
- หยุดทั้งหมด:
  ```powershell
  docker compose down
  ```
- ใช้ production docker-compose ตัวอย่าง:
  ```powershell
  docker compose -f docker-compose.prod.yml up -d
  ```

## ✅ ฟีเจอร์ที่รองรับ
- เพิ่มหนังสือ
- แก้ไขหนังสือ
- ลบหนังสือ
- ดูรายการหนังสือทั้งหมด

## 🔧 หมายเหตุ
- frontend ต้องเรียก backend ที่พอร์ต `3000`
- หากไม่ใช้ Docker Compose ให้แน่ใจว่า backend และฐานข้อมูลรันอยู่ตาม config ใน `.env`
