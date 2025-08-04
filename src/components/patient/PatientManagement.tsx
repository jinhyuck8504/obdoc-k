11:29:08 AM: Netlify Build                                                 
11:29:08 AM: ────────────────────────────────────────────────────────────────
11:29:08 AM: ​
11:29:08 AM: ❯ Version
11:29:08 AM:   @netlify/build 35.0.0
11:29:08 AM: ​
11:29:08 AM: ❯ Flags
11:29:08 AM:   accountId: 68710a91e54f6fe0b3c4ca56
11:29:08 AM:   baseRelDir: true
11:29:08 AM:   buildId: 68901ac595cdea0008eb7ff4
11:29:08 AM:   deployId: 68901ac595cdea0008eb7ff6
11:29:08 AM: ​
11:29:08 AM: ❯ Current directory
11:29:08 AM:   /opt/build/repo
11:29:08 AM: ​
11:29:08 AM: ❯ Config file
11:29:08 AM:   /opt/build/repo/netlify.toml
11:29:08 AM: ​
11:29:08 AM: ❯ Context
11:29:08 AM:   production
11:29:10 AM: ​
11:29:10 AM: ❯ Using Next.js Runtime - v5.12.0
11:29:12 AM: No Next.js cache to restore
11:29:12 AM: ​
11:29:12 AM: build.command from netlify.toml                               
11:29:12 AM: ────────────────────────────────────────────────────────────────
11:29:12 AM: ​
11:29:12 AM: $ npm run build
11:29:12 AM: > obdoc-mvp@0.1.0 build
11:29:12 AM: > next build
11:29:13 AM: ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
11:29:13 AM:    ▲ Next.js 15.4.4
11:29:13 AM:    - Environments: .env.production
11:29:13 AM:    - Experiments (use with caution):
11:29:13 AM:      · optimizePackageImports
11:29:13 AM:    Creating an optimized production build ...
11:29:26 AM:  ✓ Compiled successfully in 12.0s
11:29:26 AM:    Skipping linting
11:29:26 AM:    Checking validity of types ...
11:29:34 AM: Failed to compile.
11:29:34 AM: 
11:29:34 AM: ./src/components/patient/PatientManagement.tsx:10:10
11:29:34 AM: Type error: Duplicate identifier 'customerService'.
11:29:34 AM:    8 | import BackButton from '@/components/common/BackButton'
11:29:34 AM:    9 | import { Customer, CustomerFilters } from '@/types/customer'
11:29:34 AM: > 10 | import { customerService } from '@/lib/customerService'
11:29:34 AM:      |          ^
11:29:34 AM:   11 | import PatientList from './PatientList'
11:29:34 AM:   12 | import PatientDetail from './PatientDetail'
11:29:34 AM:   13 | import PatientForm from './PatientForm'
11:29:34 AM: Next.js build worker exited with code: 1 and signal: null
11:29:34 AM: ​
11:29:34 AM: "build.command" failed                                        
11:29:34 AM: ────────────────────────────────────────────────────────────────
11:29:34 AM: ​
11:29:34 AM:   Error message
11:29:34 AM:   Command failed with exit code 1: npm run build (https://ntl.fyi/exit-code-1)
11:29:34 AM: ​
11:29:34 AM:   Error location
11:29:34 AM:   In build.command from netlify.toml:
11:29:34 AM:   npm run build
11:29:34 AM: ​
11:29:34 AM:   Resolved config
11:29:34 AM:   build:
11:29:34 AM:     command: npm run build
11:29:34 AM:     commandOrigin: config
11:29:34 AM:     environment:
11:29:34 AM:       - NEXT_PUBLIC_SUPABASE_ANON_KEY
11:29:34 AM:       - NEXT_PUBLIC_SUPABASE_URL
11:29:34 AM:       - NODE_VERSION
11:29:34 AM:       - NPM_FLAGS
11:29:34 AM:       - NODE_ENV
11:29:34 AM:       - NEXT_TELEMETRY_DISABLED
11:29:34 AM:     publish: /opt/build/repo/.next
11:29:34 AM:     publishOrigin: config
11:29:34 AM:   functions:
11:29:34 AM:     "*":
11:29:34 AM:       node_bundler: esbuild
11:29:34 AM:   functionsDirectory: /opt/build/repo/netlify/functions
11:29:34 AM:   headers:
11:29:34 AM:     - for: /*
      values:
        Permissions-Policy: camera=(), microphone=(), geolocation=()
        Referrer-Policy: strict-origin-when-cross-origin
        Strict-Transport-Security: max-age=31536000; includeSubDomains
        X-Content-Type-Options: nosniff
        X-Frame-Options: DENY
    - for: /api/*
      values:
        Access-Control-Allow-Headers: Content-Type, Authorization
        Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
        Access-Control-Allow-Origin: https://obdoc.co.kr
    - for: /_next/static/*
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /static/*
      values:
        Cache-Control: public, max-age=31536000, immutable
  headersOrigin: config
  plugins:
    - inputs: {}
      origin: config
      package: "@netlify/plugin-nextjs"
  redirects:
    - from: /admin.html
      status: 301
      to: /dashboard/admin
    - from: /health
      status: 200
      to: /api/health
    - from: /*
      status: 200
      to: /index.html
  redirectsOrigin: config
11:29:34 AM: Build failed due to a user error: Build script returned non-zero exit code: 2
11:29:34 AM: Failing build: Failed to build site
11:29:34 AM: Finished processing build request in 1m12.246s
11:29:34 AM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
