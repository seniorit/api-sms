import dotenv from 'dotenv'; 
dotenv.config();

import { MemoryDB, createBot, createFlow, createProvider } from "@bot-whatsapp/bot";
import { BaileysProvider } from "@bot-whatsapp/provider-baileys";
import { addKeyword } from '@bot-whatsapp/bot';
import { mediaMessage, normalMessage } from './messageHandler.js';

const flowBienvenida = addKeyword("Hola").addAnswer(
  `Bienvenido al Sistema`
);
const flowServicios = addKeyword("Servicios").addAnswer(
  ""
);


const main = async () => {
  const provider = createProvider(BaileysProvider);

  provider.initHttpServer(10000);

  normalMessage(provider);

  mediaMessage(provider);

  createBot({
    flow: createFlow([flowBienvenida]),
    database: new MemoryDB(),
    provider,
  });
};

main();
