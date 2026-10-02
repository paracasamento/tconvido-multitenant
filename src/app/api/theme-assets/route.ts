import { NextResponse } from "next/server";
import { signGiftImage } from "@/lib/storage";

const SLOT = "(?:background|top_left|top_right|top_full|bottom_left|bottom_right|bottom_full|divider_horizontal|frame)";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "";
  const pattern = new RegExp(
    `^theme-kits/[a-f0-9-]+/${SLOT}/[a-f0-9-]+\\.(?:jpg|png|webp)$`,
    "i"
  );

  if (path.length < 20 || path.length > 600 || !pattern.test(path)) {
    return NextResponse.json({ message: "Imagem inválida." }, { status: 400 });
  }

  const signedUrl = await signGiftImage(path);
  if (!signedUrl) {
    return NextResponse.json({ message: "Imagem não encontrada." }, { status: 404 });
  }

  const response = NextResponse.redirect(signedUrl, 307);
  response.headers.set("Cache-Control", "public, max-age=3000, stale-while-revalidate=300");
  return response;
}
