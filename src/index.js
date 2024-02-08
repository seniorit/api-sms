import { MemoryDB, createBot, createFlow, createProvider } from "@bot-whatsapp/bot";
import { BaileysProvider } from "@bot-whatsapp/provider-baileys";
//
import { normalMessage, mediaMessage } from './messageHandler.js';
import { flowBienvenida } from './controlFlow.js';

const main = async () => {
  const provider = createProvider(BaileysProvider);
  provider.initHttpServer(3002);
  normalMessage(provider);
  mediaMessage(provider);

  createBot({
    flow: createFlow([flowBienvenida]),
    database: new MemoryDB(),
    provider,
  });
};

main();