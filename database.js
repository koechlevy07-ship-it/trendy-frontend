services:
  - type: web
    name: trendy-wardrobe-backend
    runtime: node
    plan: starter
    rootDir: trendy-backend
    buildCommand: npm ci --omit=dev
    startCommand: node src/server.js
    healthCheckPath: /api/health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false # set manually in the Render dashboard — never commit real secrets
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: JWT_REFRESH_EXPIRES_IN
        value: 30d
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: MPESA_ENV
        value: production
      - key: MPESA_CONSUMER_KEY
        sync: false
      - key: MPESA_CONSUMER_SECRET
        sync: false
      - key: MPESA_SHORTCODE
        sync: false
      - key: MPESA_PASSKEY
        sync: false
      - key: MPESA_CALLBACK_URL
        sync: false
      - key: SMTP_HOST
        sync: false
      - key: SMTP_PORT
        value: 587
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: AT_API_KEY
        sync: false
      - key: AT_USERNAME
        sync: false
      - key: AT_SENDER_ID
        sync: false
      - key: WHATSAPP_PHONE_NUMBER_ID
        sync: false
      - key: WHATSAPP_ACCESS_TOKEN
        sync: false
      - key: FRONTEND_URL
        sync: false # set to the deployed Vercel URL once known
      - key: DEFAULT_CURRENCY
        value: KES
