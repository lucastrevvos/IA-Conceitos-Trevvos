import "dotenv/config";
import OpenAI from "openai";
import readline from "node:readline";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("=== Trevvos IA - Chat via Terminal ===");
  console.log('Digite sua mensagem ou "sair" para encerrar.\n');

  while (true) {
    const userInput = await ask("Você: ");

    const mensagem = userInput.trim();

    if (!mensagem) continue;

    if (mensagem.toLowerCase() === "sair") {
      break;
    }

    console.log("\nIA pensagendo... \n");

    try {
      const response = await client.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content:
              "Você é um assistente técnico, direto e amigável, ajudando um desenvolvedor a testar IA no terminal.",
          },
          {
            role: "user",
            content: mensagem,
          },
        ],
      });

      console.log("IA:");
      console.log(response.output_text);
      console.log();
    } catch (error) {
      console.error("Erro ao chamar a OPENAI:", error.message);
      console.error();
    }
  }

  console.log("Chat encerrado. Valeu!");
  rl.close();
}

main().catch(console.error);
