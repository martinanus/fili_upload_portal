
const sendReceiptChoice                 = 'Envío de comprobante de pago a proveedor'

const invoiceMatchQuestionTitle         = "Seleccioná la factura a la que se vincula el pago";
const paymentWInvoiceAttachQuestionTitle = 'ENVÍO COMPROBANTE DE PAGO - Adjuntá el comprobante de pago a enviar'

const customProviderMailQuestionTitle   = "En caso de querer modificar el contenido del mail que se enviará a tu proveedor, escribí acá el nuevo texto a incluir. \nEl mensaje por defecto, si se deja vacía esta respuesta, se muestra acá."


function sendReceiptMailToProvider(){
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
            if (transactionType == sendReceiptChoice){
                sendEmail = true;
            } else {
                break;
            }
        } else if (title == invoiceMatchQuestionTitle) {
            var invoiceMatch = itemResponse.getResponse();
            var selectedProvider = getProviderFromInvoice(invoiceMatch);
            Logger.log('Selected provider is : "%s"', selectedProvider)
        }
        else if (title == paymentWInvoiceAttachQuestionTitle) {
            var invoicesId = itemResponse.getResponse();
            Logger.log('Invoices to attach Id: "%s"', invoicesId)
        } else if (title == customProviderMailQuestionTitle){
            var customMailContent = itemResponse.getResponse();
            Logger.log('Custom mail content: "%s"', customMailContent)
        }
    }

    Logger.log('Send Receipt Email? %s ', sendEmail)

    if (!sendEmail){
        return
    }
    var providerLanguage = getCounterpartLanguage(selectedProvider);

    sendEmailToCounterpart(selectedProvider, providerLanguage, invoicesId, customMailContent)

}


