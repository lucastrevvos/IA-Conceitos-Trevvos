import { simpleChat } from "./services/ai/chatService.js";

async function run() {
  const reply = await simpleChat({
    systemPrompt:
      "Você é um assistente que responde de forma curta e objetiva.",
    userMessage: "Explique em uma frase o que é DDD e TDD",
  });

  console.log("Resposta da IA:");
  console.log(reply);
}

run().catch((err) => {
  console.error("Erro ao executar exemplo simples:", err);
});
