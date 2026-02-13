# TaxDown Ambassador Portal - España

Portal para embajadores de TaxDown que colaboran en comunidades de fiscalidad en Reddit.

## Características

- 📝 Registro obligatorio con email @taxdown.es
- 📊 Dashboard con oportunidades de colaboración
- 🔍 Rastreo automático de hilos de Reddit
- 💬 Seguimiento de comentarios y entregas
- ✅ Sistema de aprobación por admin
- 💰 Pagos semanales automáticos

## Stack Tecnológico

- **Frontend/Backend:** Next.js 14 + TypeScript
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Autenticación:** NextAuth.js
- **Diseño:** Tailwind CSS
- **Validación:** Zod
- **Reddit API:** PRAW

## Desarrollo Local

### Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Setup

1. **Clonar y entrar al proyecto**
   ```bash
   git clone <repo>
   cd ambassador-es
   ```

2. **Instalar dependencias**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus valores
   ```

4. **Setup de base de datos**
   ```bash
   # Crear BD local en PostgreSQL
   createdb ambassador_es

   # Generar cliente Prisma
   npm run db:generate

   # Ejecutar migraciones
   npm run db:migrate
   ```

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

   Abrir [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utilities, DB, auth
├── types/            # TypeScript types
└── middleware.ts     # Next.js middleware

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Build para producción
- `npm start` - Inicia servidor de producción
- `npm run db:migrate` - Ejecuta migraciones
- `npm run db:push` - Sincroniza schema con BD
- `npm run db:studio` - Abre Prisma Studio
- `npm run lint` - Ejecuta linter

## Fases de Desarrollo

### FASE 0: Infraestructura ✅
- [x] Setup Next.js + TypeScript
- [x] Configurar Prisma + PostgreSQL
- [x] NextAuth.js setup
- [x] Tailwind CSS
- [x] Estructura de carpetas

### FASE 1: Autenticación 🔜
- [ ] Modelo User en Prisma
- [ ] Registro con email @taxdown.es
- [ ] Login
- [ ] Verificación de email

### FASE 2-8: Funcionalidades principales

Ver [PLAN.md](./PLAN.md) para detalles completos.

## Seguridad

- Email @taxdown.es obligatorio
- CSRF protection con NextAuth
- Contraseñas hasheadas con bcrypt
- IBAN encriptado en BD
- Rate limiting
- Audit logging
- Validación de entrada exhaustiva

## Variables de Entorno Requeridas

```env
DATABASE_URL              # PostgreSQL connection
NEXTAUTH_URL             # URL de la aplicación
NEXTAUTH_SECRET          # Clave secreta (min 32 caracteres)
REDDIT_CLIENT_ID         # Reddit API credentials
REDDIT_CLIENT_SECRET
REDDIT_USER_AGENT
SENDGRID_API_KEY        # Email service
STRIPE_SECRET_KEY       # Payment processing
CRON_SECRET             # Para jobs automáticos
ENCRYPTION_KEY          # Para encriptar datos sensibles
```

## Documentación

- [Plan de Implementación](./PLAN.md)
- [Prisma Schema](./prisma/schema.prisma)
- [API Reference](./docs/API.md) (en construcción)

## Licencia

Propietario de TaxDown

## Contacto

Para preguntas sobre desarrollo: [TaxDown Dev Team]
