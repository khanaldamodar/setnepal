import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  await prisma.settings.create({
    data: {
      companyName: "WiredYatra Technologies",
      slogan: "Innovating the Future",
      aboutShort: "We build modern web and mobile experiences.",
      about: "WiredYatra is a digital company offering website, app, and graphic design services inspired by creativity and technology.",
      phone1: "+9779866437014",
      phone2: "+9779800000000",
      email1: "info@wiredyatra.com",
      email2: "support@wiredyatra.com",
      address: "Buddhabhumi - 04, Buddhi",
      city: "Kathmandu",
      postalCode: "44600",
      logo: "https://example.com/logo.png",
      favicon: "https://example.com/favicon.ico",
      facebook: "https://facebook.com/wiredyatra",
      instagram: "https://instagram.com/wiredyatra",
      linkedin: "https://linkedin.com/company/wiredyatra",
      github: "https://github.com/wiredyatra",
      website: "https://wiredyatra.com",
    },
  })
}

main()
  .then(() => console.log(" Settings table seeded"))
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
