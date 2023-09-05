
const sendInvoiceChoice                 = 'Envío de factura a clientes'
const invoiceAttachQuestionTitle        = 'ENVÍO FACTURA - Adjuntá la factura a enviar'
const clientToSendQuestionTitle         = 'Seleccioná el cliente al que enviarle la factura'
const customClientMailQuestionTitle     = "En caso de querer modificar el contenido del mail que se enviará a tu cliente, escribí acá el nuevo texto a incluir. \nEl mensaje por defecto, si se deja vacía esta respuesta, se muestra acá."

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
        } else if (title == customClientMailQuestionTitle){
            var customMailContent = itemResponse.getResponse();
            Logger.log('Custom mail content: "%s"', customMailContent)
        }
    }

    Logger.log('Send Invoice Email? %s ', sendEmail)

    if (!sendEmail){
        return
    }

    sendEmailToCounterpart(selectedClient, invoicesId, customMailContent, "Client")

}

