export function imageUrl(picId?: string): string {
  return `/api/media/image/${picId}?password=xxx`;
}

export function thumbnailUrl(picId?: string): string {
  return `/api/media/image/${picId}/thumbnail?password=xxx`;
}
