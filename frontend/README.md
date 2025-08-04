### Run frontend http://localhost:3000
```bash
nvm use
npm i
npm run dev
```

## 🤖 GPT-3.5 Messaging System

SplitSafe includes an AI-powered messaging system with GPT-3.5 integration.

### Setup
1. **Get OpenAI API Key**: Visit https://platform.openai.com/api-keys
2. **Configure Environment**: Run `./setup-env.sh` or create `.env.local` with:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```
3. **Restart Server**: `npm run dev`

### Features
- Floating chat button in bottom right corner
- GPT-3.5 powered responses about SplitSafe
- Message persistence with localStorage
- Keyboard shortcuts (Enter to send, Escape to close)
- Clear chat functionality
- Error handling and graceful fallbacks

The messaging system will work without the API key but will show a configuration message.