import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys'

export const normalMessage = provider => {
  const regex = /^(0424|0414|0412|0416|0426)\d{7}$/
  provider.http.server.post(
    '/send-message',
    handleCtx(async (bot, req, res) => {
      const messageOperator = req.body.remite
      try {
        const body = req.body
        const recibe = body.recibe
        const message = body.message

        const result = recibe.match(regex)

        if (result !== null) {
          const formattedNumber = recibe.replace(/^04/, '584')
          const msgSendParse = parseMessage(message)

          // Enviar el mensaje con un tiempo límite
          const sendMessagePromise = bot.sendMessage(
            formattedNumber,
            msgSendParse,
            {}
          )

          // Configurar un temporizador para cancelar la solicitud después de 10 segundos
          const timeoutPromise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('Tiempo de espera excedido'))
            }, 5000) // 10 segundos

            // Limpiar el temporizador si la promesa se resuelve antes del tiempo de espera
            sendMessagePromise
              .then(() => {
                clearTimeout(timeoutId)
                resolve()
              })
              .catch(() => {
                clearTimeout(timeoutId)
              })
          })

          // Esperar a que se complete la operación de envío del mensaje o el tiempo de espera
          await Promise.race([sendMessagePromise, timeoutPromise])
          await bot.sendMessage(messageOperator, msgSendParse, {})
          res.end('Mensaje Enviado')
        } else {
          await bot.sendMessage(
            messageOperator,
            `El Numero de Telefono ${recibe} No tiene un formato valido`,
            {}
          )
          res.end('403')
          return
        }
      } catch (error) {
        res.end('403')
        return
      }
    })
  )
}

export const mediaMessage = provider => {
  const regex = /^(0424|0414|0412|0416|0426)\d{7}$/
  provider.http.server.post(
    '/send-message-media',
    handleCtx(async (bot, req, res) => {
      const body = req.body
      const recibe = body.recibe
      const message = body.message

      let msgSendParse = parseMessage(message)
      if (regex.test(recibe)) {
        const formattedNumber = recibe.replace(/^04/, '584')
        await bot.sendMessage(formattedNumber, msgSendParse, {})
        res.end('Mensaje Enviado')
      } else {
        res.end(403)
      }
    })
  )
}

const parseMessage = message => {
  return message.replace(/%0A/g, '\n')
}

