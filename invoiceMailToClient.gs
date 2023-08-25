
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
        } else if (title == clientSelectionQuestionTitle) {
            var selectedClient = itemResponse.getResponse();
            Logger.log('Selected client is : "%s"', selectedClient)
        } else if (title == invoiceAttachQuestionTitle){
            var invoiceId = itemResponse.getResponse()[0];
            Logger.log('Invoice to attach Id: "%s"', invoiceId)
        } else if (title == customMailContentQuestionTitle){
            var customMailContent = itemResponse.getResponse();
            Logger.log('Custom mail content: "%s"', customMailContent)
        }
    }

    Logger.log('Send Invoice Email? %s ', sendEmail)

    if (!sendEmail){
        return
    }

    sendEmailToClient(selectedClient, invoiceId, customMailContent)

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

function sendEmailToClient( selectedClient, invoiceId, customMailContent){

    var subject     = `Factura ` + userName + ` - ` + selectedClient;
    var body        = getEmailBody(customMailContent, selectedClient);
    var clientEmail = getClientEmail(selectedClient);
    var attachment  = getAttachmentFromFileId(invoiceId);

    GmailApp.sendEmail(clientEmail, subject, '', {
      cc          : internalEmail,
      htmlBody    : body,
      attachments : attachment,
    })

    Logger.log("Se notificó al cliente : " + selectedClient);

}


function getAttachmentFromFileId(fileId){

    const file = DriveApp.getFileById(fileId);
    const theBlob = file.getBlob();

    return [theBlob]

}

function getEmailBody(customMailContent, clientName){
    let emoji_html = "&#128075;"
    let defaultBody = `Hola ${emoji_html}, <BR><BR>`
                + `Le enviamos la nueva factura generada por ` + userName + ` <BR><BR>`
                + `¡Muchas gracias! <BR><BR>`
                + `El equipo de Fili.`;


    if (customMailContent){
        customMailContent += getFiliUrlWithUtm(clientName);
        return customMailContent.replaceAll("\n", "<BR>");
    }

    defaultBody += getFiliUrlWithUtm(clientName);

    return defaultBody;

}