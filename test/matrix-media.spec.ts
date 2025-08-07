import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import type { MatrixClient } from "matrix-js-sdk";
import { useMatrixMedia } from "@/hooks/useMatrixMedia";
import { useSessionStore } from "@/stores/session";

describe("useMatrixMedia", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("downloads with auth header", async () => {
    const session = useSessionStore();
    session.accessToken = "token";
    session.client = {
      mxcUrlToHttp: vi.fn().mockReturnValue("http://file"),
    } as unknown as MatrixClient;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["data"])),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const anchor = { click: vi.fn() } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => anchor);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => anchor);
    (URL as unknown as { createObjectURL: () => string }).createObjectURL = vi
      .fn()
      .mockReturnValue("blob:url");
    (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = vi.fn();

    const { downloadFile } = useMatrixMedia();
    await downloadFile("mxc://s/id", "a.txt");

    expect(fetchMock).toHaveBeenCalledWith("http://file", {
      headers: { Authorization: "Bearer token" },
    });
    expect(anchor.click).toHaveBeenCalled();
  });
});

