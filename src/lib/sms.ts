/**
 * Envoi de SMS via l'API REST Twilio (sans SDK).
 * Variables requises : TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.
 */

/** Normalise un numéro français au format E.164 (+33…). Renvoie null si inconnu. */
export function normalizeFrPhone(raw: string): string | null {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("0033")) return "+" + cleaned.slice(2);
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return "+33" + cleaned.slice(1);
  }
  return null;
}

export async function sendSms(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.warn("[sms] Twilio non configuré — SMS ignoré.");
    return false;
  }

  const e164 = normalizeFrPhone(to);
  if (!e164) {
    console.warn("[sms] numéro non reconnu, SMS ignoré:", to);
    return false;
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString(
            "base64"
          )}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: e164, From: from, Body: body }).toString(),
      }
    );
    if (!res.ok) {
      console.error("[sms] envoi échoué", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[sms] erreur réseau", err);
    return false;
  }
}
