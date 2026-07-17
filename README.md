# PRN232_Project_Frontend

## Git — repo & nhánh

| | Frontend (repo này) | Backend API |
|---|---------------------|-------------|
| **GitHub** | https://github.com/PRN232-Group/PRN232_Project_Frontend.git | https://github.com/PRN232-Group/PRN232_Project_Backend.git |
| **Nhánh** | `main` | `backend` |
| **Thư mục local** | `d:\PRN232\Frontend_Project` | `d:\PRN232\Project` |

Setup BE (DB, JWT, SMTP): xem README repo Backend. SQL schema/seed: `docs/create_InteriorStudio.sql`, `docs/seed_quotations.sql` (bản đầy đủ + thứ tự seed nằm ở repo BE `docs/DATABASE_SETUP.md`).

```env
# .env
VITE_API_BASE_URL=http://localhost:5259
VITE_USE_MOCK=false
```

---

- Về git push lên:

Link git:

quy tắc dùng git cmd (không cần làm theo nhưng sai thì phải chịu):
+) khi pull về lần đầu dùng cmd:
	git init
	git remote add origin <link github>
	git pull origin main 
+) khi pull về các lần sau đã có nhánh đã push:
	git pull origin <tên nhánh mấy bro hoặc nhánh mấy sếp khác nếu muốn gộp chung> => lưu ý dễ bị conflict
+) khi push lên:
        git add .
	git commit -m "Feat (<Tên thành viên làm>): <nội dung đã làm>"
	git push origin master:<tên nhánh của mấy bro đã tạo trên github>

quy tắc dùng tại visual studio luôn:
+) lần đầu khi pull về thì giống bên git cmd
+) lần sau thì code xong vào mục git phía trên cùng chọn commit 
	ghi nội dung commit tại ô commit Feat (<tên thành viên làm>): <nội dung đã làm>"
	xác nhận 
	cũng tại mục git trên cùng => chọn push (cái này chỉ đc khi mn đăng kí push tại đâu trong github)
