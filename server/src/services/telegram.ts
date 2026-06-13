const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

/**
 * Escapes characters for Telegram MarkdownV2 parse mode
 */
function escapeMarkdownV2(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

/**
 * Sends a message via the Telegram Bot API to the configured chat channel
 */
export async function sendTelegramNotification(message: string, isMarkdown = true, customToken?: string, customChatId?: string): Promise<boolean> {
  const token = customToken || TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[Telegram Hook Offline] Logged notification event:', message);
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: isMarkdown ? 'Markdown' : undefined
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram returned status ${response.status}: ${errorText}`);
    }

    console.log('[Telegram Hook] Notification sent successfully.');
    return true;
  } catch (error: any) {
    console.error('[Telegram Hook] Failed to send notification:', error.message);
    return false;
  }
}

/**
 * Send alert for a critical call threat
 */
export async function notifyCriticalThreat(
  callerNumber: string, 
  threatType: string, 
  score: number, 
  summary: string,
  customToken?: string,
  customChatId?: string
): Promise<boolean> {
  const formatted = `*⚠️ SHIELDCALL AI: CRITICAL FRAUD RISK DETECTED*
  
*Caller:* \`${callerNumber}\`
*Threat:* \`${threatType}\`
*Risk Score:* \`${score}/100\`

*Summary:*
${summary}

_Recommendation: Terminate this conversation immediately and block the caller._`;

  return sendTelegramNotification(formatted, true, customToken, customChatId);
}

/**
 * Send alert for a triggered emergency SOS
 */
export async function notifyEmergencySOS(
  userId: string, 
  userEmail: string, 
  lat: number, 
  lng: number,
  customToken?: string,
  customChatId?: string
): Promise<boolean> {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const formatted = `*🚨 SHIELDCALL AI: EMERGENCY SOS TRIGGERED*
  
*User:* \`${userEmail}\`
*Location:* [Google Maps Link](${mapLink})
*GPS Coordinates:* \`${lat.toFixed(6)}, ${lng.toFixed(6)}\`

*Status:* \`ACTIVE RESPONSE REQUIRED\`

_Please dispatch security services or contact their emergency network._`;

  return sendTelegramNotification(formatted, true, customToken, customChatId);
}
