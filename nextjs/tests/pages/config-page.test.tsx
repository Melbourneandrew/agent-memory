import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mockReadLocalServerConfiguration = jest.fn();
const mockResolveServerConfiguration = jest.fn();

jest.mock("@/app/config/clear-config-form", () => ({
  ClearConfigurationForm: () => <div>ClearConfigurationForm</div>
}));

jest.mock("@/lib/server/core", () => ({
  readLocalServerConfiguration: () => mockReadLocalServerConfiguration(),
  resolveServerConfiguration: () => mockResolveServerConfiguration()
}));

import ConfigurationPage from "@/app/config/page";

describe("ConfigurationPage server component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders masked api key and assistant information", async () => {
    mockReadLocalServerConfiguration.mockReturnValue({
      values: {
        apiKey: "sk_live_1234",
        assistantId: "asst_123"
      }
    });
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_live_1234",
      assistantId: "asst_123"
    });

    const element = await ConfigurationPage({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("API Key");
    expect(html).toContain("********1234");
    expect(html).not.toContain("sk_live_1234");
    expect(html).toContain("Memory Bank ID");
    expect(html).toContain("asst_123");
  });

  test("shows auth required banner when effective api key is missing", async () => {
    mockReadLocalServerConfiguration.mockReturnValue({
      values: {
        apiKey: null,
        assistantId: null
      }
    });
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: null,
      assistantId: null
    });

    const element = await ConfigurationPage({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("Authentication required");
    expect(html).toContain("agent-memory config set api-key");
  });

  test("shows auto-create assistant message when local assistant id is missing", async () => {
    mockReadLocalServerConfiguration.mockReturnValue({
      values: {
        apiKey: "sk_live_1234",
        assistantId: null
      }
    });
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_live_1234",
      assistantId: null
    });

    const element = await ConfigurationPage({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("Will be auto-created on first memory operation.");
    expect(html).toContain("Effective Memory Bank ID: Not configured");
  });
});
