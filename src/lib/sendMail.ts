import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
//
export default async function sendMail(body:any) {
  try {
    const {
      activeSiteDocking,
      blindDocking,
      createdAt,
      ligandTarget,
      proteinTarget,
      userEmail,
      userId,
    } = body;

    // Create reusable transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or any SMTP service
      auth: {
        user: process.env.NEXT_EMAIL,
        pass: process.env.NEXT_EMAIL_PASS,
      },
    });

    // Build HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; background: white; margin: auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(90deg, #4e54c8, #8f94fb); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 22px;">Docking Request Details</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 15px; color: #333;">Hello, here are the details of the docking request:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 10px; font-weight: bold;">Active Site Docking</td>
                <td style="padding: 10px;">${activeSiteDocking ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Blind Docking</td>
                <td style="padding: 10px;">${blindDocking ? "Yes" : "No"}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 10px; font-weight: bold;">Protein Target</td>
                <td style="padding: 10px;">${proteinTarget}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Ligand Target</td>
                <td style="padding: 10px;">${ligandTarget}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 10px; font-weight: bold;">Created At</td>
                <td style="padding: 10px;">${createdAt}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">User Email</td>
                <td style="padding: 10px;">${userEmail}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 10px; font-weight: bold;">User ID</td>
                <td style="padding: 10px;">${userId}</td>
              </tr>
            </table>
          </div>
          <div style="background-color: #f4f6f8; padding: 15px; text-align: center; font-size: 13px; color: #777;">
            © ${new Date().getFullYear()} Docking Platform. All rights reserved.
          </div>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Docking Platform" <${process.env.NEXT_EMAIL}>`,
      to: "sjabezsam@gmail.com",
      subject: "Docking Request Submitted",
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
