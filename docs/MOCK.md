# Mock API — test UI trước khi có backend

## Bật / tắt

`.env.local`:

```
VITE_USE_MOCK=true   # mock
VITE_USE_MOCK=false  # API thật + VITE_API_BASE_URL
```

Restart `npm run dev` sau khi đổi.

## Cấu trúc (dễ gỡ)

```
src/infrastructure/mock/
  data.js           # dataset in-memory
  handlers.js       # map URL → JSON
  installMockApi.js # axios adapter
```

Gỡ hẳn khi BE sẵn:

1. `VITE_USE_MOCK=false`
2. Xóa thư mục `src/infrastructure/mock/`
3. Xóa `installMockApi(...)` + `MockBanner` trong `main.jsx`
4. Xóa `src/components/MockBanner.jsx`

Services / pages **không** cần sửa lại — chúng đã gọi `apiClient`.

## Tài khoản test (login)

Chọn **vai trò** trên form login + email bất kỳ, password ≥ 6 ký tự (vd `test@demo.com` / `123456`).

| Role dropdown | Landing |
|---|---|
| Khách hàng | `/` |
| Sales | `/sales` |
| Production | `/production` |
| Manager | `/manager` |
| Admin | `/admin` |

Mock mutation (thêm giỏ, đổi status…) lưu **in-memory** — F5 sẽ reset về data gốc trong `data.js`.
