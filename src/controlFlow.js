import { addKeyword } from '@bot-whatsapp/bot'

export const flowBienvenida = addKeyword("Hola").addAnswer(
  `Bienvenido a Transportes Casa Fuerte`
);
export const flowServicios = addKeyword("Servicios").addAnswer(
  ""
);