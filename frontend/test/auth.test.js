// Testes para os arquivos de autenticação (auth.js e login.js)

describe("Gerenciamento de Token (auth.js)", () => {
  
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  describe("salvarToken", () => {
    test("deve salvar token no localStorage", () => {
      salvarToken("meu-token-123");
      expect(localStorage.getItem("authToken")).toBe("meu-token-123");
    });
  });

  describe("obterToken", () => {
    test("deve obter token do localStorage", () => {
      localStorage.setItem("authToken", "token-teste");
      expect(obterToken()).toBe("token-teste");
    });

    test("deve retornar null quando não há token", () => {
      expect(obterToken()).toBeNull();
    });
  });

  describe("removerToken", () => {
    test("deve remover token do localStorage", () => {
      localStorage.setItem("authToken", "token-teste");
      removerToken();
      expect(localStorage.getItem("authToken")).toBeNull();
    });
  });

  describe("estaAutenticado", () => {
    test("deve retornar true quando há token", () => {
      localStorage.setItem("authToken", "token-teste");
      expect(estaAutenticado()).toBe(true);
    });

    test("deve retornar false quando não há token", () => {
      expect(estaAutenticado()).toBe(false);
    });
  });

  describe("obterHeadersComAuth", () => {
    test("deve incluir Authorization header quando há token", () => {
      localStorage.setItem("authToken", "token-123");
      const headers = obterHeadersComAuth();
      expect(headers.Authorization).toBe("Bearer token-123");
    });

    test("deve incluir headers básicos quando não há token", () => {
      const headers = obterHeadersComAuth();
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers["Accept"]).toBe("application/json");
      expect(headers.Authorization).toBeUndefined();
    });
  });
});

describe("Login (login.js)", () => {
  
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
    global.alert = jest.fn();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fazerLogin", () => {
    test("deve fazer fetch com dados corretos", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "token-novo-123", user: { id: 1, name: "João" } })
      });

      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:8080" },
        writable: true
      });

      await fazerLogin("joao@email.com", "senha123");

      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[0]).toBe("http://localhost:8080/api/login");
      const options = fetchCall[1];
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
        "Accept": "application/json"
      });

      const body = JSON.parse(options.body);
      expect(body.email).toBe("joao@email.com");
      expect(body.password).toBe("senha123");
      expect(body.device_name).toBeDefined();
    });

    test("deve salvar token quando login é bem-sucedido", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "token-novo-123", user: { id: 1 } })
      });

      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:8080" },
        writable: true
      });

      await fazerLogin("joao@email.com", "senha123");

      expect(localStorage.getItem("authToken")).toBe("token-novo-123");
    });

    test("deve alertar sucesso quando login é bem-sucedido", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "token-novo-123", user: { id: 1 } })
      });

      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:8080" },
        writable: true
      });

      await fazerLogin("joao@email.com", "senha123");

      expect(global.alert).toHaveBeenCalledWith("Login realizado com sucesso!");
    });

    test("deve alertar erro quando credenciais são inválidas", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Credenciais inválidas" })
      });

      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:8080" },
        writable: true
      });

      await fazerLogin("joao@email.com", "senhaerrada");

      expect(global.alert).toHaveBeenCalledWith("Erro: Credenciais inválidas");
    });

    test("deve alertar erro de conexão quando fetch falha", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:8080" },
        writable: true
      });

      await fazerLogin("joao@email.com", "senha123");

      expect(global.alert).toHaveBeenCalledWith("Não foi possível conectar ao servidor.");
    });
  });
});
