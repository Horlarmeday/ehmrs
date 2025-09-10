# 🏥 Accounting System Initialization Guide

This guide explains how the accounting system is automatically initialized and how you can manually manage it.

## 🚀 Automatic Initialization

The accounting system is **automatically initialized** when your server starts up. This happens in the following sequence:

1. **Server Startup** → `server/src/app.ts`
2. **Loaders** → `server/src/core/startup/loaders.ts`
3. **Accounting Initialization** → `AccountingStartupService.initialize()`

### What Gets Initialized Automatically:

- ✅ **Chart of Accounts**: All required accounts are created/validated
- ✅ **Account Validation**: Comprehensive validation of account structure
- ✅ **System Health Check**: Verification that all components are ready

## 🛠️ Manual Initialization Options

### Option 1: Standalone Script (Recommended for Setup)

```bash
# Run the standalone initialization script
npm run accounting:init

# Or directly
node src/scripts/initialize-accounting.js
```

**Use this when:**
- Setting up the system for the first time
- After database migrations
- System maintenance
- Troubleshooting

### Option 2: API Endpoints

```bash
# Check system health
GET /accounting/health

# Manually initialize system
POST /accounting/initialize
```

**Use this when:**
- Checking system status
- Re-initializing without restarting server
- Integration testing

### Option 3: Package.json Scripts

```bash
# Initialize accounting system
npm run accounting:init

# Check health (requires server running)
npm run accounting:health
```

## 📊 System Health Endpoint

### GET `/accounting/health`

Returns the current health status of the accounting system:

```json
{
  "success": true,
  "accounting": true,
  "issues": [],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "HEALTHY"
}
```

**Status Values:**
- `HEALTHY`: All required accounts exist and system is ready
- `UNHEALTHY`: Missing accounts or configuration issues

## 🔧 Manual Initialization Endpoint

### POST `/accounting/initialize`

Manually triggers the accounting system initialization:

```json
{
  "success": true,
  "message": "Accounting system initialized successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📋 Required Chart of Accounts

The system automatically creates these required accounts:

| Code | Name | Type | Description |
|------|------|------|-------------|
| **1001** | Cash on Hand | ASSET | Cash available for immediate use |
| **1002** | Bank Accounts | ASSET | Hospital bank account balances |
| **1003** | POS Terminal Receivables | ASSET | POS amounts before settlement |
| **1004** | Cash Register | ASSET | Daily cash collections |
| **1100** | Accounts Receivable | ASSET | General outstanding payments |
| **1101** | Insurance Receivables | ASSET | Insurance provider claims |
| **1102** | Bank Transfer Receivables | ASSET | Bank transfers before clearing |
| **2001** | Patient Deposits Payable | LIABILITY | Patient deposits held |
| **4000** | General Revenue | REVENUE | General medical services income |
| **4001** | Service Revenue | REVENUE | Medical services revenue |
| **4002** | Deposit Administration Fee | REVENUE | Deposit management fees |

## 🚨 Troubleshooting

### Common Issues:

1. **"Required Chart of Accounts Missing"**
   - Run: `npm run accounting:init`
   - Check database connection
   - Verify user permissions

2. **"Database Connection Failed"**
   - Check environment variables
   - Verify database is running
   - Check network connectivity

3. **"Account Validation Failed"**
   - Run health check: `GET /accounting/health`
   - Review validation errors
   - Check account conflicts

### Debug Steps:

```bash
# 1. Check system health
npm run accounting:health

# 2. Initialize manually if needed
npm run accounting:init

# 3. Check server logs for errors
tail -f logs/app.log

# 4. Verify database connection
mysql -u [user] -p [database]
```

## 🔄 Startup Sequence

```
1. Server starts
   ↓
2. Middleware loads (helmet, cors, etc.)
   ↓
3. Accounting system initializes
   ↓
4. Routes are registered
   ↓
5. Server listens for connections
```

## 📝 Environment Variables

Ensure these are set in your `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ehmrs
DB_USER=your_user
DB_PASSWORD=your_password

# Server
PORT=3000
NODE_ENV=development
```

## 🎯 Best Practices

1. **Always run initialization after database changes**
2. **Monitor health endpoint in production**
3. **Use standalone script for maintenance**
4. **Check logs for initialization errors**
5. **Validate system before processing payments**

## 📞 Support

If you encounter issues:

1. Check the health endpoint first
2. Review server logs
3. Run manual initialization
4. Verify database connectivity
5. Check account validation results

---

**Note**: The accounting system is critical for financial operations. Always ensure it's properly initialized before processing any payments or financial transactions.
