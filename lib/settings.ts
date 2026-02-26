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
  },
);

export const getProducts = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  },
  ["products-list"],
  {
    revalidate: 60,
  },
);

export const getCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  },
  ["categories-list"],
  {
    revalidate: 60,
  },
);

export const getCertificates = unstable_cache(
  async () => {
    return await prisma.certificate.findMany();
  },
  ["certificates-list"],
  {
    revalidate: 60,
  },
);
