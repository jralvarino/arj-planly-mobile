# Security Scan

Perform a security audit of the codebase to detect hardcoded sensitive data, exposed credentials, and misconfigured secrets that could be a risk in a public repository.

## Instructions

Run ALL of the following checks and report every finding with file path and line number.

### 1. Hardcoded secrets and credentials

Search for patterns that indicate hardcoded sensitive values:

```bash
grep -rn \
  -e "password\s*=\s*['\"][^'\"]\+['\"]" \
  -e "secret\s*=\s*['\"][^'\"]\+['\"]" \
  -e "api[_-]key\s*=\s*['\"][^'\"]\+['\"]" \
  -e "apikey\s*=\s*['\"][^'\"]\+['\"]" \
  -e "token\s*=\s*['\"][^'\"]\+['\"]" \
  -e "private[_-]key\s*=\s*['\"][^'\"]\+['\"]" \
  -e "client[_-]secret\s*=\s*['\"][^'\"]\+['\"]" \
  -e "access[_-]key\s*=\s*['\"][^'\"]\+['\"]" \
  -e "auth[_-]token\s*=\s*['\"][^'\"]\+['\"]" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --include="*.json" --include="*.yaml" --include="*.yml" --include="*.env*" \
  --exclude-dir=node_modules --exclude-dir=.git \
  . 2>/dev/null | grep -iv "process\.env\|example\|placeholder\|your[_-]\|<\|TODO\|test\|mock"
```

### 2. Hardcoded URLs and endpoints

Look for raw URLs (http/https) hardcoded directly in source files instead of using environment variables:

```bash
grep -rn \
  -e "https\?://[a-zA-Z0-9][a-zA-Z0-9._-]*\.[a-zA-Z]\{2,\}" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --exclude-dir=node_modules --exclude-dir=.git \
  . 2>/dev/null | grep -iv "localhost\|127\.0\.0\.1\|example\.com\|schema\.org\|w3\.org\|json-schema"
```

Evaluate each URL: is it a production/staging endpoint? Should it be an environment variable instead?

### 3. AWS credentials and cloud provider keys

```bash
grep -rn \
  -e "AKIA[0-9A-Z]\{16\}" \
  -e "aws_access_key_id\s*=" \
  -e "aws_secret_access_key\s*=" \
  -e "execute-api\.[a-z0-9-]*\.amazonaws\.com" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --include="*.json" --include="*.yaml" --include="*.yml" --include="*.env*" \
  --exclude-dir=node_modules --exclude-dir=.git \
  . 2>/dev/null
```

### 4. Private keys and certificates

```bash
grep -rn \
  -e "BEGIN RSA PRIVATE KEY" \
  -e "BEGIN PRIVATE KEY" \
  -e "BEGIN EC PRIVATE KEY" \
  -e "BEGIN CERTIFICATE" \
  --exclude-dir=node_modules --exclude-dir=.git \
  . 2>/dev/null
```

### 5. .env files tracked by git

```bash
git ls-files | grep -E "^\.env"
```

If any `.env` file (not `.env.example`) is tracked, that is a critical finding.

### 6. .gitignore coverage

```bash
cat .gitignore 2>/dev/null | grep -i env
```

Check whether `.env` (without suffix) is covered. If only `.env*.local` is ignored, a plain `.env` file would be committed.

### 7. Sensitive files accidentally committed

```bash
git ls-files | grep -Ei "\.(pem|key|p12|pfx|jks|keystore|cer|crt|der)$"
git ls-files | grep -Ei "(secret|credential|private|password|passwd)"
```

### 8. Expo/React Native specific — public env vars

In Expo, any variable prefixed `EXPO_PUBLIC_` is bundled into the client app and visible to anyone who downloads it. Check for vars with this prefix that contain sensitive values (tokens, secrets, private keys):

```bash
grep -rn "EXPO_PUBLIC_" \
  --include="*.ts" --include="*.tsx" --include="*.env*" \
  --exclude-dir=node_modules --exclude-dir=.git \
  . 2>/dev/null
```

Flag any `EXPO_PUBLIC_` variable whose value looks like a secret (not a URL or public identifier).

---

## Report format

For each finding, output:

```
[SEVERITY] <file>:<line>
  Issue: <description of the problem>
  Value: <the sensitive value or pattern found>
  Fix: <recommended remediation>
```

Severity levels:
- **CRITICAL** — secret/key/token exposed, `.env` committed
- **HIGH** — production URL hardcoded in source, should be env var
- **MEDIUM** — `.gitignore` gap, `EXPO_PUBLIC_` exposing non-public data
- **LOW** — pattern looks suspicious but may be benign (verify manually)

End the report with a summary table:

| Severity | Count |
|----------|-------|
| CRITICAL | N |
| HIGH     | N |
| MEDIUM   | N |
| LOW      | N |

And a prioritized list of recommended fixes.
