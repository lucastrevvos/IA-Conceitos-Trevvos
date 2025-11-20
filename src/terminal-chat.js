import readline from "node:readline";
import { logger } from "./core/logger.js";
import { simpleChat } from "./services/ai/chatService.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  logger.info("Iniciando Trevvos IA - Terminal Chat", { context: "cli" });

  console.log("=== Trevvos IA — Chat via Terminal (Architect Mode) ===");
  console.log('Digite sua mensagem ou "sair" para encerrar.\n');

  while (true) {
    const userInput = await ask("Você: ");

    const mensagem = userInput.trim();

    if (!mensagem) continue;

    if (mensagem.toLowerCase() === "sair") {
      break;
    }

    console.log("\nIA pensando... \n");

    try {
      const reply = await simpleChat({
        systemPrompt:
          "Você é um assistente técnico da Trevvos, direto, amigável, em PT-BR, ajudando um dev a testar IA via terminal.",
        userMessage: mensagem,
      });

      console.log("IA:");
      console.log(reply);
      console.log();
    } catch (error) {
      logger.error("Falha ao obter resposta da IA no terminal", {
        error: error.message,
      });

      console.log(
        "Ocorreu um problema ao falar com a IA. Tente novamente em instantes.",
      );
    }
  }

  logger.info("Encerrando Terminal Chat", { context: "cli" });
  console.log("Chat encerrado. Valeu!");
  rl.close();
}

main().catch((err) => {
  logger.error("Erro falta no Terminal Chat", { error: err.message });
  process.exit(1);
});
