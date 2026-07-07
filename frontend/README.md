# Frontend (Static Web)

หน้าเว็บนี้เป็นไฟล์ HTML + JavaScript แบบ static ที่เชื่อมต่อกับ API backend โดยใช้ `fetch` ไปยัง `http://<host>:3000/api/books`.

## วิธีใช้งาน

1. ติดตั้ง dependencies ในโฟลเดอร์ frontend:
   ```powershell
   cd frontend
   npm install
   ```
2. รัน development server:
   ```powershell
   npm run dev
   ```
3. เปิดเว็บเบราว์เซอร์ที่:
   - http://localhost:5173

## การสร้าง build สำหรับ production

1. สร้าง production build:
   ```powershell
   npm run build
   ```
2. build จะสร้างไฟล์ในโฟลเดอร์ `frontend/dist`

## ฟังก์ชันที่รองรับ

- เพิ่มหนังสือ
- แก้ไขข้อมูลหนังสือ
- ลบหนังสือ
- ดูรายการหนังสือทั้งหมด

## หมายเหตุ

- API backend ต้องรันอยู่บนพอร์ต `3000` เพื่อให้ frontend ทำงานได้
- ถ้าใช้ Docker Compose แล้ว frontend จะถูกแมปไปที่พอร์ต `8080`
