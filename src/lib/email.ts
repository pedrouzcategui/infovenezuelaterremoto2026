import { Resend } from "resend";

/** Envía un código de verificación (OTP) a un correo con Resend. */
export async function sendOtpEmail(
  to: string,
  otp: string,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "El envío de correos no está configurado (falta RESEND_API_KEY).",
    };
  }
  const from =
    process.env.EMAIL_FROM ?? "Info Venezuela Terremoto <onboarding@resend.dev>";
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Tu código de verificación: ${otp}`,
      text: `Tu código para publicar tu solicitud en Info Venezuela Terremoto es:\n\n${otp}\n\nVence en 10 minutos. Si no fuiste tú, ignora este correo.`,
    });
    if (error) {
      return { ok: false, error: "No se pudo enviar el correo. Intenta de nuevo." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo enviar el correo. Intenta de nuevo." };
  }
}
