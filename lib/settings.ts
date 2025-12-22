// lib/settings.ts
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

let cachedSettings: any = null;

export const getSettings = unstable_cache(
  async () => {
    return await prisma.settings.findFirst();
  },
  [], // empty key since it always returns the same
  {
    revalidate: 60, // revalidate every 60 seconds
  }
);



export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}


