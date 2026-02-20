# Project Analysis Report

**Date:** 2025-12-25  
**Project:** Set Nepal E-commerce Platform

---

## 1. Package Creation Analysis

### Current Implementation

**Location:** `/admin/packages/add`

**Features:**

- Admin can create packages by combining multiple products
- UI includes product selection with search and category filtering
- UI shows quantity input for each selected product
- Package info: name, price, discount, description, image, category

**Issue Identified:**
The UI has quantity fields for products (line 324-333 in `add/page.tsx`), but:

1. **The quantity is NOT sent to the backend** (line 134 comment: "// qty is UI only for now")
2. **The database schema doesn't support it** - The `Package` model has a many-to-many relation with `Product` without a join table

### Database Schema Analysis

```prisma
model Package {
  id           Int       @id @default(autoincrement())
  name         String
  description  String?
  price        Float
  discount     Float?    @default(0)
  stock        Int       @default(0)  // <-- Overall package stock
  imageUrl     String?
  isFeatured   Boolean   @default(false)
  isActive     Boolean   @default(true)
  categoryId   Int?
  createdById  Int?
  products     Product[] @relation("PackageProducts") // <-- Simple many-to-many
}
```

**Problem:** The current schema uses Prisma's implicit many-to-many, which doesn't allow storing quantity per product.

### Solution Required

To properly support product quantities in packages, we need:

1. **Create a join table model** `PackageProduct`:

```prisma
model PackageProduct {
  id          Int      @id @default(autoincrement())
  packageId   Int
  package     Package  @relation(fields: [packageId], references: [id], onDelete: Cascade)
  productId   Int
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity    Int      @default(1)

  @@unique([packageId, productId])
}
```

2. **Update Package model** to use explicit many-to-many
3. **Update Product model** to include the relation
4. **Update API route** to handle quantity data
5. **Update frontend** to send quantity with each product

---

## 2. Banks Settings Analysis

### Current Implementation

**Location:** `/admin/settings/banks`

**Current Features:**

- List all banks
- Add new bank (name + QR code)
- Edit existing bank
- Delete bank
- QR code image upload

**Database Schema:**

```prisma
model Banks {
  id   Int     @id @default(autoincrement())
  name String
  qr   String?
}
```

### Missing Fields Required

According to requirements, the banks page needs:

1. ✅ Bank name (exists)
2. ❌ Account number (missing)
3. ❌ Business name (missing)
4. ❌ Branch (missing)
5. ✅ QR code (exists)

### Solution Required

1. **Update database schema** to add missing fields
2. **Update API routes** (POST and PUT)
3. **Update frontend forms** (add and edit pages)
4. **Update table columns** in the listing page

---

## 3. Implementation Plan

### Phase 1: Fix Banks Settings (Simpler, won't affect other pages)

1. Update `prisma/schema.prisma` - add fields to Banks model
2. Run migration
3. Update `/api/banks/route.ts` - handle new fields in POST
4. Update `/api/banks/[id]/route.ts` - handle new fields in PUT
5. Update `/admin/settings/banks/add/page.tsx` - add input fields
6. Update `/admin/settings/banks/edit/[id]/page.tsx` - add input fields
7. Update `/admin/settings/banks/page.tsx` - show new columns

### Phase 2: Fix Package-Product Quantity (More complex)

1. Update `prisma/schema.prisma` - create PackageProduct join table
2. Run migration
3. Update `/api/packages/route.ts` - handle quantity data
4. Update `/api/packages/[id]/route.ts` - handle updates
5. Update `/admin/packages/add/page.tsx` - send quantity to API
6. Update `/admin/packages/edit/[id]/page.tsx` - handle quantity

---

## 4. Risk Assessment

### Banks Changes

- **Risk Level:** LOW
- **Impact:** Isolated to banks feature only
- **Migration:** Safe - adding new optional fields

### Package Changes

- **Risk Level:** MEDIUM-HIGH
- **Impact:** Affects package creation, editing, display, and potentially orders
- **Migration:** Requires data migration if existing packages exist
- **Dependencies:** Need to check if packages are used in orders/cart

---

## 5. Recommendations

1. **Start with Banks**: It's simpler and isolated
2. **Test Package changes thoroughly**: This affects core business logic
3. **Consider data migration**: If production has existing packages
4. **Update documentation**: For both features after implementation
