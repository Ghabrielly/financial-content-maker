// Testes para o arquivo cadastro.js
// Use: npm install --save-dev jest
// Execute: npm test

describe("Funções de Cadastro", () => {
  
  // Teste da função validarSenhas
  describe("validarSenhas", () => {
    test("deve retornar true quando senhas coincidem", () => {
      expect(validarSenhas("senha123", "senha123")).toBe(true);
    });

    test("deve retornar false quando senhas não coincidem", () => {
      expect(validarSenhas("senha123", "senha456")).toBe(false);
    });

    test("deve retornar true com senhas vazias", () => {
      expect(validarSenhas("", "")).toBe(true);
    });
  });

  // Mock para testes da função cadastrarUsuario
  describe("cadastrarUsuario", () => {
    beforeEach(() => {
      // Mock do fetch
      global.fetch = jest.fn();
      // Mock do alert
      global.alert = jest.fn();
      // Mock do console.log
      jest.spyOn(console, "log").mockImplementation(() => {});
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("deve alertar erro quando senhas não coincidem", async () => {
      await cadastrarUsuario("João", "joao@email.com", "senha123", "senha456");
      expect(global.alert).toHaveBeenCalledWith("As senhas não coincidem!");
    });

    test("deve fazer fetch com dados corretos", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Sucesso" })
      });

      // Mock do window.location.origin
      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:8080" },
        writable: true
      });

      await cadastrarUsuario("João", "joao@email.com", "senha123", "senha123");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/register",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        })
      );
    });

    test("deve alertar sucesso quando resposta é ok", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Sucesso" })
      });

      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:8080" },
        writable: true
      });

      await cadastrarUsuario("João", "joao@email.com", "senha123", "senha123");

      expect(global.alert).toHaveBeenCalledWith("Usuário cadastrado com sucesso!");
    });

    test("deve alertar erro quando resposta não é ok", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Email já cadastrado" })
      });

      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:8080" },
        writable: true
      });

      await cadastrarUsuario("João", "joao@email.com", "senha123", "senha123");

      expect(global.alert).toHaveBeenCalledWith("Erro: Email já cadastrado");
    });

    test("deve alertar erro de conexão quando fetch falha", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:8080" },
        writable: true
      });

      await cadastrarUsuario("João", "joao@email.com", "senha123", "senha123");

      expect(global.alert).toHaveBeenCalledWith("Não foi possível conectar ao servidor.");
    });
  });
});
