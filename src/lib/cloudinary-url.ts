export function cloudinaryThumbUrl(
  url?: string | null,
  size = 64
): string | null {
  if (!url) return null;
  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;
  const after = url.slice(index + marker.length);
  if (after.startsWith("c_fill") || after.startsWith("w_")) return url;
  return `${url.slice(0, index + marker.length)}c_fill,f_auto,g_face,h_${size},q_auto,w_${size}/${after}`;
}
