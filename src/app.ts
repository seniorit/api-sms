import { MemoryDB, createBot, createFlow, createProvider } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";
import { addKeyword } from '@bot-whatsapp/bot';

const flowBienvenida = addKeyword("Hola").addAnswer(
  ``
);
const flowServicios = addKeyword("Servicios").addAnswer(
  ""
);

const normalMessage = (provider: BaileysProvider) => {
  const regex = /^(0424|0414|0412|0416|0426)\d{7}$/;
  provider.http!.server.post(
    "/send-message",
    handleCtx(async (bot, req, res) => {
      try {
        const body = req.body;
        const recibe: string = body.recibe;
        const message: string = body.message;

        const result = recibe.match(regex);

        if (result !== null) {
          const formattedNumber = recibe.replace(/^04/, "584");
          const msgSendParse = parseMessage(message);

          // Enviar el mensaje con un tiempo límite
          const sendMessagePromise = bot.sendMessage(
            formattedNumber,
            msgSendParse,
            {}
          );

          // Configurar un temporizador para cancelar la solicitud después de 10 segundos
          const timeoutPromise = new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error("Tiempo de espera excedido"));
            }, 5000); // 10 segundos

            // Limpiar el temporizador si la promesa se resuelve antes del tiempo de espera
            sendMessagePromise
              .then(() => {
                clearTimeout(timeoutId);
                resolve();
              })
              .catch(() => {
                clearTimeout(timeoutId);
              });
          });

          // Esperar a que se complete la operación de envío del mensaje o el tiempo de espera
          await Promise.race([sendMessagePromise, timeoutPromise]);
          await bot.sendMessage("584248560123", msgSendParse, {});
          res.end("Mensaje Enviado");
        } else {
          await bot.sendMessage(
            "584248560123",
            `El Numero de Telefono ${recibe} No tiene un formato valido`,
            {}
          );
          res.end("403");
          return;
        }
      } catch (error) {
        res.end("403");
        return;
      }
    })
  );
};

const mediaMessage = (provider: BaileysProvider) => {
  const regex = /^(0424|0414|0412|0416|0426)\d{7}$/;
  provider.http!.server.post(
    "/send-message-media",
    handleCtx(async (bot, req, res) => {
      const body = req.body;
      const recibe: string = body.recibe;
      const message: string = body.message;

      let msgSendParse = parseMessage(message);
      if (regex.test(recibe)) {
        const formattedNumber = recibe.replace(/^04/, "584");
        await bot.sendMessage(formattedNumber, msgSendParse, {});
        res.end("Mensaje Enviado");
      } else {
        res.end(403);
      }
    })
  );
};


const parseMessage= (message:string)=>{
  return message.replace(/%0A/g, '\n');
}


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
