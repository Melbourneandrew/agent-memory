import { ASSISTANT_MODULE_NAME } from "./assistant";
import { BACKBOARD_MODULE_NAME } from "./backboard";
import { CONFIG_MODULE_NAME } from "./config";
import { UTILS_MODULE_NAME } from "./utils";

describe("core package bootstrap", () => {
  it("exposes baseline module markers", () => {
    expect(CONFIG_MODULE_NAME).toBe("config");
    expect(BACKBOARD_MODULE_NAME).toBe("backboard");
    expect(ASSISTANT_MODULE_NAME).toBe("assistant");
    expect(UTILS_MODULE_NAME).toBe("utils");
  });
});
