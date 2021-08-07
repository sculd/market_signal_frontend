const mockEnvs = (envs) => {
  process.env = Object.assign(process.env, {
    REACT_APP_AUTH0_DOMAIN: "test-domain.com",
    REACT_APP_AUTH0_CLIENT_ID: '123',
    ...envs,
  });  
};

const OLD_ENV = process.env;

describe("The config module", () => {
  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  afterEach(() => {
    jest.resetModules();
  });

  it("should omit the audience if not in the config json", () => {
    mockEnvs();

    const { getConfig } = require("../config");

    expect(getConfig().audience).not.toBeDefined();
  });

  it("should omit the audience if left at a default value", () => {
    mockEnvs({ REACT_APP_AUTH0_AUDIENCE: "YOUR_API_IDENTIFIER" });

    const { getConfig } = require("../config");

    expect(getConfig().audience).not.toBeDefined();
  });

  it("should return the audience if specified", () => {
    mockEnvs({ REACT_APP_AUTH0_AUDIENCE: "test-api" });

    const { getConfig } = require("../config");

    expect(getConfig().audience).toEqual("test-api");
  });
});
