const mockRedirect = jest.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
const mockRevalidatePath = jest.fn();
const mockWriteServerConfiguration = jest.fn();
const mockClearServerConfiguration = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

jest.mock("next/cache", () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}));

jest.mock("@/lib/server/core", () => ({
  writeServerConfiguration: (...args: unknown[]) =>
    mockWriteServerConfiguration(...args),
  clearServerConfiguration: (...args: unknown[]) =>
    mockClearServerConfiguration(...args),
}));

import {
  clearConfigurationAction,
  updateConfigurationAction,
} from "@/app/config/actions";

describe("config server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteServerConfiguration.mockReturnValue({
      path: "/tmp/.agent-memory/config.json",
      values: { apiKey: "sk_test", assistantId: "asst_123" },
    });
    mockClearServerConfiguration.mockReturnValue({
      path: "/tmp/.agent-memory/config.json",
      deleted: true,
    });
  });

  test("updateConfigurationAction validates field and value", async () => {
    const invalidField = new FormData();
    invalidField.set("field", "unknown");
    invalidField.set("value", "x");

    await expect(updateConfigurationAction(invalidField)).rejects.toThrow(
      "REDIRECT:/config?error=Unknown+configuration+field.",
    );

    const emptyApiKey = new FormData();
    emptyApiKey.set("field", "apiKey");
    emptyApiKey.set("value", " ");
    await expect(updateConfigurationAction(emptyApiKey)).rejects.toThrow(
      "REDIRECT:/config?error=API+key+cannot+be+empty.",
    );
  });

  test("updateConfigurationAction writes and redirects on success", async () => {
    const formData = new FormData();
    formData.set("field", "assistantId");
    formData.set("value", "asst_999");

    await expect(updateConfigurationAction(formData)).rejects.toThrow(
      "REDIRECT:/config?success=Memory+Bank+ID+saved.",
    );
    expect(mockWriteServerConfiguration).toHaveBeenCalledWith(
      { assistantId: "asst_999" },
      "local",
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/config");
  });

  test("clearConfigurationAction validates confirmation and clears config", async () => {
    const missingConfirm = new FormData();
    missingConfirm.set("confirm", "nope");
    await expect(clearConfigurationAction(missingConfirm)).rejects.toThrow(
      "REDIRECT:/config?error=Type+CLEAR+to+confirm+configuration+reset.",
    );

    const confirmed = new FormData();
    confirmed.set("confirm", "CLEAR");
    await expect(clearConfigurationAction(confirmed)).rejects.toThrow(
      "REDIRECT:/config?success=Local+configuration+cleared.+Effective+credentials+may+still+come+from+env%2Fglobal.",
    );
    expect(mockClearServerConfiguration).toHaveBeenCalledWith("local");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/config");
  });
});
