import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// To get the Contacts of the website
export async function GET() {
  try {
    const contacts = await prisma.contacts.findMany();
    if (contacts.length === 0) {
      return NextResponse.json(
        {
          Message: "No Contacts Found!",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Contacts Fetched SucessFully",
        contacts: contacts,
      },
      { status: 200 }
    );
  } catch (ex) {
    return NextResponse.json(
      {
        Message: "Failed to fetch the data",
      },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, message } = body;

    if (!phone) {
      return NextResponse.json({ Message: "Phone Number is required" }, { status: 400 });
    }

    // Save to database
    const contact = await prisma.contacts.create({
      data: { name, phone, message },
    });


    const transporter = nodemailer.createTransport({
      host: "smtp.example.com", // e.g., smtp.gmail.com
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your password or app password
      },
    });

    const mailOptions = {
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: "your-receiving-email@example.com", // where you want to receive the message
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nPhone: ${phone}\nMessage: ${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Phone:</strong> ${phone}</p>
             <p><strong>Message:</strong> ${message}</p>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Submitted Successfully!!", contact },
      { status: 202 }
    );

  } catch (ex) {
    console.error(ex);
    return NextResponse.json(
      { Message: "Failed to submit, Try again Later!" },
      { status: 500 }
    );
  }
}

