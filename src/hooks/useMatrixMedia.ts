import { useSessionStore } from "@/stores/session";

export function useMatrixMedia() {
  const session = useSessionStore();

  async function fetchMedia(mxc: string): Promise<Blob> {
    const url = session.client?.mxcUrlToHttp(
      mxc,
      undefined,
      undefined,
      undefined,
      false,
      true,
      true
    );
    if (!url) throw new Error("Invalid MXC URL");
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (!res.ok) throw new Error("Media fetch failed");
    return await res.blob();
  }

  async function getObjectUrl(mxc: string): Promise<string> {
    const blob = await fetchMedia(mxc);
    return URL.createObjectURL(blob);
  }

  async function downloadFile(mxc: string, filename: string) {
    const blob = await fetchMedia(mxc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  return { getObjectUrl, downloadFile };
}

