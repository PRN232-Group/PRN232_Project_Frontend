# Frontend Architecture (Clean-ish for SPA)

Interior Studio frontend follows a layered structure inspired by Clean Architecture:

```
src/
  domain/                 # Pure rules (roles, order status) — no React / axios
  application/services/   # Use-cases orchestrating API calls
  infrastructure/
    http/apiClient.js     # Single axios instance + interceptors
    storage/authStorage.js
  presentation/
    guards/               # Route protection
  pages/                  # UI per role (Customer / Admin / Manager / Sales)
  components/             # Shared UI (Header, Footer, DashboardShell)
  contexts/               # React Context (User)
  routers/                # Route table
  styles/                 # Design tokens + shared CSS
```

## Dependency rule

`pages/components` → `application/services` → `infrastructure` → external (HTTP / localStorage)

`domain` has no outward dependencies.

## Do / Don't

| Do | Don't |
|----|--------|
| Call `apiClient` / `*Service` | Hard-code `https://localhost:5001` in pages |
| Use `normalizeRole` / `ORDER_STATUS` from `domain/` | Duplicate role or status strings per page |
| Wrap back-office routes with `RequireAuth` | Rely on menu hiding for security |
| Style via CSS variables in `variables.css` | Invent one-off hex colors per page |
| Set `VITE_API_BASE_URL` for environments | Mix ports `:5000`, `:5001`, `:7293` |

## Env

```
VITE_API_BASE_URL=https://localhost:5001
```
