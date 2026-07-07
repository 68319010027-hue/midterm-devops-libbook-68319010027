<template>
  <div class="app-shell">
    <header class="app-header">
      <div>
        <h1>ระบบบันทึกข้อมูลหนังสือห้องสมุด 1</h1>
        <p class="app-meta">ผู้จัดทำ: นายพัชรพล ไวโสภา | รหัสนักศึกษา: 68319010027</p>
      </div>
      <p class="app-note">ใช้งานจริงได้: เพิ่ม / แก้ไข / ลบข้อมูลหนังสือ</p>
    </header>

    <section class="card form-card">
      <form @submit.prevent="submitForm" class="form-grid">
        <input v-model="form.isbn" :disabled="isEditing" type="text" placeholder="ISBN" required />
        <input v-model="form.title" type="text" placeholder="ชื่อหนังสือ" required />
        <input v-model="form.author" type="text" placeholder="ผู้แต่ง" required />
        <input v-model="form.category" type="text" placeholder="หมวดหมู่" required />
        <input v-model="form.version" type="text" placeholder="เวอร์ชัน" />
        <input v-model.number="form.year" type="number" placeholder="ปีที่พิมพ์" required />
        <select v-model="form.status">
          <option value="พร้อมให้ยืม">พร้อมให้ยืม</option>
          <option value="ถูกยืม">ถูกยืม</option>
          <option value="ชำรุด">ชำรุด</option>
        </select>

        <div class="actions">
          <button v-if="isEditing" type="button" class="btn btn-secondary" @click="resetForm" :disabled="loading">ยกเลิก</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'กำลังประมวลผล...' : (isEditing ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล') }}</button>
        </div>
      </form>
      <p class="message" v-if="message" :class="messageType">{{ message }}</p>
    </section>

    <section class="card table-card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ISBN</th>
              <th>ชื่อหนังสือ</th>
              <th>ผู้แต่ง</th>
              <th>หมวดหมู่</th>
              <th>เวอร์ชัน</th>
              <th>ปี</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in books" :key="book.isbn">
              <td>{{ book.isbn }}</td>
              <td>{{ book.title }}</td>
              <td>{{ book.author }}</td>
              <td>{{ book.category }}</td>
              <td>{{ book.version || '-' }}</td>
              <td>{{ book.year }}</td>
              <td>{{ book.status }}</td>
              <td class="actions-cell">
                <button type="button" class="btn btn-edit" @click="startEdit(book)">แก้ไข</button>
                <button type="button" class="btn btn-delete" @click="confirmDelete(book.isbn)">ลบ</button>
              </td>
            </tr>
            <tr v-if="books.length === 0">
              <td colspan="8" class="empty-state">ไม่มีข้อมูลหนังสือ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const books = ref([]);
    const isEditing = ref(false);
    const editingIsbn = ref('');
    const message = ref('');
    const messageType = ref('info');
    const loading = ref(false);
    const form = ref({ isbn: '', title: '', author: '', category: '', version: '', year: '', status: 'พร้อมให้ยืม' });
    const API_URL = '/api/books';

    const showMessage = (text, type = 'info', timeout = 3500) => {
      message.value = text;
      messageType.value = type;
      setTimeout(() => {
        if (message.value === text) {
          message.value = '';
          messageType.value = 'info';
        }
      }, timeout);
    };

    const parseResponse = async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(text || 'ไม่สามารถประมวลผลคำตอบจากเซิร์ฟเวอร์ได้');
      }
    };

    const fetchBooks = async () => {
      loading.value = true;
      try {
        const res = await fetch(API_URL);
        if (!res.ok) {
          const err = await parseResponse(res).catch(() => null);
          throw new Error(err?.error || 'ไม่สามารถดึงข้อมูลได้');
        }
        books.value = await parseResponse(res);
      } catch (err) {
        showMessage(err.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      form.value = { isbn: '', title: '', author: '', category: '', version: '', year: '', status: 'พร้อมให้ยืม' };
      isEditing.value = false;
      editingIsbn.value = '';
    };

    const submitForm = async () => {
      if (!form.value.isbn || !form.value.title || !form.value.author) {
        showMessage('กรุณากรอก ISBN ชื่อหนังสือ และผู้แต่งให้ครบ', 'error');
        return;
      }

      loading.value = true;
      try {
        const method = isEditing.value ? 'PUT' : 'POST';
        const url = isEditing.value ? `${API_URL}/${editingIsbn.value}` : API_URL;
        const body = isEditing.value
          ? { title: form.value.title, author: form.value.author, category: form.value.category, version: form.value.version, year: Number(form.value.year), status: form.value.status }
          : {
              isbn: form.value.isbn,
              title: form.value.title,
              author: form.value.author,
              category: form.value.category,
              version: form.value.version,
              year: Number(form.value.year),
              status: form.value.status,
            };

        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) {
          const err = await parseResponse(res).catch(() => null);
          throw new Error(err?.error || 'เกิดข้อผิดพลาดขณะบันทึก');
        }

        resetForm();
        await fetchBooks();
        showMessage(isEditing.value ? 'แก้ไขเรียบร้อย' : 'บันทึกเรียบร้อย', 'success');
      } catch (err) {
        showMessage(err.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    const startEdit = (book) => {
      isEditing.value = true;
      editingIsbn.value = book.isbn;
      form.value = { isbn: book.isbn, title: book.title, author: book.author, category: book.category, version: book.version || '', year: book.year, status: book.status };
    };

    const confirmDelete = (isbn) => {
      if (confirm(`ต้องการลบหนังสือ ISBN: ${isbn} หรือไม่?`)) {
        deleteBook(isbn);
      }
    };

    const deleteBook = async (isbn) => {
      try {
        const res = await fetch(`${API_URL}/${isbn}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await parseResponse(res).catch(() => null);
          throw new Error(err?.error || 'การลบล้มเหลว');
        }
        showMessage('ลบเรียบร้อย', 'success');
        fetchBooks();
      } catch (err) {
        showMessage(err.message, 'error');
      }
    };

    onMounted(fetchBooks);

    return { books, form, isEditing, message, messageType, loading, submitForm, startEdit, confirmDelete, resetForm };
  },
};
</script>

<style scoped>
.app-shell { max-width: 1120px; margin: 0 auto; padding: 24px; }
.app-header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 14px; align-items: center; margin-bottom: 24px; }
.app-header h1 { margin: 0; font-size: 1.6rem; }
.app-meta, .app-note { color: #6b7280; margin: 0; }
.card { background: #ffffff; border-radius: 18px; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08); padding: 24px; }
.form-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; }
input, select { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #d1d5db; font-size: 0.95rem; }
.actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px; grid-column: span 6; }
.btn { border: none; border-radius: 10px; padding: 10px 16px; cursor: pointer; font-weight: 600; }
.btn-primary { background: #2563eb; color: white; }
.btn-secondary { background: white; color: #111827; border: 1px solid #d1d5db; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; margin-top: 18px; }
th, td { padding: 14px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }
thead th { background: #f8fafc; }
.btn-edit { background: #fbbf24; color: #111827; }
.btn-delete { background: #ef4444; color: white; }
.empty-state { text-align: center; color: #6b7280; padding: 16px 0; }
@media (max-width: 900px) { .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }

.message {
  grid-column: span 6;
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  font-weight: 600;
}
.message.info { background: #e0f2fe; color: #0c4a6e; }
.message.success { background: #dcfce7; color: #166534; }
.message.error { background: #fee2e2; color: #991b1b; }
</style>
