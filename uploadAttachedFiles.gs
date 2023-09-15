const clientPaymentPrevInvoice  = "COMPROBANTE COBRO A CLIENTES con factura previa - Adjuntá la documentación relativa al pago del cliente (comprobante, retenciones, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "

const keyWordForDocuments       = "Adjuntá"

function uploadAttachedFiles(){
    var form = FormApp.openById(formId);
    var formResponses = form.getResponses();
    var formResponse = formResponses[formResponses.length - 1]

    var itemResponses = formResponse.getItemResponses();
    var destinationFolderId = ""

    for (var j = 0; j < itemResponses.length; j++) {
        let itemResponse = itemResponses[j];
        let title        = itemResponse.getItem().getTitle();
        if (title.includes(keyWordForDocuments)){
            switch(title){
                case clientInvoiceSend:
                case clientInvoiceNoSend:
                case clientPayment:
                case clientDocsPayment:
                case clientPaymentPrevInvoice:
                case clientDocsPrevInvoice:
                    destinationFolderId = searchFolderId("Cobranzas")
                    makeFilesCopy(itemResponse.getResponse(), destinationFolderId);
                    break;
                default:
                    destinationFolderId = searchFolderId("Pagos")
                    makeFilesCopy(itemResponse.getResponse(), destinationFolderId);
                    break;
            }
        }
    }
}