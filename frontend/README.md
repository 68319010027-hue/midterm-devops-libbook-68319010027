# Frontend (Static Web)

หน้าเว็บนี้เป็นไฟล์ HTML + JavaScript แบบ static ที่เชื่อมต่อกับ API backend โดยใช้ `fetch` ไปยัง `http://<host>:3000/api/books`.

## วิธีใช้งาน

1. สร้าง container ด้วย Docker Compose:
   ```powershell
   docker compose up -d --build
   ```
2. เปิดเว็บเบราว์เซอร์ที่:
   - http://localhost:8080

## ฟังก์ชันที่รองรับ

- เพิ่มหนังสือ
- แก้ไขข้อมูลหนังสือ
- ลบหนังสือ
- ดูรายการหนังสือทั้งหมด

## หมายเหตุ

- API backend ต้องรันอยู่บนพอร์ต `3000` เพื่อให้ frontend ทำงานได้
- ถ้าใช้ Docker Compose แล้ว frontend จะถูกแมปไปที่พอร์ต `8080`
