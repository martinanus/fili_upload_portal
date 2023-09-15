
function notifyInternally(){
  let subject = userName + ` - Nueva respuesta en Portal de Carga Interno`;
  let message = `Estimado/a, <BR><BR>`
              + `Se registró una nueva respuesta en el Portal de Carga Interno de `
              + userName + ` <BR><BR>`
              + `El equipo de Fili.`;

  GmailApp.sendEmail(internalEmail, subject, '', {
    htmlBody    : message,
  })

  Logger.log("Se notificó de una nueva respuesta a: " + internalEmail);

  return;
}

