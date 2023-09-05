const transactionTypeQuestionTitle      = "¿Qué tipo de transacción querés realizar?"
const sendInvoiceChoice                 = 'Envío de factura a clientes'
const invoiceAttachQuestionTitle        = 'ENVÍO FACTURA - Adjuntá la factura a enviar'
const clientToSendQuestionTitle         = 'Seleccioná el cliente al que enviarle la factura'
const customMailContentQuestionTitle    = "En caso de querer modificar el contenido del mail que se enviará a tu cliente, escribí acá el nuevo texto a incluir. \nEl mensaje por defecto, si se deja vacía esta respuesta, se muestra acá."


function sendInvoiceEmailToClient(){
    var form = FormApp.openById(formId);
    var formResponses = form.getResponses();
    var formResponse = formResponses[formResponses.length - 1]

    var itemResponses = formResponse.getItemResponses();
    var sendEmail = false;

    for (var j = 0; j < itemResponses.length; j++) {
        let itemResponse = itemResponses[j];
        let title        = itemResponse.getItem().getTitle();
        if (title == transactionTypeQuestionTitle){
            var transactionType = itemResponse.getResponse();
            Logger.log('Transaction type : "%s"', transactionType)
            if (transactionType == sendInvoiceChoice){
                sendEmail = true;
            } else {
                break;
            }
        } else if (title == clientToSendQuestionTitle) {
            var selectedClient = itemResponse.getResponse();
            Logger.log('Selected client is : "%s"', selectedClient)
        } else if (title == invoiceAttachQuestionTitle){
            var invoicesId = itemResponse.getResponse();
            Logger.log('Invoices to attach Id: "%s"', invoicesId)
        } else if (title == customMailContentQuestionTitle){
            var customMailContent = itemResponse.getResponse();
            Logger.log('Custom mail content: "%s"', customMailContent)
        }
    }

    Logger.log('Send Invoice Email? %s ', sendEmail)

    if (!sendEmail){
        return
    }

    sendEmailToClient(selectedClient, invoicesId, customMailContent)

}

function getClientEmail(clientName){
    const query = 'SELECT contact_email FROM '
                + '`' + bqProjectId + '.' + bqDataset + '.' + bqCrmTableName + '`'
                 +'WHERE counterpart = "' + clientName + '"';


    var rows = runQuery(query)

    var data = rowsToList(rows, "No se encontró el cliente en el CRM")

    var clientEmail = data[0];

    Logger.log("clientEmail is: " + clientEmail)

    return clientEmail
}

function sendEmailToClient( selectedClient, invoicesId, customMailContent){

    var subject     = `Factura ` + userName + ` - ` + selectedClient;
    var body        = getEmailBody(customMailContent, selectedClient);
    var clientEmail = getClientEmail(selectedClient);
    var attachment  = getAttachmentsFromFileIds(invoicesId);

    GmailApp.sendEmail(clientEmail, subject, '', {
      cc          : userEmail,
      bcc         : internalEmail,
      htmlBody    : body,
      attachments : attachment,
    })

    Logger.log("Se notificó al cliente : " + selectedClient);

}


function getAttachmentsFromFileIds(fileIds){
    blobList = [];
    for (var i = 0; i < fileIds.length; i++) {
        let file = DriveApp.getFileById(fileIds[i]);
        blobList.push(file.getBlob());
    }
    return blobList;
}

function getEmailBody(customMailContent, clientName){
    let emoji_html = "&#128075;"
    let defaultBody = `Hola ${emoji_html}, <BR><BR>`
                + `Le enviamos la nueva factura generada por ` + userName + ` <BR><BR>`
                + `¡Muchas gracias! <BR><BR>`
                + `El equipo de SIP.`;


    if (customMailContent){
        customMailContent += getFiliUrlWithUtm(clientName);
        return customMailContent.replaceAll("\n", "<BR>");
    }

    defaultBody += getFiliUrlWithUtm(clientName);

    return defaultBody;

}