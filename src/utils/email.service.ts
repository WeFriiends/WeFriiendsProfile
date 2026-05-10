import nodemailer, { Transporter } from "nodemailer";

export interface ReportSummaryRow {
  reportedUserId: string;
  reporterUserId: string;
  reason: string;
  comment?: string;
  createdAt: Date;
}

function createTransporter(): Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || "noreply@wefriiends.com";

/**
 * Sends an alert to the admin when a user accumulates 5+ reports.
 */
export async function sendReportThresholdAlert(
  reportedUserId: string,
  reportCount: number
): Promise<void> {
  if (!ADMIN_EMAIL) {
    console.warn("ADMIN_EMAIL is not configured — skipping alert email");
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `[WeFriiends] User ${reportedUserId} reached ${reportCount} reports`,
    html: `
      <h2>Report Threshold Alert</h2>
      <p>User <strong>${reportedUserId}</strong> has accumulated <strong>${reportCount}</strong> reports.</p>
      <p>Please review this account in the admin panel.</p>
    `,
  });

  console.log(`Alert email sent to admin for user ${reportedUserId}`);
}

/**
 * Sends a weekly digest of all reports to the admin.
 */
export async function sendWeeklyReportDigest(
  rows: ReportSummaryRow[]
): Promise<void> {
  if (!ADMIN_EMAIL) {
    console.warn("ADMIN_EMAIL is not configured — skipping weekly digest email");
    return;
  }

  if (rows.length === 0) {
    console.log("No reports this week — skipping weekly digest");
    return;
  }

  const tableRows = rows
    .map(
      (r) => `
      <tr>
        <td style="border:1px solid #ccc;padding:6px">${r.reportedUserId}</td>
        <td style="border:1px solid #ccc;padding:6px">${r.reporterUserId}</td>
        <td style="border:1px solid #ccc;padding:6px">${r.reason}</td>
        <td style="border:1px solid #ccc;padding:6px">${r.comment || "—"}</td>
        <td style="border:1px solid #ccc;padding:6px">${new Date(r.createdAt).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const html = `
    <h2>WeFriiends — Weekly Report Digest</h2>
    <p>Total complaints this week: <strong>${rows.length}</strong></p>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:13px">
      <thead>
        <tr style="background:#f4f4f4">
          <th style="border:1px solid #ccc;padding:6px">Reported User</th>
          <th style="border:1px solid #ccc;padding:6px">Reporter</th>
          <th style="border:1px solid #ccc;padding:6px">Reason</th>
          <th style="border:1px solid #ccc;padding:6px">Comment</th>
          <th style="border:1px solid #ccc;padding:6px">Date</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `[WeFriiends] Weekly Report Digest — ${rows.length} complaint(s)`,
    html,
  });

  console.log(`Weekly digest sent to admin (${rows.length} reports)`);
}
