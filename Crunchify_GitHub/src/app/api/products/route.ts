import { NextResponse } from "next/server";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/db/store";
import { verifyAdminSession, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const featuredOnly = searchParams.get("featured") === "true";
    const activeOnly = searchParams.get("all") === "true" ? false : true;

    const products = await getProducts({
      categoryId,
      search,
      featuredOnly,
      activeOnly,
    });

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    if (!body.name || body.price === undefined || body.stock === undefined) {
      return NextResponse.json({ error: "Name, price and stock are required" }, { status: 400 });
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newProd = await createProduct({
      name: body.name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description: body.description || "",
      price: Number(body.price),
      stock: Number(body.stock),
      category_id: body.category_id || "c1000000-0000-0000-0000-000000000001",
      image_url: body.image_url || "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80",
      is_featured: Boolean(body.is_featured),
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      tags: Array.isArray(body.tags) ? body.tags : [],
    });

    return NextResponse.json({ success: true, product: newProd }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const updated = await updateProduct(body.id, {
      ...body,
      price: body.price !== undefined ? Number(body.price) : undefined,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const success = await deleteProduct(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
