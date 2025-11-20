import 'dotenv/config'
import OpenAI from 'openai'

const client = new OpenAI({
    apiKey: process.env.OPEN_API_KEY
})

async function run() {
    const response = await client.responses.create({
        model: 'gpt-4o-mini',
        input: "Fala comigo, IA! Me dá uma resposta simples só pra eu testar o backend"
    })

    console.log('Resposta da IA')
    console.log(response.output_text)
}

run().catch(console.error)